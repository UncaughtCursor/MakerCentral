#!/usr/bin/env node

import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import fs from 'fs';
import yargs, { Argv } from 'yargs';
import { createZCDLevelFileFromBCD, parseLevelDataFromCode, parseLevelFromZCDFile } from './level-reader/LevelReader';
import {
	compileLevels, compileUsers, levelOutDir, streamTableToFile,
} from './LevelConvert';
import { createLevelSearchData, createUserSearchData, createWorldSearchData, meilisearch, setSearchSettings, setSearchSuggestions } from './SearchManager';
import { generateSitemap } from './Sitemap';
import { renderLevel } from './level-reader/Render';
import { uploadLevels, uploadThumbnails, uploadUsers } from './Upload';
import CSVObjectStream from './csv/CSVObjectStream';
import SpeedTester from './util/SpeedTester';
import CloudFn from '../../data/util/CloudFn';
import { runSearchTests, SearchTest } from './SearchTester';
import { APILevel, DBClearCondition, DBDifficulty, DBGameStyle, DBLevel, DBSuperWorld, DBTag, DBTheme, DBUser, UserRegion, VersusRank } from '@data/types/DBTypes';
import streamFileUntil from './util/SteamFileUntil';
import { storage } from './FirebaseUtil';
import chunk from 'chunk';
import { MCRawLevelAggregation, MCRawLevelAggregationUnit, MCRawLevelDoc, MCRawMedal, MCRawSuperWorld, MCRawUserDoc, MCRawUserPreview, MCRawWorldLevelPreview } from '@data/types/MCRawTypes';
import axios, { AxiosResponse } from 'axios';
import { APIDifficulties, APIGameStyles, APITags, APIThemes } from '@data/APITypes';
import { MCLevelDocData } from '@data/types/MCBrowserTypes';
import { MCRawLevelDocToMCLevelDoc } from '@data/util/MCRawToMC';

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
		await createLevelSearchData(true);
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
	.command('set-search-settings', 'Reinitialize Meilisearch settings if they got reset', async () => {
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
	.command('test', 'Test', async () => {
		// Run the updateDB cloud function
		console.log('Running cloud function');
		const startTime = Date.now();
		await CloudFn('updateDB', {});
		console.log(`Cloud function finished in ${Date.now() - startTime}ms`);
	})
	.command('run', 'Run the current hardcoded program.', async () => {
		// Program: Index all of the levels in meilisearch
		const levelsDir = 'tmp/mc-raw-level';
		const levelFiles = fs.readdirSync(levelsDir);
		let levelPool: MCLevelDocData[] = [];
		for (const levelFile of levelFiles) {
			console.log(`Loading ${levelFile}`);
			const rawLevels = JSON.parse(fs.readFileSync(`${levelsDir}/${levelFile}`, 'utf8')) as MCRawLevelDoc[];
			const levels: MCLevelDocData[] = rawLevels.map(rawLevel => MCRawLevelDocToMCLevelDoc(rawLevel));
			levelPool.push(...levels);
			if (levelPool.length >= 200000) {
				await meilisearch.index('levels').addDocuments(levelPool);
				const popularLevels = levelPool.filter(level => level.numLikes >= 25);
				await meilisearch.index('popular-levels').addDocuments(popularLevels);
				console.log(`Indexed ${levelPool.length} levels`);
				levelPool = [];
			}
		}
		if (levelPool.length > 0) {
			await meilisearch.index('levels').addDocuments(levelPool);
			const popularLevels = levelPool.filter(level => level.numLikes >= 25);
			await meilisearch.index('popular-levels').addDocuments(popularLevels);
			console.log(`Indexed ${levelPool.length} levels`);
		}
	})
	.demand(1, 'must provide a valid command')
	.help('h')
	.alias('h', 'help')
	.parse();
