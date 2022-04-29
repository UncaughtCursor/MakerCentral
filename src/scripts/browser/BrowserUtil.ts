import { db } from '@scripts/site/FirebaseUtil';
import {
	collection, deleteDoc, doc, FieldPath, getDoc, getDocs, limit,
	OrderByDirection, query, QueryConstraint, startAfter, where, WhereFilterOp,
} from 'firebase/firestore/lite';

export interface QueryFilter {
	fieldPath: string | FieldPath;
	opStr: WhereFilterOp;
	value: any;
}

export interface QueryOrder {
	fieldPath: string | FieldPath;
	order: OrderByDirection;
}

export const userLevelTags = [
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
	'Link',
	'Minigame',
	'Meme',
] as const;

export interface UserLevel {
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

export type UserLevelTag = typeof userLevelTags[number];

export const gameStyles = [
	'SMB1', 'SMB3', 'SMW', 'NSMBU', 'SM3DW',
] as const;
export type GameStyle = typeof gameStyles[number];

export const difficulties = [
	'Easy', 'Normal', 'Expert', 'Super Expert',
] as const;
export type Difficulty = typeof difficulties[number];

/**
 * Runs a query through the set of levels.
 * @param queryConstraints The constraints to apply.
 * @param numLevels The number of levels to get.
 * @param lastLevelId (Optional) The last level ID retrieved (for pagination).
 * @param collectionPath (Optional) The path of the collection where the levels are.
 * @param isLink (Optional) Whether or not the documents contain actual level data or
 * just link to a level in levels/ by sharing the same document ID.
 * @returns The levels returned from the query.
 */
export async function queryLevels(
	queryConstraints: QueryConstraint[],
	numLevels: number,
	lastLevelId: string | null = null,
	collectionPath: string = 'levels',
	isLink = false,
): Promise<UserLevel[]> {
	const levelsRef = collection(db, collectionPath);
	const constraints = [
		...queryConstraints,
		limit(numLevels),
	];

	if (lastLevelId !== null) {
		const lastLevelDoc = await getDoc(doc(db, `${collectionPath}/${lastLevelId}`));

		constraints.push(
			startAfter(lastLevelDoc),
		);
	}

	const q = query(levelsRef, ...constraints);
	const queryDocs = await getDocs(q);

	const rawLevelData = await Promise.all(queryDocs.docs.map(
		async (levelDoc): Promise<UserLevel | null> => {
			const mainDocData = levelDoc.data();

			const makerDoc = await getDoc(doc(db, `users/${mainDocData.makerUid !== '' ? mainDocData.makerUid : 'deleted'}`));
			const makerName: string = makerDoc.exists()
				? makerDoc.data().name as string : 'Deleted User';

			if (!isLink) {
				return {
					...mainDocData,
					id: levelDoc.id,
					makerName,
				} as UserLevel;
			}
			const levelDataDoc = await getDoc(doc(db, `levels/${levelDoc.id}`));
			if (!levelDataDoc.exists()) {
			// Delete dead links
				await deleteDoc(levelDoc.ref);
				return null;
			}
			return {
				...levelDataDoc.data(),
				id: levelDoc.id,
			} as UserLevel;
		},
	));

	return rawLevelData.filter((levelData) => levelData !== null) as UserLevel[];
}

/**
 * Retrieves a level from the database.
 * @param id The ID of the level.
 * @returns A UserLevel object containing level data or null if no data was found.
 */
export async function getLevel(id: string): Promise<UserLevel | null> {
	const levelRef = doc(db, `levels/${id}`);
	const levelDoc = await getDoc(levelRef);
	if (!levelDoc.exists()) return null;
	const mainDocData = levelDoc.data();

	const makerDoc = await getDoc(doc(db, `users/${mainDocData.makerUid !== '' ? mainDocData.makerUid : 'deleted'}`));
	const makerName: string = makerDoc.exists()
		? makerDoc.data().name as string : 'Deleted User';

	return {
		...mainDocData,
		id: levelDoc.id,
		makerName,
	} as UserLevel;
}

/**
 * Deletes a level.
 * @param id The ID of the level to delete.
 */
export async function deleteLevel(id: string): Promise<void> {
	const levelRef = doc(db, `levels/${id}`);
	await deleteDoc(levelRef);
}
