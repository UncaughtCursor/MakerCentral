/* eslint-disable import/prefer-default-export */
import MeiliSearch from 'meilisearch';
import fs from 'fs';
import chunk from 'chunk';
import MeiliCredentials from '@data/private/meilisearch-credentials.json';
import { loadJSON, sleep } from './util/Util';
import { loadRawLevelDocs } from './LevelStats';
import { MCLevelDocData, MCRawLevelDoc } from '../../data/types/MCBrowserTypes';

const wordDataOutputName = 'out/stats/wordData.json';

const client = new MeiliSearch(MeiliCredentials);

/**
 * Creates and uploads search data to Meilisearch.
 */
export async function createSearchData() {
	// Reset level data
	console.log('Loading levels...');
	// FIXME: Load levels
	const levels: MCRawLevelDoc[] = await loadRawLevelDocs();
	console.log(`${levels.length} levels loaded`);
	await client.index('levels').deleteAllDocuments();

	const filteredLevels = levels.filter((level) => level.likes >= 0);

	const chunkSize = 100000;
	const levelChunks = chunk(filteredLevels, chunkSize);

	for (let i = 0; i < levelChunks.length; i++) {
		console.log(`${i * chunkSize} / ${levelChunks.length * chunkSize}`);
		const task = await client.index('levels').addDocuments(levelChunks[i]);
		console.log(task);
		sleep(20 * 1000);
		console.log('');
	}

	await setSearchSuggestions();
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
