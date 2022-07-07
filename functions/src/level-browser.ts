import * as functions from 'firebase-functions';
import { MCLevelDocData, MCUserDocData, MCWorldDocData } from './data/types/MCBrowserTypes';
import { levelIndexName, meilisearch, superWorldIndexName, userIndexName } from './constants';

export const getLevel = functions.https.onCall(async (data: {
	levelId: string,
}): Promise<MCLevelDocData | null> => {
	try {
		const level = await meilisearch.index(levelIndexName).getDocument(data.levelId);
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
		const user = await meilisearch.index(userIndexName).getDocument(data.userId);
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
		const world = await meilisearch.index(superWorldIndexName).getDocument(data.userId);
		return world;
	}
	catch (e) {
		console.error(e);
		return null;
	}
});
