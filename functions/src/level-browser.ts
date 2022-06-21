import * as functions from 'firebase-functions';
import { MCLevelDocData, MCUserDocData, MCWorldDocData } from './data/types/MCBrowserTypes';
import { db } from '.';
import { MCRawLevelDoc, MCRawUserDoc } from './data/types/MCRawTypes';
import { MCRawLevelDocToMCLevelDoc, MCRawUserDocToMCUserDoc, MCRawUserToMCWorldDoc } from './data/util/MCRawToMC';

export const getLevel = functions.https.onCall(async (data: {
	levelId: string,
}): Promise<MCLevelDocData> => {
	const level = (await db.doc(`levels-raw/${data.levelId}`).get()).data() as MCRawLevelDoc | undefined;
	if (level === undefined) throw new Error(`No level found with ID ${data.levelId}`);

	return MCRawLevelDocToMCLevelDoc(level);
});

export const getUser = functions.https.onCall(async (data: {
	userId: string,
}): Promise<MCUserDocData> => {
	const user = (await db.doc(`users-raw/${data.userId}`).get()).data() as MCRawUserDoc | undefined;
	if (user === undefined) throw new Error(`No user found with ID ${data.userId}`);

	return MCRawUserDocToMCUserDoc(user);
});

export const getWorld = functions.https.onCall(async (data: {
	userId: string,
}): Promise<MCWorldDocData | null> => {
	const user = (await db.doc(`users-raw/${data.userId}`).get()).data() as MCRawUserDoc | undefined;
	if (user === undefined) throw new Error(`No user found with ID ${data.userId}`);

	return MCRawUserToMCWorldDoc(user);
});
