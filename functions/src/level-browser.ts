import * as functions from 'firebase-functions';
import { MCLevelDocData, MCUserDocData, MCWorldDocData } from './data/types/MCBrowserTypes';
import { isInBackupMode, levelIndexName, meilisearch, popularLevelIndexName, superWorldIndexName, userIndexName } from './constants';

export const getLevel = functions.https.onCall(async (data: {
	levelId: string,
}): Promise<MCLevelDocData | null> => {
	const indexName = isInBackupMode ? popularLevelIndexName : levelIndexName;
	try {
		const level = await meilisearch.index(indexName).getDocument(data.levelId) as MCLevelDocData;
		return level;
	}
	catch (e) {
		console.error(e);
		return null;
	}
});

export const getUser = functions.https.onCall(async (data: {
	userId: string,
}): Promise<MCUserDocData | null> => {
	try {
		const user = await meilisearch.index(userIndexName).getDocument(data.userId) as MCUserDocData;
		return user;
	}
	catch (e) {
		console.error(e);
		return null;
	}
});

export const getWorld = functions.https.onCall(async (data: {
	userId: string,
}): Promise<MCWorldDocData | null> => {
	try {
		const world = await meilisearch.index(superWorldIndexName).getDocument(data.userId) as MCWorldDocData;
		return world;
	}
	catch (e) {
		console.error(e);
		return null;
	}
});
