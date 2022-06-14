// Not comprehensive
// See https://tgrcode.com/mm2/docs/

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { APIComment, APILevel } from './APITypes';
import { saveJSON } from './util/Util';

/**
 * Downloads level course world data from the endless level queue,
 * alternating between difficulties for each batch of 300 levels.
 * @param numLevels The number of levels to download. This number is uncapped.
 * @param outputPath (Optional) The path to output levels to while downloading as a failsafe.
 * @returns A promise containing the downloaded course world data.
 */
export async function getEndlessLevels(
	numLevels: number,
	outputPath?: string,
): Promise<void> {
	const maxQuerySize = 300;
	const endpoint = 'https://tgrcode.com/mm2/search_endless_mode';
	const initFileIndex = 1 + (() => {
		if (outputPath === undefined) return 0;
		return fs.readdirSync(`${path.dirname(outputPath)}/dl`).reduce((acc, file) => {
			const basename = path.basename(file, '.json');
			return Math.max(acc, parseInt(basename.slice(basename.length - 1), 10));
		}, 0);
	})();
	console.log(`Initial file index set to ${initFileIndex}`);

	let levelsLeft = numLevels;
	let levels: APILevel[] = [];
	let prevFileIdx = initFileIndex;
	let numDownloadedLevels = 0;

	let numCalls = 0;
	while (levelsLeft > 0) {
		levelsLeft -= maxQuerySize;
		const numLevelsToQuery = levelsLeft < 0 ? maxQuerySize + levelsLeft : maxQuerySize;
		levelsLeft = Math.max(levelsLeft, 0);

		const difficultyShort = ['e', 'n', 'ex', 'sex'][numCalls % 4];

		const url = `${endpoint}?count=${numLevelsToQuery}&difficulty=${difficultyShort}`;
		const data = await getDataFromUrl(url);

		const addedLevels = data !== null
			? getDedupedLevels(data.courses as APILevel[], levels)
			: [];
		levels.push(...addedLevels);
		numDownloadedLevels += addedLevels.length;

		levelsLeft += (numLevelsToQuery - addedLevels.length);

		if (outputPath !== undefined) {
			const levelsPerFile = 12000;
			const fileIdx = Math.floor(numDownloadedLevels / levelsPerFile) + initFileIndex;
			const savePath = `${path.dirname(outputPath)}/dl/${path.basename(outputPath, '.json')}-${fileIdx}.json`;

			saveJSON(savePath, levels);

			// Clear levels from memory for each new file to avoid out-of-memory issues
			if (prevFileIdx !== fileIdx) levels = [];
			prevFileIdx = fileIdx;
		}

		console.log(`Downloaded ${numLevels - levelsLeft} / ${numLevels} levels\n`);
		numCalls++;
	}
}

/**
 * Downloads level course world data of 100 levels from the popular level queue.
 * @returns A promise containing the downloaded course world data.
 */
export async function getPopularLevels(): Promise<APILevel[] | null> {
	const endpoint = 'https://tgrcode.com/mm2/search_popular?count=100';
	const data = await getDataFromUrl(endpoint);

	return data === null ? null : data.courses as APILevel[];
}

/**
 * Downloads level course world data of every level a user has uploaded.
 * @param makerId The maker ID of the user.
 * @returns A promise containing the downloaded course world data.
 */
export async function getLevelsFromMaker(makerId: string): Promise<APILevel[] | null> {
	const endpoint = 'https://tgrcode.com/mm2/get_posted';
	const data = await getDataFromUrl(`${endpoint}/${makerId}`);

	return data === null ? null : data.courses as APILevel[];
}

/**
 * Downloads the level course world data for a single level.
 * @param levelCode The course ID of the level.
 * @returns A promise containing the downloaded data or null if there was an error.
 */
export async function getLevelMetadata(levelCode: string): Promise<APILevel | null> {
	const endpoint = 'https://tgrcode.com/mm2/level_info';

	const queryCode = levelCode.replace('-', '');
	const url = `${endpoint}/${queryCode}`;

	return await getDataFromUrl(url) as APILevel | null;
}

/**
 * Downloads the binary data of a level.
 * @param levelCode The course ID of the level.
 * @param fileName The path to save the file to.
 * @returns A promise that resolves when the file is downloaded.
 */
export async function downloadLevelData(levelCode: string, fileName: string): Promise<void> {
	const endpoint = 'https://tgrcode.com/mm2/level_data';

	const queryCode = levelCode.replace('-', '');
	const url = `${endpoint}/${queryCode}`;

	await downloadBinaryDataFromUrl(url, fileName);
}

/**
 * Retrieves the comments on a level.
 * @param levelCode The course ID of the level.
 * @returns A promise containing the comments or null if there was an error.
 */
export async function getLevelComments(levelCode: string): Promise<APIComment[] | null> {
	const endpoint = 'https://tgrcode.com/mm2/level_comments';

	const queryCode = levelCode.replace('-', '');
	const url = `${endpoint}/${queryCode}`;
	const data = await getDataFromUrl(url);

	return data !== null ? data.comments as APIComment[] : null;
}

/**
 * Downloads the thumbnail of a level as a JPEG image.
 * @param levelCode The course ID of the level.
 * @param fileName The path to save the image to.
 * @returns A promise that resolves when the image is saved.
 */
export async function downloadLevelThumbnail(code: string, fileName: string) {
	const endpoint = 'https://tgrcode.com/mm2/level_thumbnail';

	await downloadBinaryDataFromUrl(`${endpoint}/${code}`, fileName);
}

/**
 * Obtains text data from a url.
 * @param url The url to get data from.
 * @returns A promise containing the data or null if there was an error.
 */
async function getDataFromUrl(url: string): Promise<any | null> {
	try {
		const resp = await axios.get(url);
		if (resp.data.error !== undefined) {
			return null;
		}
		return resp.data;
	} catch (e) {
		console.log(e);
		return null;
	}
}

/**
 * Downloads binary data from a url to a file.
 * @param url The url to download data from.
 * @param fileName The output file path.
 * @returns A promise that resolves when the file is downloaded.
 */
async function downloadBinaryDataFromUrl(url: string, fileName: string): Promise<void> {
	try {
		const resp = await axios.get(url, {
			responseType: 'arraybuffer',
		});
		if (resp.data.error !== undefined) {
			console.log(resp.data.error);
		}
		fs.writeFileSync(fileName, Buffer.from(resp.data));
	} catch (e) {
		console.log(e);
	}
}

/**
 * Given an array of levels, removes duplicates when compared to a reference set of levels.
 * @param arr The array to remove duplicate levels from.
 * @param referenceArr The reference array of levels to check against.
 * @returns The array with duplicate levels removed.
 */
function getDedupedLevels(arr: APILevel[], referenceArr: APILevel[]): APILevel[] {
	const dupeIndices: number[] = [];
	console.log('Checking for dupes');
	arr.forEach((entry, i) => {
		if (!referenceArr.reduce((acc, lvl) => acc && (entry.course_id !== lvl.course_id), true)) {
			dupeIndices.push(i);
		}
	});
	console.log(`${dupeIndices.length} dupes found`);

	return arr.filter((_, i) => !dupeIndices.includes(i));
}
