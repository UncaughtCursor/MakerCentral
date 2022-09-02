/* eslint-disable no-promise-executor-return */
/* eslint-disable import/prefer-default-export */
import * as functions from 'firebase-functions';
import chunk from 'chunk';
// import MeiliSearch from 'meilisearch';
// import MeiliCredentials from './data/private/meilisearch-credentials.json';
import { MCRawLevelAggregation, MCRawLevelAggregationUnit, MCRawLevelDoc, MCRawMedal, MCRawSuperWorld, MCRawUserDoc, MCRawUserPreview, MCRawWorldLevelPreview } from './data/types/MCRawTypes';
import { storageBucket } from '.';
import {
	DBClearCondition,
	DBDifficulty, DBGameStyle, APILevel, DBTag, DBTheme, DBSuperWorld, DBUser, UserRegion, VersusRank,
} from './data/types/DBTypes';
import { levelEndpoint, maxDataIdEndpoint, meilisearch, smm2APIBaseUrl, superWorldEndpoint, userEndpoint } from './constants';
import axios, { AxiosResponse } from 'axios';
import { MCLevelDocData, MCLevelDocUpdateData, MCTag, MCUserDocData, MCWorldDocData } from './data/types/MCBrowserTypes';
import { MCRawLevelDocToMCLevelDoc, MCRawUserDocToMCUserDoc, MCRawUserToMCWorldDoc, convertDBTagToMC } from './data/util/MCRawToMC';
import { APIDifficulties, APIGameStyles, APITags, APIThemes } from './data/APITypes';

const maxLevelsToAdd = 3000;
const levelsPerChunk = 500;
const usersPerChunk = 500;
const worldsPerChunk = 50;

const progressFileLocation = 'admin/updater-progress.json';
const dumpLocation = 'admin/dump';
// Push to level index every 2 hr 15 min
const timeBeforeLevelIndex = 15 * 9 * 60 * 1000;
const firstIndexTime = 1657616041747;
const minDataId = 3000000;
const oldLevelAmountMultiplier = 10;

interface UpdaterProgress {
	lastDataIdDownloaded: number;
	lastNewestDataId: number;
	lastRanTime: number;
	totalLevelsAdded: number;
	totalUsersAdded: number;
	totalWorldsAdded: number;
	dumpFileIndex: number;
	lastLevelIndexTime?: number;
	levelsToBeIndexed?: (MCLevelDocData | MCLevelDocUpdateData)[];
	usersToBeIndexed?: MCUserDocData[];
	worldsToBeIndexed?: MCWorldDocData[];
	lastOldDataIdDownloaded?: number;
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

interface MCRawUserDocPre {
	pid: string,
	data_id: number,
	code: string,
	region: UserRegion,
	name: string,
	country: string,
	last_active: number,
	mii_image: string,
	mii_studio_code: string,
	courses_played: number,
	courses_cleared: number,
	courses_attempted: number,
	courses_deaths: number,
	likes: number,
	maker_points: number,
	easy_highscore: number,
	normal_highscore: number,
	expert_highscore: number,
	super_expert_highscore: number,
	versus_rating: number,
	versus_rank: VersusRank,
	versus_won: number,
	versus_lost: number,
	versus_win_streak: number,
	versus_lose_streak: number,
	versus_plays: number,
	versus_disconnected: number,
	coop_clears: number,
	coop_plays: number,
	recent_performance: number,
	versus_kills: number,
	versus_killed_by_others: number,
	first_clears: number,
	world_records: number,
	unique_super_world_clears: number,
	uploaded_levels: number,
	weekly_maker_points: number,
	last_uploaded_level: number,
	is_nintendo_employee: number,
	comments_enabled: number,
	tags_enabled: number,
	medals: MCRawMedal[],
	super_world_id: string,
}

/**
 * Updates the levels in the database from Nintendo's servers.
 */
export const updateDB = functions.runWith({
	timeoutSeconds: 540,
	maxInstances: 1,
	memory: '1GB',
}).pubsub.schedule('every 9 minutes').onRun(async () => {
	const progress = await loadProgress();
	console.log('Progress loaded');

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

	const numOldIdsToDownload = (maxLevelsToAdd + progress.lastDataIdDownloaded - endId) * oldLevelAmountMultiplier;
	const minOldId = progress.lastOldDataIdDownloaded ? progress.lastOldDataIdDownloaded + 1 : minDataId;
	const maxOldId = Math.min(minOldId + numOldIdsToDownload, maxId);

	console.log(`Downloading ${numOldIdsToDownload} old levels`);
	const oldLevels: MCLevelDocUpdateData[] = (await downloadRawLevels(minOldId, maxOldId))
		.map((rawLevel) => MCRawLevelPreToUpdateData(rawLevel));
	console.log(`Downloaded ${oldLevels.length} old levels`);

	// Cycle through old levels, resetting the ID if caught up to the current max ID.
	progress.lastOldDataIdDownloaded = maxOldId === maxId ? minDataId : maxOldId;

	
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
	const fullUserProfiles: MCRawUserDoc[] = await Promise.all(fullUserProfilesPre.map(async (profile) => {
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

	const shouldIndexContent: boolean = (() => {
		if (!progress.lastLevelIndexTime) return Date.now() >= firstIndexTime;
		const diff = Date.now() - progress.lastLevelIndexTime;
		return diff >= timeBeforeLevelIndex;
	})();

	const MCBrowserLevels: (MCLevelDocData | MCLevelDocUpdateData)[] = [
		...levels.map(level => {
			return MCRawLevelDocToMCLevelDoc(level);
		}),
		...oldLevels,
	];
	console.log(shouldIndexContent ? 'Indexing content' : 'Not indexing content');
	progress.levelsToBeIndexed = progress.levelsToBeIndexed
		? progress.levelsToBeIndexed.concat(MCBrowserLevels) : MCBrowserLevels;
	if (shouldIndexContent) {
		console.log('Indexing levels');
		await updateDocs('levels', progress.levelsToBeIndexed);
		progress.levelsToBeIndexed = [];
		progress.lastLevelIndexTime = Date.now();
		const popularLevels = progress.levelsToBeIndexed.filter(level => level.numLikes >= 25);
		console.log('Indexing popular levels');
		await updateDocs('popular-levels', popularLevels);
	}

	const MCBrowserUsers = fullUserProfiles.map(user => {
		return MCRawUserDocToMCUserDoc(user);
	});
	progress.usersToBeIndexed = progress.usersToBeIndexed
		? progress.usersToBeIndexed.concat(MCBrowserUsers) : MCBrowserUsers;
	if (shouldIndexContent) {
		console.log('Indexing users');
		await indexDocs('users', progress.usersToBeIndexed);
		progress.usersToBeIndexed = [];
	}

	const MCBrowserWorlds: MCWorldDocData[] = fullUserProfiles.filter(user => user.super_world).map(user => {
		return MCRawUserToMCWorldDoc(user)!;
	});
	progress.worldsToBeIndexed = progress.worldsToBeIndexed
		? progress.worldsToBeIndexed.concat(MCBrowserWorlds) : MCBrowserWorlds;
	if (shouldIndexContent) {
		console.log('Indexing worlds');
		await indexDocs('worlds', progress.worldsToBeIndexed);
		progress.worldsToBeIndexed = [];
	}

	// Set the new progress.
	progress.lastDataIdDownloaded = endId;
	progress.lastNewestDataId = maxId;
	
	// Save the progress.
	await saveDump({
		levels,
		users: fullUserProfiles,
	}, progress.dumpFileIndex);

	progress.dumpFileIndex++;
	progress.totalLevelsAdded += MCBrowserLevels.length;
	progress.totalUsersAdded += MCBrowserUsers.length;
	progress.totalWorldsAdded += MCBrowserWorlds.length;
	progress.lastRanTime = Date.now();

	console.log(`Last data id downloaded: ${progress.lastDataIdDownloaded}`);
	console.log(`Last old data id downloaded: ${progress.lastOldDataIdDownloaded}`);
	console.log(`Last newest data id: ${progress.lastNewestDataId}`);

	await saveProgress(progress);
});

interface RawLevelSetResponse {
	courses: APILevel[];
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
async function downloadRawUsers(pids: string[]): Promise<MCRawUserDocPre[]> {
	const docs: MCRawUserDocPre[] = [];
	const chunks = chunk(pids, usersPerChunk);

	// Download users in each chunk.
	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		docs.push(...(await downloadRawUserSet(chunk, false)) as MCRawUserDocPre[]);
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
async function downloadRawUserSet(pids: string[], isPreview = false): Promise<MCRawUserDocPre[] | MCRawUserPreview[]> {
	console.log(`Downloading ${pids.length} users`);
	const url = `${smm2APIBaseUrl}/${userEndpoint}/${pids.join(',')}`;
	const response = await getAPIResponse(url) as RawUserSetResponse;
	console.log(`Downloaded ${response.users.length} users`);

	// Convert the response to the correct format.

	let res: MCRawUserDocPre[] | MCRawUserPreview[] = [];
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
		const MCRawUserDocPres: MCRawUserDocPre[] = [];
		for (let i = 0; i < response.users.length; i++) {
			const user = response.users[i];
			const { badges, ...rest } = user;
			MCRawUserDocPres.push({
				...rest,
				medals: badges,
			});
		}
		res = MCRawUserDocPres;
	}

	return res;
}

interface RawSuperWorldResponse {
	super_worlds: DBSuperWorld[];
}

/**
 * Downloads the data for Super Worlds from the SMM2 server.
 * @param worldIds The ID of the Super Worlds to download.
 * @returns A promise that resolves with the downloaded Super World info.
 */
async function downloadSuperWorlds(worldIds: string[]): Promise<DBSuperWorld[]> {
	const worldIdChunks = chunk(worldIds, worldsPerChunk);
	const worlds: DBSuperWorld[] = [];
	for (const worldIdChunk of worldIdChunks) {
		const url = `${smm2APIBaseUrl}/${superWorldEndpoint}/${worldIdChunk.join(',')}`;
		const response = await getAPIResponse(url) as RawSuperWorldResponse;
		worlds.push(...response.super_worlds);
	}
	return worlds;
}

/**
 * Converts a DBSuperWorld to an MCRawSuperWorld.
 * @param world The DBSuperWorld to convert.
 * @param uploader_pid The PID of the user who uploaded the world.
 */
async function DBSuperWorldToMCRawSuperWorld(world: DBSuperWorld,
	uploader_pid: string, dataIdMap: Map<number, MCRawLevelDocPre>): Promise<MCRawSuperWorld> {
	const world_id = world.id;

	const levels = world.courses.map((course) => dataIdMap.get(course)!);

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
	const { courses, ...rest } = world;

	return {
		...rest,
		world_id,
		level_info,
		aggregated_properties,
	};
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

type IndexName = 'levels' | 'popular-levels' | 'users' | 'worlds';
type IndexableDocuments = MCLevelDocData[] | MCUserDocData[] | MCWorldDocData[];

type UpdatableIndexName = 'levels' | 'popular-levels';
type UpdateDocuments = MCLevelDocUpdateData[];

/**
 * Indexes a set of documents in Meilisearch. This replaces any existing documents with the same ID.
 * @param indexName The name of the index to index into.
 * @param docs The documents to index.
 * @returns A promise that resolves when the indexing is enqueued.
 */
async function indexDocs(indexName: IndexName, docs: IndexableDocuments): Promise<void> {
	await meilisearch.index(indexName).addDocuments(docs);
}

/**
 * Updates a set of documents in Meilisearch. This updates any fields that are present in the existing documents.
 * @param indexName The name of the index to update.
 * @param docs The documents to use to update the index.
 * @returns A promise that resolves when the indexing is enqueued.
 */
async function updateDocs(indexName: UpdatableIndexName, docs: UpdateDocuments): Promise<void> {
	await meilisearch.index(indexName).updateDocuments(docs);
}

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
 * @param persistent Whether or not to keep requesting
 * the same URL until a response is received.
 * @returns A promise that resolves to the response.
 */
async function getAPIResponse(url: string, persistent = true): Promise<any> {
	let response: AxiosResponse;
	let done = false;
	while (!done) {
		try {
			response = await axios.get(url);
			if (response.status !== 200) {
				console.log(`Error: HTTP ${response.status}`);
				console.log(`From request: GET ${url}`);
				if (persistent) {
					console.log(`Retrying...`);
				}
				else {
					done = true;
				}
			}
			else {
				done = true;
			}
		}
		catch (e) {
			console.log(`Error: ${e}`);
			console.log(`From request: GET ${url}`);
			if (persistent) {
				console.log(`Retrying...`);
			} else {
				done = true;
			}
		}
	}
	return response!.data;
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

/**
 * Converts a raw MakerCentral pre-level document to an update document for the search engine.
 * @param levelPre The raw pre-level document.
 * @returns The update document for the search engine.
 */
 export function MCRawLevelPreToUpdateData(levelPre: MCRawLevelDocPre): MCLevelDocUpdateData {
	const tags: MCTag[] = (() => {
		const tagsArr: MCTag[] = [];

		if (levelPre.tag1 !== DBTag.None) tagsArr.push(convertDBTagToMC(levelPre.tag1)!);
		if (levelPre.tag2 !== DBTag.None && levelPre.tag2 !== levelPre.tag1) {
			tagsArr.push(convertDBTagToMC(levelPre.tag2)!);
		}

		return tagsArr;
	})();
	const difficulty = DBDifficulty[levelPre.difficulty] as keyof typeof DBDifficulty;
	
	return {
		id: levelPre.course_id,
		difficulty: difficulty !== 'Super expert' ? difficulty : 'Super Expert',
		clearRate: levelPre.clear_rate / 100,
		numLikes: levelPre.likes,
		numPlays: levelPre.plays,
		likeToPlayRatio: levelPre.likes / levelPre.plays,
		numComments: levelPre.num_comments,
		tags,
		updatedTime: Date.now(),
	};
}