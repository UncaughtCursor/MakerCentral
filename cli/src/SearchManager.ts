/* eslint-disable import/prefer-default-export */
import MeiliSearch from 'meilisearch';
import fs from 'fs';
import chunk from 'chunk';
import MeiliCredentials from '@data/private/meilisearch-credentials.json';
import { MCRawLevelDoc } from '@data/types/MCRawTypes';
import { loadJSON, sleep } from './util/Util';
import { loadRawLevelDocs } from './LevelStats';
import { levelOutDir } from './LevelConvert';
import TextDirIterator from './TextDirIterator';
import { MCRawLevelDocToMCLevelDoc } from '@data/util/MCRawToMC';

const wordDataOutputName = 'out/stats/wordData.json';

const client = new MeiliSearch(MeiliCredentials);

/**
 * Creates and uploads search data to Meilisearch.
 */
export async function createLevelSearchData() {

	console.log('Loading levels...');
	const levelFileIterator = new TextDirIterator(levelOutDir);
	// await client.index('levels').deleteAllDocuments();

	await levelFileIterator.iterate(async (data: string, i: number) => {
		console.log(`File #${i + 1}`);
		const rawDocs = JSON.parse(data) as MCRawLevelDoc[];
		const docs = rawDocs.map(rawDoc => MCRawLevelDocToMCLevelDoc(rawDoc));

		const task = await client.index('levels').addDocuments(docs);
		console.log(task);
	}, 82); // TODO: Remove this argument when done uploading levels.
}

/**
 * Sets the search suggestions from the latest word count data.
 */
export async function setSearchSuggestions() {
	// Reset suggestions data
	const suggestions = loadJSON(wordDataOutputName) as {
		word: string;
		numInstances: number;
	}[];
	console.log(`${suggestions.length} suggestions loaded`);

	await client.index('level-suggestions').deleteAllDocuments();
	const task2 = await client.index('level-suggestions').addDocuments(
		suggestions.map((suggestion, i) => ({
			...suggestion,
			id: i,
		})),
	);
	console.log(task2);
}

/**
 * Sets the index settings. Use when they get reset.
 */
export async function setSearchSettings() {
	const levelIndex = client.index('levels');

	console.log('Setting settings...');

	console.log(await levelIndex.updateFilterableAttributes([
		'uploadTime',
		'addedTime',
		'makerName',
		'makerId',
		'difficulty',
		'gameStyle',
		'theme',
		'numLikes',
		'numPlays',
		'likeToPlayRatio',
		'clearRate',
		'tags',
		'isPromotedByPatron',
	]));

	console.log(await levelIndex.updateSortableAttributes([
		'uploadTime',
		'addedTime',
		'difficulty',
		'gameStyle',
		'theme',
		'numLikes',
		'numPlays',
		'likeToPlayRatio',
		'clearRate',
	]));

	console.log(await levelIndex.updateRankingRules([
		'words',
		'typo',
		'sort',
		'numLikes:desc',
		'likeToPlayRatio:desc',
		'attribute',
		'proximity',
		'exactness',
	]));

	const suggestionsIndex = client.index('level-suggestions');

	console.log(await suggestionsIndex.updateRankingRules([
		'words',
		'typo',
		'numInstances:desc',
		'sort',
		'attribute',
		'proximity',
		'exactness',
	]));

	console.log('Settings set.');
}
