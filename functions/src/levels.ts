import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { is } from 'typescript-is';
import { PatronStatus } from './rewards';

interface UserLevelInformation {
	name: string;
	levelCode: string;
	thumbnailIndex: number;
	imageLocalUrls: string[];
	shortDescription: string;
	description: string;
	difficulty: Difficulty;
	gameStyle: GameStyle;
	tags: UserLevelTag[];
}

export interface UserLevelDocData {
	name: string;
	id: string;
	uploadTime: number;
	editedTime: number;
	thumbnailUrl: string;
	imageUrls: string[];
	levelCode: string;
	makerUid: string;
	difficulty: Difficulty;
	gameStyle: GameStyle;
	numLikes: number;
	numDislikes: number;
	score: number;
	numComments: number;
	shortDescription: string;
	description: string;
	tags: UserLevelTag[];
	publicationStatus: 'Private' | 'Public' | 'Removed';
	removalMessage: string | undefined;
	epochDaysInPopularQueue: number[],
	epochDaysInMonthQueue: number[],
	isByPatron: boolean,
}

const userLevelTags = [
	'Standard',
	'Puzzle',
	'Music',
	'Autoscroll',
	'Speedrun',
	'Precision',
	'Auto',
	'Multiplayer',
	'Themed',
	'Boss Fight',
	'Glitch',
	'Technical',
	'Exploration',
	'Troll',
	'Story',
	'One Screen',
	'Kaizo',
	'Presentation',
] as const;

type Difficulty = 'Easy' | 'Normal' | 'Expert' | 'Super Expert';
type GameStyle = 'SMB1' | 'SMB3' | 'SMW' | 'NSMBU' | 'SM3DW';
type UserLevelTag = typeof userLevelTags[number];

const regularUploadDelayHr = 3;
const patronUploadDelayHr = 2;

export const publishLevel = functions.https.onCall(async (data: {
	level: UserLevelInformation, globalUrls: string[]
}, context) => {
	const level = data.level;
	if (!is<UserLevelInformation>(level)) throw new Error('Level data does not fit the schema.');
	if (level.imageLocalUrls.length === 0) throw new Error('Level data does not include an image.');
	if (!isValidLevelCode(level.levelCode)) throw new Error('Invalid course ID.');
	if (context.auth === undefined) throw new Error('User is not logged in.');

	const now = Date.now();
	const levelId = randomString(24);

	const popularQueueDays = getFutureEpochDays(5, now);
	const monthQueueDays = getFutureEpochDays(30, now);

	// Load Patron status to determine if the level gets featured in the Patrons section
	const userPrivDocRef = admin.firestore().doc(`/users/${context.auth.uid}/priv/access`);
	const userPrivDocSnap = await userPrivDocRef.get();
	if (!userPrivDocSnap.exists) throw new Error('User access data not found.');
	const userPrivData = userPrivDocSnap.data()!;
	const patronStatus = userPrivData.patronStatus as PatronStatus;

	await admin.firestore().runTransaction(async (t) => {
		// Update the users' last posted level time
		const userSocialDoc = admin.firestore().doc(`/users/${context.auth!.uid}/priv/social`);
		const userSocialDocSnap = await userSocialDoc.get();
		if (!userSocialDocSnap.exists) throw new Error('User social data does not exist.');
		const userSocialData = userSocialDocSnap.data()!;

		// Prevent frequent uploads
		const lastLevelUploadTime =	(userSocialData.lastLevelUploadTime as admin.firestore.Timestamp)
			.toDate().getTime();
		const uploadDelayHr = patronStatus === 'None' ? regularUploadDelayHr : patronUploadDelayHr;
		const uploadDelayMs = uploadDelayHr * 60 * 60 * 1000;
		console.log(lastLevelUploadTime, uploadDelayMs, now);
		if (now < lastLevelUploadTime + uploadDelayMs) throw Error('Levels are being uploaded too frequently.');

		const seconds = Math.floor(now / 1000);
		t.set(userSocialDoc, {
			lastLevelUploadTime: new admin.firestore.Timestamp(seconds, 0),
		}, { merge: true });

		// Construct the published level data structure
		const fullLevelData: UserLevelDocData = {
			name: level.name,
			levelCode: getFormattedCode(level.levelCode),
			shortDescription: level.shortDescription,
			description: level.description,
			gameStyle: level.gameStyle,
			difficulty: level.difficulty,
			tags: level.tags,
			id: levelId,
			uploadTime: now,
			editedTime: now,
			makerUid: context.auth!.uid,
			numLikes: 0,
			numDislikes: 0,
			score: 0,
			numComments: 0,
			publicationStatus: 'Public',
			removalMessage: '',
			imageUrls: data.globalUrls,
			thumbnailUrl: data.globalUrls[level.thumbnailIndex],
			epochDaysInPopularQueue: popularQueueDays,
			epochDaysInMonthQueue: monthQueueDays,
			isByPatron: patronStatus === 'Super Star',
		};

		const levelDocRef = admin.firestore().doc(`/levels/${levelId}`);
		t.set(levelDocRef, fullLevelData);
	});

	return levelId;
});

export const publishLevelEdits = functions.https.onCall(async (data: {
	levelId: string, level: UserLevelDocData, globalUrls: string[]
}, context) => {
	const level = data.level;
	if (!is<UserLevelInformation>(level)) throw new Error('Level data does not fit the schema.');
	if (level.imageLocalUrls.length === 0) throw new Error('Level data does not include an image.');
	if (!isValidLevelCode(level.levelCode)) throw new Error('Invalid course ID.');
	if (context.auth === undefined) throw new Error('User is not logged in.');

	const levelDocRef = admin.firestore().doc(`/levels/${data.levelId}`);
	const levelDocSnap = await levelDocRef.get();
	if (!levelDocSnap.exists) throw new Error('Level does not exist already.');
	const levelDocData = levelDocSnap.data() as UserLevelDocData;
	if (context.auth.uid !== levelDocData.makerUid) throw new Error('User does not own this level.');

	const now = Date.now();

	// Construct the published level data structure
	const fullLevelData: UserLevelDocData = {
		...level,
		levelCode: getFormattedCode(level.levelCode),
		id: data.levelId,
		editedTime: now,
		imageUrls: data.globalUrls,
		thumbnailUrl: data.globalUrls[level.thumbnailIndex],
	};

	await levelDocRef.set(fullLevelData, { merge: true });
});

/**
 * Generates a string of random alphanumeric characters.
 * @param length The length of the string.
 * @returns The generated string.
 */
function randomString(length: number) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random()
 * charactersLength));
	}
	return result;
}

/**
 * Determines if the level code is valid.
 * Valid level codes contain 9 alphanumeric characters,
 * end with an F, G, or H, and do not contain the characters O, I, or Z.
 * @param code The code to validate
 * @returns Whether or not the code is valid.
 */
function isValidLevelCode(code: string) {
	const alphanumericRegex = /([A-Z0-9])\w+/g;
	const alphanumericChunks = code.toUpperCase().match(alphanumericRegex);
	if (alphanumericChunks === null) return false;
	const normalizedCode = alphanumericChunks.join('');

	if (normalizedCode.length !== 9) return false;
	const forbiddenCharsRegex = /[OIZ]/g;
	const lastChar = normalizedCode.charAt(8);
	return !forbiddenCharsRegex.test(normalizedCode)
	&& (lastChar === 'F' || lastChar === 'G' || lastChar === 'H');
}

/**
 * Puts level codes in the XXX-XXX-XXX format.
 * @param code The level code to format.
 * @returns The formatted level code.
 */
function getFormattedCode(code: string) {
	const alphanumericRegex = /([A-Z0-9])\w+/g;
	const alphanumericChunks = code.toUpperCase().match(alphanumericRegex);
	if (alphanumericChunks === null) return '';
	const normalizedCode = alphanumericChunks.join('');
	return `${normalizedCode.substring(0, 3)}-${normalizedCode.substring(3, 6)}-${normalizedCode.substring(6, 9)}`;
}

/**
 * Generates an array of future epoch day values, counting today.
 * @param numDays The number of days to generate in advance.
 * @param time The current number of milliseconds since Jan 1st, 1970.
 * @returns The array of values.
 */
function getFutureEpochDays(numDays: number, time: number) {
	const millisPerDay = (1000 * 60 * 60 * 24);
	const dayOne = Math.floor(time / millisPerDay);
	const days = [];
	for (let i = 0; i < numDays; i++) {
		days.push(dayOne + i);
	}
	return days;
}
