#!/usr/bin/env node

import chalk from 'chalk';
import clear from 'clear';
import figlet from 'figlet';
import fs from 'fs';
import yargs, { Argv } from 'yargs';
import { createZCDLevelFileFromBCD, parseLevelDataFromCode, parseLevelFromZCDFile } from './level-reader/LevelReader';
import {
	compileLevels, compileUsers, completeLevels, streamTableToFile,
} from './LevelConvert';
import { runLevelStats } from './LevelStats';
import { createSearchData, setSearchSettings, setSearchSuggestions } from './SearchManager';
import { generateSitemap } from './Sitemap';
import { renderLevel } from './level-reader/Render';
import { uploadLevels, uploadThumbnails } from './Upload';
import CSVObjectStream from './csv/CSVObjectStream';
import SpeedTester from './util/SpeedTester';

const testLevelCode = '3B3KRDTPF';

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
	.command('complete-levels', 'Create complete level data from user data', async () => {
		await completeLevels();
	})
	.command('run-stats', 'Run statistics on the compiled level data', async () => {
		await runLevelStats();
	})
	.command('create-search', 'Upload the compiled level data to Meilisearch', async () => {
		await createSearchData();
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
	.command('test', 'Test', async () => {
		const spd = new SpeedTester(100000, (speed, _, total) => {
			console.log(`${total} levels processed; ${speed} per second`);
		});
		let morphaCount = 0;
		const csvStream = new CSVObjectStream('E:/processed/level-meta-raw.csv', levelSchema);
		csvStream.on('data', (data) => {
			const row = JSON.parse(data) as {
				name: string,
				description: string
			};
			if (row.name.includes('morpha') || row.description.includes('morpha')) {
				morphaCount++;
				console.log(`Found another morpha! That's ${morphaCount} morphas so far.`);
			}
			spd.tick();
			// console.log('CSV stream returned');
			// console.log(JSON.parse(data));
		});
	})
	.demand(1, 'must provide a valid command')
	.help('h')
	.alias('h', 'help')
	.parse();
