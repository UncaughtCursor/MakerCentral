/* eslint-disable import/prefer-default-export */
import MeiliSearch from 'meilisearch';
import MeiliCredentials from '@data/private/meilisearch-credentials.json';
import { MCRawLevelDoc, MCRawUserDoc } from '@data/types/MCRawTypes';
import { loadJSON } from './util/Util';
import { generalOutDir, levelOutDir, userOutDir } from './LevelConvert';
import TextDirIterator from './TextDirIterator';
import { MCRawLevelDocToMCLevelDoc, MCRawUserDocToMCUserDoc, MCRawUserToMCWorldDoc } from '@data/util/MCRawToMC';
import { MCLevelDocData, MCUserDocData, MCWorldDocData } from '@data/types/MCBrowserTypes';
import fs from 'fs';
import SpeedTester from './util/SpeedTester';

const wordDataOutputName = 'out/stats/wordData.json';

const popularLevelLikeThreshold = 25;
export const meilisearch = new MeiliSearch(MeiliCredentials);

interface CreateLevelSearchDataOptions {
	onlyPopular?: boolean;
	inputDataDir?: string;
	batchSize?: number;
}

/**
 * Creates and uploads search data to Meilisearch.
 * @param options The options for the function.
 * - onlyPopular Whether to only upload popular levels.
 * - inputDataDir The directory to read the level data from.
 * - batchSize The number of levels to upload at a time.
 */
export async function createLevelSearchData(options: CreateLevelSearchDataOptions = {}) {
	const inputDataDir = options.inputDataDir || levelOutDir;
	const batchSize = options.batchSize || 100000;

	const levelFileIterator = new TextDirIterator(inputDataDir);
	const indexName = options.onlyPopular ? 'popular-levels' : 'levels';

	console.log('Loading levels...');
	
	let pool: MCLevelDocData[] = [];
	await levelFileIterator.iterate(async (data: string, i: number) => {
		console.log(`File #${i + 1}`);
		const rawDocs = JSON.parse(data) as MCRawLevelDoc[];
		const docs = rawDocs.map(rawDoc => MCRawLevelDocToMCLevelDoc(rawDoc));
		if (options.onlyPopular) {
			const popularDocs = docs.filter(doc => doc.numLikes >= popularLevelLikeThreshold);
			pool.push(...popularDocs);
		}
		else {
			pool.push(...docs);
		}

		if (pool.length >= batchSize) {
			const task = await meilisearch.index(indexName).addDocuments(pool);
			console.log(task);
			pool = [];
		}
		console.log(`${pool.length} levels in pool`);
	}, 0);
	if (pool.length > 0) {
		const task = await meilisearch.index(indexName).addDocuments(pool);
		console.log(task);
		pool = [];
	}
	console.log('Done.');
}

export async function createUserSearchData() {
	console.log('Loading users...');
	const userFileIterator = new TextDirIterator(userOutDir);

	await userFileIterator.iterate(async (data: string, i: number) => {
		console.log(`File #${i + 1}`);
		const rawDocs = JSON.parse(data) as MCRawUserDoc[];
		const docs = rawDocs.map(rawDoc => MCRawUserDocToMCUserDoc(rawDoc));
		
		const task = await meilisearch.index('users').addDocuments(docs);
		console.log(task);
	});
}

export async function createWorldSearchData() {
	console.log('Loading worlds...');
	const worldFileIterator = new TextDirIterator(userOutDir);

	let pool: MCWorldDocData[] = [];
	await worldFileIterator.iterate(async (data: string, i: number) => {
		console.log(`File #${i + 1}`);
		const rawDocs = JSON.parse(data) as MCRawUserDoc[];
		const docs: MCWorldDocData[] = rawDocs.filter(userDoc => userDoc.super_world !== null)
			.map(rawDoc => MCRawUserToMCWorldDoc(rawDoc)!);
		pool.push(...docs);
		if (pool.length >= 20000) {
			const task = await meilisearch.index('worlds').addDocuments(pool);
			console.log(task);
			pool = [];
		}
	});
	if (pool.length > 0) {
		const task = await meilisearch.index('worlds').addDocuments(pool);
		console.log(task);
	}
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

	await meilisearch.index('level-suggestions').deleteAllDocuments();
	const task2 = await meilisearch.index('level-suggestions').addDocuments(
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
	const levelIndex = meilisearch.index('levels');
	const popularLevelIndex = meilisearch.index('popular-levels');
	// const userIndex = meilisearch.index('users');
	const worldIndex = meilisearch.index('worlds');

	console.log('Setting settings...');

	const levelSearchableAttributes = [
		'name',
		'description',
	];
	const worldSearchableAttributes = [
		'levelText',
	];
	console.log(await levelIndex.updateSearchableAttributes(levelSearchableAttributes));
	console.log(await popularLevelIndex.updateSearchableAttributes(levelSearchableAttributes));
	console.log(await worldIndex.updateSearchableAttributes(worldSearchableAttributes));

	const levelFilterableAttributes = [
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
	];
	const worldFilterableAttributes = [
		'avgUploadTime',
		'avgDifficulty',
		'avgClearRate',
		'avgGameStyle',
		'avgTheme',
		'avgLikes',
		'avgPlays',
		'avgLikeToPlayRatio',
		'avgTags',
		'numLevels',
		'numWorlds',
		'created',
	];

	console.log(await levelIndex.updateFilterableAttributes(levelFilterableAttributes));
	console.log(await popularLevelIndex.updateFilterableAttributes(levelFilterableAttributes));
	console.log(await worldIndex.updateFilterableAttributes(worldFilterableAttributes));

	const levelSortableAttributes = [
		'uploadTime',
		'addedTime',
		'difficulty',
		'gameStyle',
		'theme',
		'numLikes',
		'numPlays',
		'likeToPlayRatio',
		'clearRate',
	];
	const worldSortableAttributes = [
		'avgClearRate',
		'avgLikes',
		'avgLikeToPlayRatio',
		'created',
	];
	
	console.log(await levelIndex.updateSortableAttributes(levelSortableAttributes));
	console.log(await popularLevelIndex.updateSortableAttributes(levelSortableAttributes));
	console.log(await worldIndex.updateSortableAttributes(worldSortableAttributes));

	const levelRankingRules = [
		'words',
		'typo',
		'sort',
		'numLikes:desc',
		'likeToPlayRatio:desc',
		'attribute',
		'proximity',
		'exactness',
	];
	const worldRankingRules = [
		'words',
		'typo',
		'sort',
		'avgLikes:desc',
		'avgLikeToPlayRatio:desc',
		'attribute',
		'proximity',
		'exactness',
	];

	console.log(await levelIndex.updateRankingRules(levelRankingRules));
	console.log(await popularLevelIndex.updateRankingRules(levelRankingRules));
	console.log(await worldIndex.updateRankingRules(worldRankingRules));

	const suggestionsIndex = meilisearch.index('level-suggestions');

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

export async function search(query: string, indexName: string) {
	const index = meilisearch.index(indexName);
	return index.search(query);
}

export async function getDoc(id: string, indexName: string) {
	const index = meilisearch.index(indexName);
	return index.getDocument(id);
}

export async function dumpIndexDocs(indexName: string) {
	const batchSize = 500000;
	const outputDir = `${generalOutDir}/meili-dumps/${indexName}/${Date.now()}`;
	fs.mkdirSync(outputDir, { recursive: true });
	const index = meilisearch.index(indexName);
	const spdTest = new SpeedTester(1, (spd) => {
		console.log(`${Math.round(spd * batchSize)} docs/s`);
	});

	let done = false;
	let i = 46 // 0;
	while (!done) {
		console.log(`Getting docs ${i * batchSize}-${(i + 1) * batchSize - 1}`);
		let success = false;
		let responseLength = 0;
		while (!success) {
			try {
				const docs = await index.getDocuments({
					limit: batchSize,
					offset: i * batchSize,
				});
				responseLength = docs.length;
				if (responseLength > 0) {
					console.log('Saving...');
					fs.writeFileSync(`${outputDir}/${i}.json`, JSON.stringify(docs));
					console.log('Saved.');
					spdTest.tick();
				}
				success = true;
			} catch (e) {
				console.log(e);
			}
		}
		i++;
		done = responseLength === 0;
	}
}