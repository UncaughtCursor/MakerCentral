/* eslint-disable no-async-promise-executor */
import * as fs from 'fs';
import { NdArray } from 'ndarray';
import savePixels from 'save-pixels';
import { getEndlessLevels } from './APIInterfacer';
import {
	APIDifficulty,
	APIGameStyle, APILevel, APITag, APITheme,
} from '../../data/APITypes';
import { forEachLevel, forEachUser } from './db/DBInterfacer';
import UnsafeDBQueryStream from './db/UnsafeDBQueryStream';
import {
	DBLevel, DBDifficulty, DBGameStyle, DBTag, DBUser,
} from '../../data/types/DBTypes';
import { generateThumbnail } from './level-reader/GenerateThumbnail';
import { Theme } from '../../data/LevelDataTypes';
import { loadPreLevels, loadUsers } from './LevelStats';
import { saveJSON } from './util/Util';
import SpeedTester from './util/SpeedTester';
import DBQueryStream from './db/DBQueryStream';
import {
	MCDifficulty, MCLevelDocData, MCLevelPreprocessData, MCRawLevelDoc, MCRawMedal, MCRawUserPreview, MCTag, MCUserDocData,
} from '../../data/types/MCBrowserTypes';
import CSVObjectStream from './csv/CSVObjectStream';
import {
	BadgeCSVRow, badgeCSVSchema, LevelCSVRow, levelCSVSchema, UserCSVRow, userCSVSchema,
} from './csv/CSVTypes';

export const generalOutDir = 'E:/processed';
export const levelOutDir = `${generalOutDir}/levels-2`;
export const preLevelOutDir = `${generalOutDir}/levels-pre-2`;
export const thumbOutDir = `${generalOutDir}/level-thumbs`;
export const userOutDir = `${generalOutDir}/users-2`;

const CSVDirPath = 'E:/processed/csv';
const levelCSVPath = `${CSVDirPath}/level-meta-raw.csv`;
const userCSVPath = `${CSVDirPath}/user-raw.csv`;
const badgeCSVPath = `${CSVDirPath}/user_badges-raw.csv`;

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
 * Extracts all users from the DB and saves them in a JSON file.
 */
export async function compileUsers() {
	const userMap: Map<string, MCUserDocData> = new Map();

	const batchSize = 200000;
	let lastTime = Date.now();
	let numBatches = 0;

	forEachUser(async (user, i) => {
		userMap.set(user.pid, {
			id: user.code,
			pid: user.pid,
			name: user.name,
			makerPoints: user.maker_points,
			likes: user.likes,
			docVer: 0,
		});

		/* if (i % usersPerSave === 0 && i > 0) {
			const path = `${generalOutDir}/users/${numFiles + 1}.json`;
			saveJSON(path, Object.fromEntries(userMap));
			userMap.clear();
			numFiles++;
		} */
	}, {
		onBatchDone: async () => {
			saveJSON(`${userOutDir}/${numBatches + 1}.json`, Object.fromEntries(userMap));
			userMap.clear();

			const curTime = Date.now();
			const elapsedTimeSec = (curTime - lastTime) / 1000;
			const usersPerSec = batchSize / elapsedTimeSec;

			lastTime = curTime;
			console.log(`${(numBatches + 1) * batchSize} users processed`);
			console.log(`${usersPerSec} per second\n`);
			numBatches++;
		},
		onAllDone: () => {
			console.log('done');
		},
		batchSize,
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
 * Uses extracted user data to complete level data.
 */
export async function completeLevels() {
	console.log('Completing levels...');
	const preLevels = await loadPreLevels();
	const users = await loadUsers();

	const completedLevels: MCLevelDocData[] = preLevels.map((level) => {
		const user = users[level.makerPid];

		return {
			id: level.id,
			name: level.name,
			description: level.description,
			tags: level.tags,
			makerId: user.id,
			makerName: user.name,
			numComments: level.numComments,
			numLikes: level.numLikes,
			numPlays: level.numPlays,
			likeToPlayRatio: level.likeToPlayRatio,
			uploadTime: level.uploadTime,
			addedTime: level.addedTime,
			difficulty: level.difficulty,
			gameStyle: level.gameStyle,
			clearRate: level.clearRate,
			theme: level.theme,
			isPromotedByPatron: false,
			docVer: 0,
		};
	});

	saveJSON(`${levelOutDir}/popular.json`, completedLevels);
	console.log('Done');
}

/**
 * Converts raw database level course world data to MakerCentral pre-process level data.
 * @param level The database level course world data.
 * @returns The MakerCentral pre-process level data.
 */
function getLevelDocFromData(level: DBLevel): MCLevelPreprocessData {
	const levelData = level;

	const name = levelData.name;
	const uploadTime = levelData.uploaded * 1000;
	const editedTime = Date.now();

	const difficultyName = DBDifficulty[levelData.difficulty] as APIDifficulty;
	const difficulty: MCDifficulty = difficultyName === 'Super expert'
		? 'Super Expert' : difficultyName;

	const gameStyle: APIGameStyle = DBGameStyle[levelData.gamestyle] as APIGameStyle;

	const tags: MCTag[] = (() => {
		const tagsArr: MCTag[] = [];

		if (levelData.tag1 !== DBTag.None) tagsArr.push(convertDBTagToMC(levelData.tag1)!);
		if (levelData.tag2 !== DBTag.None && levelData.tag2 !== levelData.tag1) {
			tagsArr.push(convertDBTagToMC(levelData.tag2)!);
		}

		return tagsArr;
	})();

	const numLikes = levelData.likes;
	const description = levelData.description;

	const createdLevel: MCLevelPreprocessData = {
		name,
		id: level.course_id,
		makerPid: level.uploader_pid,
		uploadTime,
		addedTime: editedTime,
		difficulty,
		gameStyle,
		theme: Theme[level.theme] as APITheme,
		clearRate: level.clears / level.attempts,
		numLikes,
		numPlays: level.plays,
		likeToPlayRatio: numLikes / level.plays,
		numComments: level.num_comments,
		description,
		tags,
	};

	return createdLevel;
}

/**
 * Converts a level tag from the database to a level tag for MakerCentral.
 * @param tag The level tag from the database.
 * @returns The MakerCentral tag.
 */
function convertDBTagToMC(tag: DBTag): MCTag | null {
	const tagStr = DBTag[tag];
	switch (tagStr) {
	case 'Art': return 'Pixel Art';
	case 'Auto mario': return 'Auto';
	case 'Autoscroll': return 'Autoscroll';
	case 'Boss battle': return 'Boss Fight';
	case 'Link': return 'Link';
	case 'Multiplayer versus': return 'Multiplayer';
	case 'Music': return 'Music';
	case 'None': return null;
	case 'Puzzle solving': return 'Puzzle';
	case 'Shooter': return 'Shooter';
	case 'Short and sweet': return 'Short';
	case 'Single player': return 'One Player Only';
	case 'Speedrun': return 'Speedrun';
	case 'Standard': return 'Standard';
	case 'Technical': return 'Technical';
	case 'Themed': return 'Themed';
	default: return null;
	}
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
