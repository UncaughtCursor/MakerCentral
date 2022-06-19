/* eslint-disable import/prefer-default-export */
import * as functions from 'firebase-functions';
import { MCRawLevelDoc } from './data/types/MCRawTypes';

const maxLevelsToAdd = 1000;

interface UpdaterProgress {
	lastLevelDataId: number;
}

/**
 * Updates the levels in the database from Nintendo's servers.
 */
export const updateDB = functions.pubsub.schedule('every 5 minutes').onRun(async () => {
	const progress = await loadProgress();

	const maxId = await getMaxDataID();

	if (progress.lastLevelDataId >= maxId) return;

	const endId = maxId - progress.lastLevelDataId > maxLevelsToAdd
		? progress.lastLevelDataId + maxLevelsToAdd : maxId;

	const levels = await downloadRawLevels(progress.lastLevelDataId + 1, endId);

	// TODO: Upload levels to the database, check for new user IDs, and
	// upload any new users to the database.
});

/**
 * Downloads levels from Nintendo's servers, sweeping through the data IDs specified.
 * This range is inclusive.
 * @param startId The ID to start downloading at.
 * @param endId The ID to end downloading at.
 */
async function downloadRawLevels(startId: number, endId: number): Promise<MCRawLevelDoc[]> {
	const docs: MCRawLevelDoc[] = [];
	for (let i = startId; i <= endId; i++) {
		// TODO: Bulk download instead of downloading individual levels.
		// https://github.com/Kinnay/NintendoClients/wiki/Data-Store-Protocol-(SMM-2)#getcoursesparam-structure
		docs.push(await downloadRawLevel(i));
	}
	return docs;
}

/**
 * Downloads a level from Nintendo's servers.
 * @param dataId The data ID of the level to download.
 * @returns A promise that resolves with the downloaded level info.
 */
async function downloadRawLevel(dataId: number): Promise<MCRawLevelDoc> {
	// TODO
}

/**
 * Determines the approximate maximum data ID that can be downloaded.
 * @returns A promise that resolves to the
 * approximate maximum data ID that can be downloaded.
 */
async function getMaxDataID(): Promise<number> {
	// TODO: Query new levels for this
}

/**
 * Uploads a level to the database and search engine.
 * @param data The level data to upload.
 * @returns A promise that resolves when the upload completes.
 */
async function uploadLevel(data: MCRawLevelDoc): Promise<void> {
	// TODO
}

/**
 * Uploads a user to the database and search engine.
 * @param data The level data to upload.
 * @returns A promise that resolves when the upload completes.
 */
async function uploadUser(data: MCRawUserDoc): Promise<void> {
	// TODO
}

/**
 * Loads the database updater's progress.
 * @returns A promise that resolves to the progress data.
 */
async function loadProgress(): Promise<UpdaterProgress> {
	// TODO
}

/**
 * Saves the database updater's progress.
 * @returns A promise that resolves when the data is saved.
 */
async function saveProgress(): Promise<void> {
	// TODO
}
