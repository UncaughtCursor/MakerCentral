/* eslint-disable no-promise-executor-return */
/* eslint-disable import/prefer-default-export */
import * as functions from 'firebase-functions';
import chunk from 'chunk';
// import MeiliSearch from 'meilisearch';
// import MeiliCredentials from './data/private/meilisearch-credentials.json';
import {
	MCRawLevelAggregation,
	MCRawLevelAggregationUnit, MCRawLevelDoc, MCRawMedal, MCRawSuperWorld, MCRawUserDoc, MCRawUserPreview, MCRawWorldLevelPreview,
} from './data/types/MCRawTypes';
import { db, storageBucket } from '.';
import {
	DBClearCondition,
	DBDifficulty, DBGameStyle, APILevel, DBSuperWorld, DBTag, DBTheme, DBUser,
} from './data/types/DBTypes';
import {
	APIDifficulties, APIGameStyles, APITags, APIThemes,
} from './data/APITypes';
import { levelEndpoint, maxDataIdEndpoint, smm2APIBaseUrl, superWorldEndpoint, userEndpoint } from './constants';
import axios from 'axios';

// const meilisearchClient = new MeiliSearch(MeiliCredentials);

const maxLevelsToAdd = 100;
const levelsPerChunk = 500;
const usersPerChunk = 500;
const documentUploadChunkSize = 100;

const progressFileLocation = 'admin/updater-progress.json';

// const meilisearchLevelIndex = meilisearchClient.index('levels');
// const meilisearchUserIndex = meilisearchClient.index('users');
// const meilisearchWorldIndex = meilisearchClient.index('worlds');

interface UpdaterProgress {
	lastDataIdDownloaded: number;
	lastNewestDataId: number;
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

// TODO: Run on a cron job after testing.
/*export const updateDB = functions.pubsub.schedule('every 5 minutes').onRun(async () => {*/

/**
 * Updates the levels in the database from Nintendo's servers.
 */
export const updateDB = functions.runWith({
	timeoutSeconds: 540,
}).https.onCall(async () => {
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

	// Get all user PIDs from levels.
	const fullProfilePids = [];
	const previewPids = [];
	for (const levelPre of levelsPre) {
		// Only the level uploader is added to the full profile PIDs.
		fullProfilePids.push(levelPre.uploader_pid);
		if (levelPre.first_completer_pid) previewPids.push(levelPre.first_completer_pid);
		if (levelPre.record_holder_pid) previewPids.push(levelPre.record_holder_pid);
	}

	const fullUserProfiles = await downloadRawUsers(fullProfilePids);
	const fullProfilePidMap = new Map<string, MCRawUserDoc>();
	for (const fullUserProfile of fullUserProfiles) {
		fullProfilePidMap.set(fullUserProfile.pid, fullUserProfile);
	}
	console.log(`Downloaded ${fullUserProfiles.length} full profiles`);

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
	// TODO: Upload to MeiliSearch

	// Set the new progress.
	progress.lastDataIdDownloaded = endId;
	progress.lastNewestDataId = maxId;

	console.log('New progress', progress);

	// Save the progress.
	await saveProgress(progress);
});

/**
 * Downloads levels from Nintendo's servers, sweeping through the data IDs specified.
 * This range is inclusive.
 * @param startId The ID to start downloading at.
 * @param endId The ID to end downloading at.
 */
async function downloadRawLevels(startId: number, endId: number): Promise<MCRawLevelDocPre[]> {
	const docs: MCRawLevelDocPre[] = [];
	const dataIdsToDownload = Array.from({ length: endId - startId + 1 }, (_, i) => startId + i);
	const chunks = chunk(dataIdsToDownload, levelsPerChunk);

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

function getUserPreview(user: MCRawUserDoc): MCRawUserPreview {
	return {
		name: user.name,
		pid: user.pid,
		makerId: user.code,
		region: user.region,
		country: user.country,
		medals: user.medals,
		likes: user.likes,
		maker_points: user.maker_points,
		mii_image: user.mii_image,
		mii_studio_code: user.mii_studio_code,
		has_super_world: user.super_world !== null,
	};
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
		docs.push(...(await downloadRawUserSet(chunk, false)) as MCRawUserDoc[]);
	}

	return docs;
}

async function downloadRawUserPreviews(pids: string[]): Promise<MCRawUserPreview[]> {
	const previews: MCRawUserPreview[] = [];
	const chunks = chunk(pids, usersPerChunk);

	// Download users in each chunk.
	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		previews.push(...(await downloadRawUserSet(chunk, true)) as MCRawUserPreview[]);
	}

	return previews;
}

interface RawUserSetResponseUser extends DBUser {
	badges: MCRawMedal[],
}

type RawUserSetResponse = {
	users: RawUserSetResponseUser[];
}

/**
 * Downloads a set of users from the SMM2 server.
 * @param pids The PIDs of the users to download.
 * @param isPreview Whether or not to download previews instead of full user info.
 * @returns A promise that resolves with the downloaded user info.
 */
async function downloadRawUserSet(pids: string[], isPreview = false): Promise<MCRawUserDoc[] | MCRawUserPreview[]> {
	console.log(`Downloading ${pids.length} users`);
	const url = `${smm2APIBaseUrl}/${userEndpoint}/${pids.join(',')}`;
	const response = await getAPIResponse(url) as RawUserSetResponse;
	console.log(`Downloaded ${response.users.length} users`);

	// Convert the response to the correct format.

	let res: MCRawUserDoc[] | MCRawUserPreview[] = [];
	if (isPreview) {
		const userPreviews: MCRawUserPreview[] = [];
		for (let i = 0; i < response.users.length; i++) {
			const user = response.users[i];
			userPreviews.push({
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
			});
		}
		res = userPreviews;
	}
	else {
		const MCRawUserDocs: MCRawUserDoc[] = [];
		for (let i = 0; i < response.users.length; i++) {
			const user = response.users[i];
			const { super_world_id, ...rest } = user;
			MCRawUserDocs.push({
				...rest,
				super_world: super_world_id !== ''
					? await downloadSuperWorld(super_world_id, user.pid) : null,
				medals: user.badges,
			});
		}
		res = MCRawUserDocs;
	}

	return res;
}

/**
 * Downloads the data for a Super World from the SMM2 server.
 * @param worldId The ID of the Super World to download.
 * @param uploader_pid The PID of the user who uploaded the Super World.
 * @returns A promise that resolves with the downloaded Super World info.
 */
async function downloadSuperWorld(worldId: string, uploader_pid: string): Promise<MCRawSuperWorld> {
	const url = `${smm2APIBaseUrl}/${superWorldEndpoint}/${worldId}`;
	const response = await getAPIResponse(url) as DBSuperWorld;

	// Convert the response to the correct format.
	const world_id = response.id;

	const levels = await downloadRawLevelSet(response.courses);

	const level_info: MCRawWorldLevelPreview[] = levels.map((level) => ({
		name: level.name,
		course_id: level.course_id,
		plays: level.plays,
		likes: level.likes,
	}));

	const aggregationUnits: MCRawLevelAggregationUnit[] = levels.map((level) => ({
		name: level.name,
		code: level.course_id,
		uploaded: level.uploaded,
		difficulty: level.difficulty,
		clear_rate: level.clear_rate,
		gamestyle: level.gamestyle,
		theme: level.theme,
		likes: level.likes,
		plays: level.plays,
		like_to_play_ratio: level.likes / level.unique_players_and_versus,
		upload_time: level.upload_time,
		tags: [level.tag1, level.tag2],
		uploader_pid,
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
	// TODO: Change to prod collection when ready.
	const collectionName = type === 'Level' ? 'levels-test' : 'users-test';
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
	const promises = data.map((doc, i) => {
		if (i === 0) console.log(doc);
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
