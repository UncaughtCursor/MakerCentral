import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { is } from 'typescript-is';
import { resolve } from 'path';

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

interface UserLevel {
	name: string;
	id: string;
	uploadTime: number;
	editedTime: number;
	thumbnailUrl: string;
	imageUrls: string[];
	levelCode: string;
	makerName: string;
	makerUid: string;
	difficulty: Difficulty;
	gameStyle: GameStyle;
	numLikes: number;
	numComments: number;
	shortDescription: string;
	description: string;
	tags: UserLevelTag[];
	publicationStatus: 'Private' | 'Public' | 'Removed';
	removalMessage: string | undefined;
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
] as const;

type Difficulty = 'Easy' | 'Normal' | 'Expert' | 'Super Expert';
type GameStyle = 'SMB1' | 'SMB3' | 'SMW' | 'NSMBU' | 'SM3DW';
type UserLevelTag = typeof userLevelTags[number];

// eslint-disable-next-line import/prefer-default-export
export const publishLevel = functions.https.onCall(async (data: {
	level: UserLevel, globalUrls: string[]
}, context) => {
	const level = data.level;
	if (!is<UserLevelInformation>(level)) throw new Error('Level data does not fit the schema.');
	if (context.auth === undefined) throw new Error('User is not logged in.');
	// TODO: Level upload limit

	const now = Date.now();
	const levelId = randomString(24);

	// Construct the published level data structure
	const fullLevelData: UserLevel = {
		name: level.name,
		levelCode: level.levelCode,
		shortDescription: level.shortDescription,
		description: level.description,
		gameStyle: level.gameStyle,
		difficulty: level.difficulty,
		tags: level.tags,
		id: levelId,
		uploadTime: now,
		editedTime: now,
		makerName: 'User', // TODO: Saved display names
		makerUid: context.auth.uid,
		numLikes: 0,
		numComments: 0,
		publicationStatus: 'Public',
		removalMessage: '',
		imageUrls: data.globalUrls,
		thumbnailUrl: data.globalUrls[level.thumbnailIndex],
	};

	const levelDocRef = admin.firestore().doc(`/levels/${levelId}`);
	await levelDocRef.set(fullLevelData);
	return levelId;
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
