import { CloudFunction } from '@data/types/FirebaseUtilTypes';
import { MCLevelDocData } from '@data/types/MCBrowserTypes';
import { db, functions } from '@scripts/site/FirebaseUtil';
import {
	collection, deleteDoc, doc, FieldPath, getDoc, getDocs, limit,
	OrderByDirection, query, QueryConstraint, startAfter, where, WhereFilterOp,
} from 'firebase/firestore/lite';
import { httpsCallable } from 'firebase/functions';

export interface QueryFilter {
	fieldPath: string | FieldPath;
	opStr: WhereFilterOp;
	value: any;
}

export interface QueryOrder {
	fieldPath: string | FieldPath;
	order: OrderByDirection;
}

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
	collectionPath: string = 'game-levels',
	isLink = false,
): Promise<MCLevelDocData[]> {
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
		async (levelDoc): Promise<MCLevelDocData | null> => {
			const mainDocData = levelDoc.data();

			if (!isLink) {
				return mainDocData as MCLevelDocData;
			}
			const levelDataDoc = await getDoc(doc(db, `game-levels/${levelDoc.id}`));
			if (!levelDataDoc.exists()) {
			// Delete dead links
				await deleteDoc(levelDoc.ref);
				return null;
			}
			return {
				...levelDataDoc.data(),
				id: levelDoc.id,
			} as MCLevelDocData;
		},
	));

	return rawLevelData.filter((levelData) => levelData !== null) as MCLevelDocData[];
}

/**
 * Retrieves a level from the database.
 * @param id The ID of the level.
 * @returns A UserLevel object containing level data or null if no data was found.
 */
export async function getLevel(id: string): Promise<MCLevelDocData | null> {
	const levelFn: CloudFunction<{
		levelId: string,
	}, MCLevelDocData> = httpsCallable(functions, 'getLevel');

	try {
		const data = (await levelFn({
			levelId: id,
		})).data;
		return data;
	} catch (e) {
		console.error(e);
		return null;
	}
}

/**
 * Deletes a level.
 * @param id The ID of the level to delete.
 */
export async function deleteLevel(id: string): Promise<void> {
	const levelRef = doc(db, `levels/${id}`);
	await deleteDoc(levelRef);
}
