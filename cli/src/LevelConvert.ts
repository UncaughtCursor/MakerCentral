/* eslint-disable no-async-promise-executor */
import * as fs from 'fs';
import { NdArray } from 'ndarray';
import savePixels from 'save-pixels';
import { getEndlessLevels } from './APIInterfacer';
import {
	APIDifficulties,
	APIDifficulty,
	APIGameStyle, APIGameStyles, APILevel, APITag, APITags, APITheme, APIThemes,
} from '../../data/APITypes';
import { forEachLevel, forEachUser } from './db/DBInterfacer';
import UnsafeDBQueryStream from './db/UnsafeDBQueryStream';
import {
	DBLevel, DBDifficulty, DBGameStyle, DBTag, DBUser, DBTheme,
} from '../../data/types/DBTypes';
import { generateThumbnail } from './level-reader/GenerateThumbnail';
import { Theme } from '../../data/LevelDataTypes';
import { loadPreLevels, loadUsers } from './LevelStats';
import { saveJSON } from './util/Util';
import SpeedTester from './util/SpeedTester';
import DBQueryStream from './db/DBQueryStream';
import {
	LevelAggregationInfo,
	MCDifficulties,
	MCDifficulty, MCGameStyles, MCLevelDocData, MCLevelPreprocessData, MCRawLevelAggregation, MCRawLevelDoc, MCRawMedal, MCRawSuperWorld, MCRawUserDoc, MCRawUserPreview, MCRawWorldLevelPreview, MCTag, MCThemes, MCUserDocData,
} from '../../data/types/MCBrowserTypes';
import CSVObjectStream from './csv/CSVObjectStream';
import {
	BadgeCSVRow, badgeCSVSchema, LevelCSVRow, levelCSVSchema, UserCSVRow, userCSVSchema, WorldCSVRow, worldCSVSchema, WorldLevelCSVRow, worldLevelCSVSchema,
} from './csv/CSVTypes';
import BigMap from 'infinity-map';

export const generalOutDir = 'E:/processed';
export const levelOutDir = `${generalOutDir}/levels-2`;
export const preLevelOutDir = `${generalOutDir}/levels-pre-2`;
export const thumbOutDir = `${generalOutDir}/level-thumbs`;
export const userOutDir = `${generalOutDir}/users-2`;

const CSVDirPath = 'E:/processed/csv';
const levelCSVPath = `${CSVDirPath}/level-meta-raw.csv`;
const userCSVPath = `${CSVDirPath}/user-raw.csv`;
const badgeCSVPath = `${CSVDirPath}/user_badges-raw.csv`;
const worldCSVPath = `${CSVDirPath}/world-raw.csv`;
const worldLevelsCSVPath = `${CSVDirPath}/world_levels-raw.csv`;

export interface PixelQueueEntry {
	path: string;
	data: NdArray;
}

export interface WriteQueueEntry {
	path: string;
	data: Buffer;
}

/**
 * Downloads and saves levels from the raw level CSV.
 */
export async function compileLevels() {
	const batchSize = 100000;

	const userPreviewMap = await loadUserPreviewMap();
	console.log(`Loaded userPreviewMap - ${userPreviewMap.size} entries`);

	const spdTest = new SpeedTester(100000, (spd, _, totalRows) => {
		console.log(`${spd} rows per sec; ${totalRows} processed.`);
	});
	const csvStream = new CSVObjectStream(levelCSVPath, levelCSVSchema);

	let fileCount = 0;
	let workingDocs: MCRawLevelDoc[] = [];

	csvStream.on('data', (row) => {
		const levelData = JSON.parse(row) as LevelCSVRow;
		workingDocs.push({
			data_id: levelData.data_id,
			uploaded: levelData.uploaded,
			likes: levelData.likes,
			boos: levelData.boos,
			attempts: levelData.attempts,
			plays: levelData.plays,
			versus_matches: levelData.versus_matches,
			unique_players_and_versus: levelData.unique_players_and_versus,
			clear_condition: levelData.clear_condition,
			clear_condition_magnitude: levelData.clear_condition_magnitude,
			clear_rate: levelData.clear_rate,
			clears: levelData.clears,
			coop_matches: levelData.coop_matches,
			course_id: levelData.course_id,
			name: levelData.name,
			num_comments: levelData.num_comments,
			description: levelData.description,
			gamestyle: levelData.gamestyle,
			theme: levelData.theme,
			tag1: levelData.tag1,
			tag2: levelData.tag2,
			difficulty: levelData.difficulty,
			world_record: levelData.world_record,
			upload_time: levelData.upload_time,
			weekly_likes: levelData.weekly_likes,
			weekly_plays: levelData.weekly_plays,
			uploader: userPreviewMap.get(levelData.uploader_pid)!,
			first_completer: userPreviewMap.get(levelData.first_completer_pid)!,
			record_holder: userPreviewMap.get(levelData.record_holder_pid)!,
		});

		if (workingDocs.length >= batchSize) {
			const outPath = `${levelOutDir}/${fileCount + 1}.json`;
			fs.writeFileSync(outPath, JSON.stringify(workingDocs));
			fileCount++;
			workingDocs = [];
		}
		spdTest.tick();
	});
	csvStream.on('end', () => {
		const outPath = `${levelOutDir}/${fileCount + 1}.json`;
		fs.writeFileSync(outPath, JSON.stringify(workingDocs));
		console.log('Level output complete.');
	});
}

/**
 * Loads a map of user pids to user preview objects.
 * @param requireLevels Whether or not the user must have levels to be saved in the structure.
 * False by default.
 */
function loadUserPreviewMap(
	requireLevels: boolean = false,
): Promise<Map<string, MCRawUserPreview>> {
	return new Promise(async (resolve) => {
		const medalMap = await loadUserMedalMap();
		const userMap = new Map<string, MCRawUserPreview>();
		const csvStream = new CSVObjectStream(userCSVPath, userCSVSchema);

		csvStream.on('data', (row: string) => {
			if (userMap.size % 10000 === 0) console.log(userMap.size);
			const userData = JSON.parse(row) as UserCSVRow;
			if (!requireLevels || userData.uploaded_levels > 0) {
				userMap.set(userData.pid, {
					pid: userData.pid,
					makerId: userData.code,
					region: userData.region,
					country: userData.country,
					name: userData.name,
					likes: userData.likes,
					maker_points: userData.maker_points,
					mii_image: userData.mii_image,
					mii_studio_code: userData.mii_studio_code,
					medals: medalMap.has(userData.pid) ? medalMap.get(userData.pid)! : [],
					has_super_world: userData.super_world_id !== '',
				});
			}
		});
		csvStream.on('end', () => {
			console.log('Stream ended!!');
			resolve(userMap);
		});
	});
}

/**
 * Loads a map of pids to super world preview objects.
 */
 function loadWorldPreviewMap(): Promise<Map<string, MCRawSuperWorld>> {
	return new Promise(async (resolve) => {
		const worldLevelsMap = await loadWorldLevelsMap();
		const worldMap = new Map<string, MCRawSuperWorld>();
		const csvStream = new CSVObjectStream(worldCSVPath, worldCSVSchema);

		csvStream.on('data', (row: string) => {
			if (worldMap.size % 10000 === 0) console.log(worldMap.size);

			const worldData = JSON.parse(row) as WorldCSVRow;

			const worldLevelInfo = worldLevelsMap.get(worldData.pid)!;

			worldMap.set(worldData.pid, {
				world_id: worldData.world_id,
				worlds: worldData.worlds,
				levels: worldData.levels,
				planet_type: worldData.planet_type,
				created: worldData.created,
				aggregated_properties: aggregateLevelInfo(worldLevelInfo),
				level_info: worldLevelInfo.map(info => {
					return {
						name: info.name,
						course_id: info.code,
						plays: info.plays,
						likes: info.likes,
					};
				}),
			});
		});
		csvStream.on('end', () => {
			console.log('Stream ended!!');
			resolve(worldMap);
		});
	});
}

/**
 * Loads a map of player pids to super world level ids.
 */
 function loadWorldLevelsMap(): Promise<Map<string, LevelAggregationInfo[]>> {
	return new Promise(async (resolve) => {
		const levelRankMap = await loadRankLevelMap();
		const worldLevelsMap = new Map<string, LevelAggregationInfo[]>();
		const csvStream = new CSVObjectStream(worldLevelsCSVPath, worldLevelCSVSchema);

		csvStream.on('data', (row: string) => {
			if (worldLevelsMap.size % 10000 === 0) console.log(worldLevelsMap.size);
			const worldLevelData = JSON.parse(row) as WorldLevelCSVRow;
			const levelInfo = levelRankMap.get(worldLevelData.data_id)!;

			if (!worldLevelsMap.has(worldLevelData.pid)) {
				worldLevelsMap.set(worldLevelData.pid, [levelInfo]);
			} else {
				worldLevelsMap.get(worldLevelData.pid)!.push(levelInfo);
			}
			
		});
		csvStream.on('end', () => {
			console.log('Stream ended!!');

			resolve(worldLevelsMap);
		});
	});
}

/**
 * Loads a map of level data ids to a level's likes and code.
 */
 function loadRankLevelMap(): Promise<BigMap<number, LevelAggregationInfo>> {
	return new Promise(async (resolve) => {
		const levelRankMap = new BigMap<number, LevelAggregationInfo>();
		const csvStream = new CSVObjectStream(levelCSVPath, levelCSVSchema);

		csvStream.on('data', (row: string) => {
			if (levelRankMap.size % 10000 === 0) console.log(levelRankMap.size);
			const levelData = JSON.parse(row) as LevelCSVRow;
				levelRankMap.set(levelData.data_id, {
					name: levelData.name,
					code: levelData.course_id,
					uploaded: levelData.uploaded,
					likes: levelData.likes,
					theme: levelData.theme,
					difficulty: levelData.difficulty,
					clear_rate: levelData.clear_rate,
					tags: [levelData.tag1, levelData.tag2],
					gamestyle: levelData.gamestyle,
					plays: levelData.plays,
					like_to_play_ratio: levelData.likes / levelData.unique_players_and_versus,
					upload_time: levelData.upload_time
				});
		});
		csvStream.on('end', () => {
			console.log('Stream ended!!');
			resolve(levelRankMap);
		});
	});
}

/**
 * Loads a map of user pids to user medal objects.
 */
function loadUserMedalMap(): Promise<Map<string, MCRawMedal[]>> {
	return new Promise((resolve) => {
		const medalMap = new Map<string, MCRawMedal[]>();
		const csvStream = new CSVObjectStream(badgeCSVPath, badgeCSVSchema);

		csvStream.on('data', (row: string) => {
			const badgeData = JSON.parse(row) as BadgeCSVRow;
			const badgeObj = {
				type: badgeData.type,
				rank: badgeData.rank,
			};
			if (medalMap.has(badgeData.pid)) {
				medalMap.get(badgeData.pid)!.push(badgeObj);
			} else {
				medalMap.set(badgeData.pid, [badgeObj]);
			}
		});
		csvStream.on('end', () => {
			resolve(medalMap);
		});
	});
}

/**
 * Downloads and saves levels from the raw user CSV.
 */
 export async function compileUsers() {
	const batchSize = 100000;

	const worldPreviewMap = await loadWorldPreviewMap();
	console.log(`Loaded worldPreviewMap - ${worldPreviewMap.size} entries`);

	const spdTest = new SpeedTester(100000, (spd, _, totalRows) => {
		console.log(`${spd} rows per sec; ${totalRows} processed.`);
	});
	const csvStream = new CSVObjectStream(userCSVPath, userCSVSchema);

	let fileCount = 0;
	let workingDocs: MCRawUserDoc[] = [];

	csvStream.on('data', (row) => {
		const userData = JSON.parse(row) as UserCSVRow;
		const super_world = worldPreviewMap.get(userData.pid);
		workingDocs.push({
			name: userData.name,
			code: userData.code,
			pid: userData.pid,
			data_id: userData.data_id,
			country: userData.country,
			region: userData.region,
			last_active: userData.last_active,
			mii_image: userData.mii_image,
			mii_studio_code: userData.mii_studio_code,
			courses_played: userData.courses_played,
			courses_cleared: userData.courses_cleared,
			courses_attempted: userData.courses_attempted,
			courses_deaths: userData.courses_deaths,
			coop_clears: userData.coop_clears,
			coop_plays: userData.coop_plays,
			comments_enabled: userData.comments_enabled,
			first_clears: userData.first_clears,
			weekly_maker_points: userData.weekly_maker_points,
			world_records: userData.world_records,
			versus_win_streak: userData.versus_win_streak,
			versus_kills: userData.versus_kills,
			versus_killed_by_others: userData.versus_killed_by_others,
			versus_disconnected: userData.versus_disconnected,
			likes: userData.likes,
			maker_points: userData.maker_points,
			easy_highscore: userData.easy_highscore,
			normal_highscore: userData.normal_highscore,
			expert_highscore: userData.expert_highscore,
			super_expert_highscore: userData.super_expert_highscore,
			versus_plays: userData.versus_plays,
			versus_won: userData.versus_won,
			versus_lost: userData.versus_lost,
			versus_rating: userData.versus_rating,
			versus_rank: userData.versus_rating,
			versus_lose_streak: userData.versus_lose_streak,
			recent_performance: userData.recent_performance,
			unique_super_world_clears: userData.unique_super_world_clears,
			uploaded_levels: userData.uploaded_levels,
			last_uploaded_level: userData.last_uploaded_level,
			tags_enabled: userData.tags_enabled,
			is_nintendo_employee: userData.is_nintendo_employee,
			super_world: !super_world ? null : super_world,
		});

		if (workingDocs.length >= batchSize) {
			const outPath = `${userOutDir}/${fileCount + 1}.json`;
			fs.writeFileSync(outPath, JSON.stringify(workingDocs));
			fileCount++;
			workingDocs = [];
		}
		spdTest.tick();
	});
	csvStream.on('end', () => {
		const outPath = `${userOutDir}/${fileCount + 1}.json`;
		fs.writeFileSync(outPath, JSON.stringify(workingDocs));
		console.log('User output complete.');
	});
}

/**
 * Stream user data into one large file.
 * @param tableName The name of the table.
 * @param queryFields The fields to query. To get all columns, pass in [ '*' ].
 */
export function streamTableToFile(tableName: string, queryFields: string[]) {
	const sql = `SELECT ${queryFields.join(',')} FROM ${tableName}`;
	const outPath = `${generalOutDir}/${tableName}-raw.csv`;
	const rowsPerBatch = 100000;
	const stream = new DBQueryStream(sql, rowsPerBatch);
	const speedLogger = new SpeedTester(1, (speed, _, totalRows) => {
		console.log(`${totalRows * rowsPerBatch} rows processed; ${speed * rowsPerBatch} rows per second`);
	});

	stream.on('data', () => {
		speedLogger.tick();
	});
	stream.on('error', (e) => {
		console.error(e);
	});
	stream.pipe(fs.createWriteStream(outPath, 'utf8'));
}

/**
 * Empties a queue of images to be written to files.
 * @param queue The queue to empty.
 */
async function emptyWriteQueue(queue: WriteQueueEntry[]) {
	while (queue.length > 0) {
		const entry = queue.shift()!;
		await (() => new Promise<void>((resolve) => {
			fs.writeFile(entry.path, entry.data, () => {
				resolve();
			});
		}))();
	}
}

function aggregateLevelInfo(levelInfo: LevelAggregationInfo[]): MCRawLevelAggregation {
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
		avg_difficulty: sum_difficulty.map(n => n / levelInfo.length) as unknown as {[key in DBDifficulty]: number},
		avg_clear_rate: sum_clear_rate / levelInfo.length,
		avg_gamestyle: sum_gamestyle.map(n => n / levelInfo.length) as unknown as {[key in DBGameStyle]: number},
		avg_theme: sum_theme.map(n => n / levelInfo.length) as unknown as {[key in DBTheme]: number},
		avg_likes: sum_likes / levelInfo.length,
		avg_plays: sum_plays / levelInfo.length,
		avg_like_to_play_ratio: sum_like_to_play_ratio / levelInfo.length,
		avg_tags: sum_tags.map(n => n / total_tags) as unknown as {[key in DBTag]: number},
		avg_upload_time: sum_upload_time / levelInfo.length,
	};
}
