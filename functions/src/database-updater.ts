/* eslint-disable no-promise-executor-return */
/* eslint-disable import/prefer-default-export */
import * as functions from 'firebase-functions';
import chunk from 'chunk';
import MeiliSearch from 'meilisearch';
import { is } from 'typescript-is';
import MeiliCredentials from './data/private/meilisearch-credentials.json';
import {
	MCRawLevelAggregation,
	MCRawLevelAggregationUnit, MCRawLevelDoc, MCRawMedal, MCRawSuperWorld, MCRawUserDoc, MCRawUserPreview, MCRawWorldLevelPreview,
} from './data/types/MCRawTypes';
import { db, storageBucket } from '.';
import {
	DBDifficulty, DBGameStyle, DBLevel, DBTag, DBTheme, DBUser,
} from './data/types/DBTypes';
import {
	APIDifficulties, APIGameStyles, APITags, APIThemes,
} from './data/APITypes';
import { levelEndpoint, maxDataIdEndpoint, smm2APIBaseUrl, superWorldEndpoint, userEndpoint } from './constants';

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
	lastDataIdDownloaded: number;
	lastNewestDataId: number;
	isUserPidDownloaded: {[pid: string]: boolean};
}

/**
 * Updates the levels in the database from Nintendo's servers.
 */
/* export const updateDB = functions.pubsub.schedule('every 5 minutes').onRun(async () => {
	const progress = await loadProgress();
	console.log('Progress loaded');
	console.log(progress);

	// If it's possible to go over the cached max data ID, get the new max data ID.
	const maxId = progress.lastDataIdDownloaded + maxLevelsToAdd >= progress.lastNewestDataId
		? await getMaxDataID() : progress.lastNewestDataId;
	console.log(`Max data ID: ${maxId}`);

	if (progress.lastDataIdDownloaded >= maxId) return;

	const endId = maxId - progress.lastDataIdDownloaded > maxLevelsToAdd
		? progress.lastDataIdDownloaded + maxLevelsToAdd : maxId;
	console.log(`End ID: ${endId}`);

	const levels = await downloadRawLevels(progress.lastDataIdDownloaded + 1, endId);
	console.log(`Downloaded ${levels.length} levels`);
	console.log(levels[0]);

	// Get all user PIDs from levels that haven't been downloaded yet.
	const newPids = levels.map((level) => level.uploader.pid)
		.filter((pid) => !progress.isUserPidDownloaded[pid]);

	const users = await downloadRawUsers(newPids);
	console.log(`Downloaded ${users.length} users`);
	console.log(users[0]);

	// Upload new documents to the database.
	// await uploadUsersOrLevels(levels, 'Level');
	// await uploadUsersOrLevels(users, 'User');
	// TODO: Upload to MeiliSearch

	// Set the new progress.
	progress.lastDataIdDownloaded = endId;
	progress.lastNewestDataId = maxId;
	// Add the downloaded PIDs to the map of downloaded PIDs.
	// eslint-disable-next-line no-return-assign
	users.forEach((user) => progress.isUserPidDownloaded[user.pid] = true);

	// Save the progress.
	await saveProgress(progress);
}); */

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

type RawLevelChunkResponse = {
	courses: DBLevel[];
}

/**
 * Downloads a chunk of levels from Nintendo's servers.
 * @param dataIds The data IDs of the levels to download.
 * @returns A promise that resolves with the downloaded level info.
 */
async function downloadRawLevelChunk(dataIds: number[]): Promise<MCRawLevelDoc[]> {
	const url = `${smm2APIBaseUrl}/${levelEndpoint}/?data_id=${dataIds.join(',')}`;
	const response = await getAPIResponse(url) as RawLevelChunkResponse;
	if (!is<RawLevelChunkResponse>(response)) throw new Error('Invalid response type');

	const res: MCRawLevelDoc[] = [];
	for (let i = 0; i < response.courses.length; i++) {
		const level = response.courses[i];
		const {
			uploader_pid, first_completer_pid, record_holder_pid, ...rest
		} = level;

		const userPreviews = await downloadRawUserPreviews(
			[uploader_pid, first_completer_pid, record_holder_pid],
		);

		res.push({
			...rest,
			uploader: userPreviews[0],
			first_completer: userPreviews[1],
			record_holder: userPreviews[2],
		});
	}

	return res;
}

/**
 * Downloads user previews from Nintendo's servers, sweeping through the PIDs specified.
 * @param pids The PIDs of the user previews to download.
 * @returns A promise that resolves with the downloaded user info.
 */
async function downloadRawUserPreviews(pids: string[]): Promise<MCRawUserPreview[]> {
	const docs: MCRawUserPreview[] = [];
	const chunks = chunk(pids, usersPerChunk);

	// Download users in each chunk.
	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];

		const url = `${smm2APIBaseUrl}/${userEndpoint}/${chunk.join(',')}`;
		const response = await getAPIResponse(url) as RawUserChunkResponse;
		if (!is<RawUserChunkResponse>(response)) throw new Error('Invalid response from API.');

		docs.push(...response.users.map((user) => ({
			name: user.name,
			pid: user.pid,
			makerId: user.code,
			region: user.region,
			country: user.country,
			medals: user.badges,
			likes: user.likes,
			maker_points: user.maker_points,
			mii_image: user.mii_image,
			mii_studio_code: user.mii_studio_code,
			has_super_world: user.super_world_id !== '',
		})));
	}

	return docs;
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

		const url = `${smm2APIBaseUrl}/${userEndpoint}/${pids.join(',')}`;
		const response = await getAPIResponse(url) as RawUserChunkResponse;
		if (!is<RawUserChunkResponse>(response)) throw new Error('Invalid response from API.');

		docs.push(...await downloadRawUserChunk(chunk));
	}

	return docs;
}

interface RawUserChunkResponseUser extends DBUser {
	badges: MCRawMedal[],
}

type RawUserChunkResponse = {
	users: RawUserChunkResponseUser[];
}

/**
 * Downloads a set of users from the SMM2 server.
 * @param pids The PIDs of the users to download.
 * @returns A promise that resolves with the downloaded user info.
 */
async function downloadRawUserChunk(pids: string[]): Promise<MCRawUserDoc[]> {
	const url = `${smm2APIBaseUrl}/${userEndpoint}/${pids.join(',')}`;
	const response = await getAPIResponse(url) as RawUserChunkResponse;
	if (!is<RawUserChunkResponse>(response)) throw new Error('Invalid response from API.');

	// Convert the response to the correct format.

	const MCRawUserDocs: MCRawUserDoc[] = [];
	for (let i = 0; i < response.users.length; i++) {
		const user = response.users[i];
		const { super_world_id, ...rest } = user;
		MCRawUserDocs.push({
			...rest,
			super_world: await downloadSuperWorld(super_world_id),
			medals: user.badges,
		});
	}

	return MCRawUserDocs;
}

type SuperWorldResponse = {
	id: string,
	worlds: number,
	levels: number,
	planet_type: number,
	created: number,
	ninjis: number[],
	courses: DBLevel[],
	uploader_pid: string,
}

/**
 * Downloads the data for a Super World from the SMM2 server.
 * @param worldId The ID of the Super World to download.
 * @returns A promise that resolves with the downloaded Super World info.
 */
async function downloadSuperWorld(worldId: string): Promise<MCRawSuperWorld> {
	const url = `${smm2APIBaseUrl}/${superWorldEndpoint}/${worldId}`;
	const response = await getAPIResponse(url) as SuperWorldResponse;
	if (!is<SuperWorldResponse>(response)) throw new Error('Invalid response from API.');

	// Convert the response to the correct format.
	const world_id = response.id;

	const level_info: MCRawWorldLevelPreview[] = response.courses.map((course) => ({
		name: course.name,
		course_id: course.course_id,
		plays: course.plays,
		likes: course.likes,
	}));

	const aggregationUnits: MCRawLevelAggregationUnit[] = response.courses.map((course) => ({
		name: course.name,
		code: course.course_id,
		uploaded: course.uploaded,
		difficulty: course.difficulty,
		clear_rate: course.clear_rate,
		gamestyle: course.gamestyle,
		theme: course.theme,
		likes: course.likes,
		plays: course.plays,
		like_to_play_ratio: course.likes / course.unique_players_and_versus,
		upload_time: course.upload_time,
		tags: [course.tag1, course.tag2],
	}));

	const aggregated_properties = aggregateLevelInfo(aggregationUnits);

	return {
		...response,
		world_id,
		level_info,
		aggregated_properties,
	};
}

type MaxDataIDResponse = { data_id: number };

/**
 * Determines the approximate maximum data ID that can be downloaded.
 * @returns A promise that resolves to the
 * approximate maximum data ID that can be downloaded.
 */
async function getMaxDataID(): Promise<number> {
	const url = `${smm2APIBaseUrl}/${maxDataIdEndpoint}`;
	const response = await getAPIResponse(url) as MaxDataIDResponse;
	if (!is<MaxDataIDResponse>(response)) throw new Error('Invalid response from API.');
	return response.data_id;
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

/**
 * Obtains a response from an API call.
 * @param url The URL to request.
 * @returns A promise that resolves to the response.
 */
async function getAPIResponse(url: string): Promise<any> {
	const response = await fetch(url);
	return response.json();
}

/**
 * Aggregates the data for a Super World.
 * @param levelInfo The units of data to aggregate.
 * @returns The aggregated data.
 */
function aggregateLevelInfo(levelInfo: MCRawLevelAggregationUnit[]): MCRawLevelAggregation {
	const sum_difficulty: number[] = new Array(APIDifficulties.length).fill(0);
	const sum_theme: number[] = new Array(APIThemes.length).fill(0);
	const sum_gamestyle: number[] = new Array(APIGameStyles.length).fill(0);
	const sum_tags: number[] = new Array(APITags.length).fill(0);

	let sum_uploaded = 0;
	let sum_clear_rate = 0;
	let sum_likes = 0;
	let sum_plays = 0;
	let sum_like_to_play_ratio = 0;
	let sum_upload_time = 0;
	let total_tags = 0;

	levelInfo.forEach((info) => {
		sum_difficulty[info.difficulty]++;
		sum_gamestyle[info.gamestyle]++;
		sum_tags[info.tags[0]]++;
		total_tags++;
		if (info.tags[1] !== info.tags[0]) {
			sum_tags[info.tags[1]]++;
			total_tags++;
		}
		sum_theme[info.theme]++;

		sum_uploaded += info.uploaded;
		sum_upload_time += info.uploaded;
		sum_likes += info.likes;
		sum_plays += info.plays;
		sum_clear_rate += info.clear_rate;
		sum_like_to_play_ratio += info.like_to_play_ratio;
	});

	return {
		avg_uploaded: sum_uploaded / levelInfo.length,
		avg_difficulty: sum_difficulty.map((n) => n / levelInfo.length) as unknown as {[key in DBDifficulty]: number},
		avg_clear_rate: sum_clear_rate / levelInfo.length,
		avg_gamestyle: sum_gamestyle.map((n) => n / levelInfo.length) as unknown as {[key in DBGameStyle]: number},
		avg_theme: sum_theme.map((n) => n / levelInfo.length) as unknown as {[key in DBTheme]: number},
		avg_likes: sum_likes / levelInfo.length,
		avg_plays: sum_plays / levelInfo.length,
		avg_like_to_play_ratio: sum_like_to_play_ratio / levelInfo.length,
		avg_tags: sum_tags.map((n) => n / total_tags) as unknown as {[key in DBTag]: number},
		avg_upload_time: sum_upload_time / levelInfo.length,
	};
}
