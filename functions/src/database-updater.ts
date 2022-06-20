/* eslint-disable no-promise-executor-return */
/* eslint-disable import/prefer-default-export */
import * as functions from 'firebase-functions';
import chunk from 'chunk';
import MeiliSearch from 'meilisearch';
import MeiliCredentials from 'data/private/meilisearch-credentials.json';
import { MCRawLevelDoc, MCRawUserDoc } from './data/types/MCRawTypes';
import { db, storageBucket } from '.';

const meilisearchClient = new MeiliSearch(MeiliCredentials);

const maxLevelsToAdd = 10000;
const levelsPerChunk = 1000;
const usersPerChunk = 1000;
const documentUploadChunkSize = 100;

const progressFileLocations = 'admin/updater-progress.json';

const meilisearchLevelIndex = meilisearchClient.index('levels');
const meilisearchUserIndex = meilisearchClient.index('users');
const meilisearchWorldIndex = meilisearchClient.index('worlds');

interface UpdaterProgress {
	lastLevelDataId: number;
	isUserPidDownloaded: Map<string, boolean>;
}

/**
 * Updates the levels in the database from Nintendo's servers.
 */
export const updateDB = functions.pubsub.schedule('every 5 minutes').onRun(async () => {
	const progress = await loadProgress();

	// Throw off the Nintendo ninjas
	await new Promise((resolve) => setTimeout(resolve, Math.random() * 20000));

	const maxId = await getMaxDataID();

	if (progress.lastLevelDataId >= maxId) return;

	const endId = maxId - progress.lastLevelDataId > maxLevelsToAdd
		? progress.lastLevelDataId + maxLevelsToAdd : maxId;

	const levels = await downloadRawLevels(progress.lastLevelDataId + 1, endId);

	// Get all user PIDs from levels that haven't been downloaded yet.
	const newPids = levels.map((level) => level.uploader.pid)
		.filter((pid) => !progress.isUserPidDownloaded.has(pid));

	const users = await downloadRawUsers(newPids);

	// Upload new documents to the database.
	await uploadUsersOrLevels(levels, 'Level');
	await uploadUsersOrLevels(users, 'User');

	// Set the new progress.
	progress.lastLevelDataId = endId;
	// Add the downloaded PIDs to the map of downloaded PIDs.
	users.forEach((user) => progress.isUserPidDownloaded.set(user.pid, true));

	// Save the progress.
	await saveProgress(progress);
});

/**
 * Downloads levels from Nintendo's servers, sweeping through the data IDs specified.
 * This range is inclusive.
 * @param startId The ID to start downloading at.
 * @param endId The ID to end downloading at.
 */
async function downloadRawLevels(startId: number, endId: number): Promise<MCRawLevelDoc[]> {
	const docs: MCRawLevelDoc[] = [];
	const dataIdsToDownload = Array.from({ length: endId - startId + 1 }, (_, i) => startId + i);
	const chunks = chunk(dataIdsToDownload, levelsPerChunk);

	// Download levels in each chunk.
	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		docs.push(...await downloadRawLevelChunk(chunk));
	}

	return docs;
}

/**
 * Downloads a chunk of levels from Nintendo's servers.
 * @param dataIds The data IDs of the levels to download.
 * @returns A promise that resolves with the downloaded level info.
 */
async function downloadRawLevelChunk(dataIds: number[]): Promise<MCRawLevelDoc[]> {
	// TODO: https://github.com/Kinnay/NintendoClients/wiki/Data-Store-Protocol-(SMM-2)#70-GetCourses
}

/**
 * Downloads users from Nintendo's servers, sweeping through the PIDs specified.
 * @param pids The PIDs of the users to download.
 * @returns A promise that resolves with the downloaded user info.
 */
async function downloadRawUsers(pids: string[]): Promise<MCRawUserDoc[]> {
	const docs: MCRawUserDoc[] = [];
	const chunks = chunk(pids, usersPerChunk);

	// Download users in each chunk.
	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		docs.push(...await downloadRawUserChunk(chunk));
	}

	return docs;
}

async function downloadRawUserChunk(pids: string[]): Promise<MCRawUserDoc[]> {
	// TODO: https://github.com/Kinnay/NintendoClients/wiki/Data-Store-Protocol-(SMM-2)#48-getusers
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
 * Uploads a set of user or level documents to the database.
 * @param data The documents to upload.
 * @param type The type of documents to upload.
 * @returns A promise that resolves when the upload completes.
 */
async function uploadUsersOrLevels(
	data: MCRawLevelDoc[] | MCRawUserDoc[],
	type: 'Level' | 'User',
): Promise<void> {
	let dataChunks: any[][];
	switch (type) {
	case 'Level': {
		const levels = data as MCRawLevelDoc[];
		dataChunks = chunk(levels, documentUploadChunkSize);
		break;
	}
	case 'User': {
		const users = data as MCRawUserDoc[];
		dataChunks = chunk(users, documentUploadChunkSize);
		break;
	}
	default: {
		throw new Error('Invalid type');
	}
	}

	// Upload each chunk to the database.
	const collectionName = type === 'Level' ? 'levels-raw' : 'users-raw';
	const idPropertyName = type === 'Level' ? 'course_id' : 'code';
	for (let i = 0; i < dataChunks.length; i++) {
		const dataChunk = dataChunks[i];
		await uploadChunk(collectionName, dataChunk, idPropertyName);
	}
}

/**
 * Uploads a chunk of documents to the database.
 * @param collectionName The name of the collection to upload to.
 * @param data The documents to upload.
 * @param idPropertyName The name of the property that contains the ID of the document.
 * @returns A promise that resolves when the upload completes.
 */
async function uploadChunk(
	collectionName: string,
	data: any[],
	idPropertyName: string,
): Promise<void> {
	const promises = data.map((doc) => {
		const docPath = `${collectionName}/${doc[idPropertyName]}`;
		return db.doc(docPath).set(doc);
	});
	await Promise.all(promises);
}

/**
 * Loads the database updater's progress.
 * @returns A promise that resolves to the progress data.
 */
async function loadProgress(): Promise<UpdaterProgress> {
	const data = (await storageBucket.file(progressFileLocations).download())[0].toString('utf8');
	return JSON.parse(data) as UpdaterProgress;
}

/**
 * Saves the database updater's progress.
 * @returns A promise that resolves when the data is saved.
 */
async function saveProgress(progress: UpdaterProgress): Promise<void> {
	const data = JSON.stringify(progress);
	await storageBucket.file(progressFileLocations).save(data);
}
