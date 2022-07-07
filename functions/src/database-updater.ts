/* eslint-disable no-promise-executor-return */
/* eslint-disable import/prefer-default-export */
import * as functions from 'firebase-functions';
import chunk from 'chunk';
// import MeiliSearch from 'meilisearch';
// import MeiliCredentials from './data/private/meilisearch-credentials.json';
import { MCRawLevelDoc, MCRawUserDoc } from './data/types/MCRawTypes';
import { storageBucket } from '.';
import {
	DBClearCondition,
	DBDifficulty, DBGameStyle, APILevel, DBTag, DBTheme,
} from './data/types/DBTypes';
import { levelEndpoint, maxDataIdEndpoint, smm2APIBaseUrl } from './constants';
import axios from 'axios';

// const meilisearchClient = new MeiliSearch(MeiliCredentials);

const maxLevelsToAdd = 30000;
const levelsPerChunk = 500;

const progressFileLocation = 'admin/updater-progress.json';
const dumpLocation = 'admin/dump';

// const meilisearchLevelIndex = meilisearchClient.index('levels');
// const meilisearchUserIndex = meilisearchClient.index('users');
// const meilisearchWorldIndex = meilisearchClient.index('worlds');

interface UpdaterProgress {
	lastDataIdDownloaded: number;
	lastNewestDataId: number;
	lastUserIndexTime: number;
	lastLevelIndexTime: number;
	lastWorldIndexTime: number;
	totalLevelsAdded: number;
	totalUsersAdded: number;
	totalWorldsAdded: number;
	dumpFileIndex: number;
}

interface DumpFile {
	levels?: MCRawLevelDoc[];
	users?: MCRawUserDoc[];
	levelsPre?: MCRawLevelDocPre[];
}

interface MCRawLevelDocPre {
	data_id: number,
	name: string,
	description: string,
	uploaded: number,
	course_id: string,
	gamestyle: DBGameStyle,
	theme: DBTheme,
	difficulty: DBDifficulty,
	tag1: DBTag,
	tag2: DBTag,
	world_record: number | null,
	upload_time: number,
	num_comments: number,
	clear_condition: DBClearCondition,
	clear_condition_magnitude: number,
	clears: number,
	attempts: number,
	clear_rate: number,
	plays: number,
	versus_matches: number,
	coop_matches: number,
	likes: number,
	boos: number,
	unique_players_and_versus: number,
	weekly_likes: number,
	weekly_plays: number,
	uploader_pid: string,
	first_completer_pid?: string;
    record_holder_pid?: string;
}

/**
 * Updates the levels in the database from Nintendo's servers.
 */
export const updateDB = functions.runWith({
	timeoutSeconds: 540,
	maxInstances: 1,
	memory: '512MB',
}).pubsub.schedule('every 9 minutes').onRun(async () => {
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

	const levelsPre = await downloadRawLevels(progress.lastDataIdDownloaded + 1, endId);
	console.log(`Downloaded ${levelsPre.length} levels`);

	/* 
	// Get all user PIDs from levels.
	const fullProfilePids = [];
	const previewPids = [];
	for (const levelPre of levelsPre) {
		// Only the level uploader is added to the full profile PIDs.
		fullProfilePids.push(levelPre.uploader_pid);
		if (levelPre.first_completer_pid) previewPids.push(levelPre.first_completer_pid);
		if (levelPre.record_holder_pid) previewPids.push(levelPre.record_holder_pid);
	}

	const fullUserProfilesPre = await downloadRawUsers(fullProfilePids);
	const superWorldIds = fullUserProfilesPre.reduce((acc, userPre) => {
		if (userPre.super_world_id !== '') acc.push(userPre.super_world_id);
		return acc;
	}, [] as string[]);
	const superWorlds = await downloadSuperWorlds(superWorldIds);
	const superWorldMap: Map<string, DBSuperWorld> = new Map();
	for (const superWorld of superWorlds) {
		superWorldMap.set(superWorld.id, superWorld);
	}

	const worldLevelDataIds = fullUserProfilesPre.reduce((acc, profile) => {
		if (profile.super_world_id !== '') {
			const superWorld = superWorldMap.get(profile.super_world_id)!;
			acc.push(...superWorld.courses);
		}
		return acc;
	}, [] as number[]);
	const worldLevels = await downloadRawLevelsFromIds(worldLevelDataIds);
	const worldLevelMap: Map<number, MCRawLevelDocPre> = new Map();
	for (const level of worldLevels) {
		worldLevelMap.set(level.data_id, level);
	}
	const fullUserProfiles = await Promise.all(fullUserProfilesPre.map(async (profile) => {
		const { super_world_id, ...rest } = profile;
		const super_world = super_world_id !== '' ? superWorldMap.get(super_world_id)! : null;
		return {
			...rest,
			super_world: super_world ? await DBSuperWorldToMCRawSuperWorld(super_world, profile.pid, worldLevelMap) : null,
		};
	}));

	const fullProfilePidMap = new Map<string, MCRawUserDoc>();
	for (const fullUserProfile of fullUserProfiles) {
		fullProfilePidMap.set(fullUserProfile.pid, fullUserProfile);
	}
	console.log(`Downloaded ${fullUserProfilesPre.length} full profiles`);

	const userPreviews = await downloadRawUserPreviews(previewPids);
	const userPreviewPidMap = new Map<string, MCRawUserPreview>();
	for (const userPreview of userPreviews) {
		userPreviewPidMap.set(userPreview.pid, userPreview);
	}
	console.log(`Downloaded ${userPreviews.length} previews`);

	

	const levels: MCRawLevelDoc[] = levelsPre.map(levelPre => {
		const user = fullProfilePidMap.get(levelPre.uploader_pid);

		const firstCompleter = levelPre.first_completer_pid ? userPreviewPidMap.get(levelPre.first_completer_pid) : null;
		const recordHolder = levelPre.record_holder_pid ? userPreviewPidMap.get(levelPre.record_holder_pid) : null;
		return {
			data_id: levelPre.data_id,
			name: levelPre.name,
			description: levelPre.description,
			uploaded: levelPre.uploaded,
			course_id: levelPre.course_id,
			gamestyle: levelPre.gamestyle,
			theme: levelPre.theme,
			difficulty: levelPre.difficulty,
			tag1: levelPre.tag1,
			tag2: levelPre.tag2,
			world_record: levelPre.world_record,
			upload_time: levelPre.upload_time,
			num_comments: levelPre.num_comments,
			clear_condition: levelPre.clear_condition,
			clear_condition_magnitude: levelPre.clear_condition_magnitude,
			clears: levelPre.clears,
			attempts: levelPre.attempts,
			clear_rate: levelPre.clear_rate,
			plays: levelPre.plays,
			versus_matches: levelPre.versus_matches,
			coop_matches: levelPre.coop_matches,
			likes: levelPre.likes,
			boos: levelPre.boos,
			unique_players_and_versus: levelPre.unique_players_and_versus,
			weekly_likes: levelPre.weekly_likes,
			weekly_plays: levelPre.weekly_plays,
			uploader: getUserPreview(user!),
			first_completer: firstCompleter ? firstCompleter : null,
			record_holder: recordHolder ? recordHolder : null,
		};
	});

	// Upload new documents to the database.
	await uploadUsersOrLevels(levels, 'Level');
	await uploadUsersOrLevels(fullUserProfiles, 'User');

	const MCBrowserLevels = levels.map(level => {
		return MCRawLevelDocToMCLevelDoc(level);
	});
	progress.levelDocPool.push(...MCBrowserLevels);

	const MCBrowserUsers = fullUserProfiles.map(user => {
		return MCRawUserDocToMCUserDoc(user);
	});
	progress.userDocPool.push(...MCBrowserUsers);

	const MCBrowserWorlds: MCWorldDocData[] = fullUserProfiles.filter(user => user.super_world).map(user => {
		return MCRawUserToMCWorldDoc(user)!;
	});
	progress.worldDocPool.push(...MCBrowserWorlds);

	// TODO: Upload to MeiliSearch
	const time = Date.now();
	const shouldIndexLevels = time - progress.lastLevelIndexTime > minutesBetweenIndexing * 60 * 1000
		|| progress.levelDocPool.length >= maxIndexBatchSize;
	if (shouldIndexLevels) {
		await indexDocs('levels', progress.levelDocPool);
		progress.lastLevelIndexTime = time;
		progress.levelDocPool = [];
	
		const popularLevelLikeThreshold = 25;
		const popularLevels = MCBrowserLevels.filter(level => level.numLikes >= popularLevelLikeThreshold);
		await indexDocs('popular-levels', popularLevels);
	}

	const shouldIndexUsers = time - progress.lastUserIndexTime > minutesBetweenIndexing * 60 * 1000
		|| progress.userDocPool.length >= maxIndexBatchSize;
	if (shouldIndexUsers) {
		await indexDocs('users', progress.userDocPool);
		progress.lastUserIndexTime = time;
		progress.userDocPool = [];
	}

	const shouldIndexWorlds = time - progress.lastWorldIndexTime > minutesBetweenIndexing * 60 * 1000
		|| progress.worldDocPool.length >= maxIndexBatchSize;
	if (shouldIndexWorlds) {
		await indexDocs('worlds', progress.worldDocPool);
		progress.lastWorldIndexTime = time;
		progress.worldDocPool = [];
	} */

	// Set the new progress.
	progress.lastDataIdDownloaded = endId;
	progress.lastNewestDataId = maxId;
	
	// Save the progress.
	await saveDump({
		levelsPre,
	}, progress.dumpFileIndex);
	progress.dumpFileIndex++;
	progress.totalLevelsAdded += levelsPre.length;

	console.log(`Last data id downloaded: ${progress.lastDataIdDownloaded}`);
	console.log(`Last newest data id: ${progress.lastNewestDataId}`);
	/* console.log(`Last level index time: ${progress.lastLevelIndexTime}`);
	console.log(`Last user index time: ${progress.lastUserIndexTime}`);
	console.log(`Last world index time: ${progress.lastWorldIndexTime}`);
	console.log(`Level doc pool size: ${progress.levelDocPool.length}`);
	console.log(`User doc pool size: ${progress.userDocPool.length}`);
	console.log(`World doc pool size: ${progress.worldDocPool.length}`); */

	await saveProgress(progress);
});

/**
 * Downloads levels from Nintendo's servers, sweeping through the data IDs specified.
 * This range is inclusive.
 * @param startId The ID to start downloading at.
 * @param endId The ID to end downloading at.
 */
function downloadRawLevels(startId: number, endId: number): Promise<MCRawLevelDocPre[]> {
	const dataIdsToDownload = Array.from({ length: endId - startId + 1 }, (_, i) => startId + i);
	return downloadRawLevelsFromIds(dataIdsToDownload);
}

/**
 * Downloads levels from Nintendo's servers for a given set of data IDs.
 * @param ids The data IDs to download.
 * @returns The levels downloaded.
 */
 async function downloadRawLevelsFromIds(ids: number[]): Promise<MCRawLevelDocPre[]> {
	const docs: MCRawLevelDocPre[] = [];
	const chunks = chunk(ids, levelsPerChunk);

	// Download levels in each chunk.
	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		docs.push(...await downloadRawLevelSet(chunk));
	}

	return docs;
}

interface RawLevelSetResponse {
	courses: APILevel[];
}

/**
 * Downloads a set of levels from Nintendo's servers.
 * @param dataIds The data IDs of the levels to download.
 * @returns A promise that resolves with the downloaded level info.
 */
async function downloadRawLevelSet(dataIds: number[]): Promise<MCRawLevelDocPre[]> {
	const url = `${smm2APIBaseUrl}/${levelEndpoint}/${dataIds.join(',')}`;
	const response = await getAPIResponse(url) as RawLevelSetResponse;

	const res: MCRawLevelDocPre[] = [];
	for (let i = 0; i < response.courses.length; i++) {
		const level = response.courses[i];
		const {game_style, ...rest} = level;

		res.push({
			...rest,
			gamestyle: game_style,
			world_record: level.world_record ? level.world_record : null,
		});
	}

	return res;
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
	
	return response.data_id;
}

/**
 * Loads the database updater's progress.
 * @returns A promise that resolves to the progress data.
 */
async function loadProgress(): Promise<UpdaterProgress> {
	const data = (await storageBucket.file(progressFileLocation).download())[0].toString('utf8');
	return JSON.parse(data) as UpdaterProgress;
}

/**
 * Saves the database updater's progress.
 * @returns A promise that resolves when the data is saved.
 */
async function saveProgress(progress: UpdaterProgress): Promise<void> {
	const data = JSON.stringify(progress);
	await storageBucket.file(progressFileLocation).save(data);
}

/**
 * Obtains a response from an API call.
 * @param url The URL to request.
 * @returns A promise that resolves to the response.
 */
async function getAPIResponse(url: string): Promise<any> {
	const response = await axios.get(url);
	console.log(`GET ${url}`);
	return response.data;
}

/**
 * Saves a data dump to Firebase storage.
 * @param dump The data dump to save.
 * @param index The index of the data dump.
 * @returns A promise that resolves when the data is saved.
 */
async function saveDump(dump: DumpFile, index: number) {
	const fileName = `${index}.json`;
	const data = JSON.stringify(dump);
	await storageBucket.file(`${dumpLocation}/${fileName}`).save(data);
}