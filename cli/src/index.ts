#!/usr/bin/env node

import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import fs from 'fs';
import yargs from 'yargs';
import { createZCDLevelFileFromBCD, parseLevelDataFromCode } from './level-reader/LevelReader';
import {
	compileLevels, compileUsers, generalOutDir, levelOutDir, streamTableToFile,
} from './LevelConvert';
import { createIndices, createLevelSearchData, createUserSearchData, createWorldSearchData, dumpIndexDocs, getTasks, meilisearch, searchLevels, setSearchSettings, setSearchSuggestions } from './SearchManager';
import { generateSitemap } from './Sitemap';
import { renderLevel } from './level-reader/Render';
import { uploadLevels, uploadThumbnails, uploadUsers } from './Upload';
import { runSearchTests, SearchTest } from './SearchTester';
import { DBClearCondition, DBDifficulty, DBGameStyle, DBLevel, DBTag, DBTheme } from '@data/types/DBTypes';
import streamFileUntil from './util/SteamFileUntil';
import { downloadStorageDir } from './StorageManager';
import path from 'path';
import generateThumbnailGrid from './ThumbnailGridGenerator';
import { restoreLevelBackup } from './Backups';
import { SearchParams, SearchResponse, Task } from 'meilisearch';

const testLevelCode = '3B3KRDTPF';

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

const levelSchema = {
	data_id: 'int',
	name: 'string',
	description: 'string',
	uploaded: 'int',
	course_id: 'string',
	gamestyle: 'int',
	theme: 'int',
	difficulty: 'int',
	tag1: 'int',
	tag2: 'int',
	world_record: 'int',
	upload_time: 'int',
	num_comments: 'int',
	clear_condition: 'int',
	clear_condition_magnitude: 'int',
	clears: 'int',
	attempts: 'int',
	clear_rate: 'real',
	plays: 'int',
	versus_matches: 'int',
	coop_matches: 'int',
	likes: 'int',
	boos: 'int',
	unique_players_and_versus: 'int',
	weekly_likes: 'int',
	weekly_plays: 'int',
	uploader_pid: 'string',
	first_completer_pid: 'string',
	record_holder_pid: 'string',
} as const;

clear();
console.log(
	chalk.white(
		figlet.textSync('Maker', { horizontalLayout: 'full' }),
	),
);
console.log(
	chalk.blue(
		figlet.textSync('Central', { horizontalLayout: 'full' }),
	),
);

const usersPerChunk = 500;

const maxDataIdEndpoint = 'newest_data_id';
const levelEndpoint = 'level_info_multiple';
const userEndpoint = 'user_info_multiple';
const superWorldEndpoint = 'super_worlds';
const thumbnailEndpoint = 'level_thumbnail';
const smm2APIBaseUrl = 'http://magic.makercentral.io';

const latestBackupId = 1673399049735;

yargs.usage('$0 command')
	.command('sitemap', 'Update the sitemap', async () => {
		await generateSitemap();
	})
	.command('get-levels', 'Extract level data', async () => {
		await compileLevels();
	})
	.command('stream-table', 'Extract data from the table specified in the code.', () => {
		streamTableToFile('world_levels', ['*']);
	})
	.command('get-users', 'Extract user data', async () => {
		await compileUsers();
	})
	.command('create-level-search', 'Upload the compiled level data to Meilisearch', async () => {
		await createLevelSearchData();
	})
	.command('create-popular-level-search', 'Upload the compiled popular level data to Meilisearch', async () => {
		await createLevelSearchData({
			onlyPopular: true,
		});
	})
	.command('create-user-search', 'Upload the compiled user data to Meilisearch', async () => {
		await createUserSearchData();
	})
	.command('create-world-search', 'Upload the compiled world data to Meilisearch', async () => {
		await createWorldSearchData();
	})
	.command('set-search-suggestions', 'Upload the latest word stats to Meilisearch to update the search suggestions', async () => {
		await setSearchSuggestions();
	})
	.command('set-search-settings', 'Reinitialize or update Meilisearch the settings specified in the code. WARNING: Make sure no indexing is happening while this is running. Wait a long time after indexing is completed to ensure safety.', async () => {
		await setSearchSettings();
	})
	.command('upload-levels', 'Upload completed levels to Firebase', async () => {
		await uploadLevels();
	})
	.command('upload-users', 'Upload users to Firebase', async () => {
		await uploadUsers();
	})
	.command('upload-thumbnails', 'Upload extracted thumbnails to Firebase', async () => {
		await uploadThumbnails();
	})
	.command('test-parser', 'Test the level data parser.', async () => {
		const level = await parseLevelDataFromCode(testLevelCode);
		// const level = parseLevelFromZCDFile(`tmp/${levelCode}.zcd`);
		createZCDLevelFileFromBCD(`tmp/${testLevelCode}.bcd`);
		fs.writeFileSync(`tmp/${testLevelCode}.json`, JSON.stringify(level, (_, value) => (typeof value === 'bigint'
			? value.toString()
			: value)));

		renderLevel(level, `tmp/${testLevelCode}.png`);
		console.log('Level rendered');
	})
	.command('dump-level-index', 'Dump the full Meilisearch level index to the local output location.', async () => {
		await dumpIndexDocs('levels');
		console.log('Done');
	})
	.command('download-updatedb-dumps', 'Download the dumps collected by the updateDB cloud function.', async () => {
		const localDir = `${generalOutDir}/updatedb-dumps/${Date.now()}`;
		const storageDir = 'admin/dump';
		await downloadStorageDir(storageDir, localDir);
	})
	.command('test-search-coverage', 'Test how many level files were uploaded to Meili.', async () => {
		// Load each level JSON file and search for the first level in each
		const fileNames = fs.readdirSync(levelOutDir);
		const tests: SearchTest[] = [];
		for (const fileName of fileNames) {
			console.log(`Loading ${fileName}`);
			if (fileName.endsWith('.json')) {
				const firstLevelSubstr = await streamFileUntil(`${levelOutDir}/${fileName}`, '}},');
				const level: DBLevel = JSON.parse(`${firstLevelSubstr}}}]`)[0];
				tests.push({ label: fileName, query: level.course_id });
			}
		}
		await runSearchTests(tests, {
			isId: true,
			onlyLogFailures: true,
		});
	})
	.command('extract-dump-levels', 'Extract the new levels from the dumps collected by the updateDB cloud function.', async () => {
		const dataDir = `${generalOutDir}/updatedb-dumps/${latestBackupId}`;
		const outDir = `${generalOutDir}/updatedb-dumps/${latestBackupId}/extracted-levels`;
		const minFileNumber = 130;

		const files = fs.readdirSync(dataDir);
		fs.mkdirSync(outDir, { recursive: true });

		for (const file of files) {
			// Parse the file's number
			const baseNameNumber = parseInt(path.basename(file, '.json'), 10);
			const newNumber = baseNameNumber - minFileNumber;
			
			// Skip files whose number is too low
			if (newNumber < 0) continue;

			console.log(`Processing ${file}`);

			// Extract the level data
			const levelData = JSON.parse(fs.readFileSync(`${dataDir}/${file}`, 'utf8')).levels;
			fs.writeFileSync(`${outDir}/${newNumber}.json`, JSON.stringify(levelData));
		}
	})
	.command('restore-level-backup', 'Reuploads all of the backed up levels to Meilisearch.', async () => {
		await restoreLevelBackup(latestBackupId);
	})
	.command('restore-popular-level-backup', 'Reuploads all of the backed up popular levels to Meilisearch.', async () => {
		await restoreLevelBackup(latestBackupId, true);
	})
	.command('restore-user-backup', 'Reuploads all of the backed up users to Meilisearch.', async () => {
		await createUserSearchData();
	})
	.command('restore-world-backup', 'Reuploads all of the backed up worlds to Meilisearch.', async () => {
		await createWorldSearchData();
	})
	.command('create-indices', 'Create the Meilisearch indices in case they got erased.', async () => {
		await createIndices();
	})
	.command('search-levels', 'Search the live database using the query specified in data/search.json', async () => {
		console.log('Searching...');
		const search = JSON.parse(fs.readFileSync('data/search.json', 'utf8')) as {
			query: string,
			searchParams: SearchParams,
		};
		console.log('Query', search);
		const results = await searchLevels(search.query, search.searchParams);
		logSearchResults(results);
	})
	.command('show-active-tasks', 'Show the active tasks in the Meilisearch instance and any failed tasks in the last 24 hours', async () => {
		const tasks = await getTasks();
		logTasks(tasks);
	})
	.command('generate-thumbnail-grid', 'Generate the thumbnail grid used for the homepage.', async () => {
		await generateThumbnailGrid(100, 100); // Top 10K
	})
	.command('test', 'Test', async () => {

	})
	.demand(1, 'must provide a valid command')
	.help('h')
	.alias('h', 'help')
	.parse();

/**
 * Logs search results to the console.
 * @param results The results to log.
 */
function logSearchResults(results: SearchResponse<Record<string, any>>) {
	results.hits.forEach((hit) => {
		console.log(hit);
	});
	console.log(`About ${results.estimatedTotalHits} results (${results.processingTimeMs}ms)`);
	if (results.totalHits) console.log(`Exact total of results: ${results.totalHits}`);
}

/**
 * Logs the currently active tasks in the Meilisearch instance.
 * @param tasks The tasks to log.
 */
function logTasks(tasks: Task[]) {
	tasks.forEach((task) => {
		console.log('**********');
		console.log(`Task ${task.uid}`);
		console.log(`Type: ${task.type}`);
		console.log(`Status: ${task.status}`);
		console.log(`Enqueued at: ${task.enqueuedAt}`);
		if (task.startedAt.getTime()) console.log(`Started at: ${task.startedAt}`);
		if (task.finishedAt.getTime()) console.log(`Finished at: ${task.finishedAt}`);
		if (task.duration) console.log(`Duration: ${task.duration}`);
		if (task.indexUid) console.log(`Index: ${task.indexUid}`);
		if (task.details) console.log('Details:', task.details);
		if (task.error) console.log(`Error: ${task.error}`);
		console.log('');
	});
	console.log(`${tasks.length} tasks`);
}