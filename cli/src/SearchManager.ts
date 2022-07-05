/* eslint-disable import/prefer-default-export */
import MeiliSearch from 'meilisearch';
import MeiliCredentials from '@data/private/meilisearch-credentials.json';
import { MCRawLevelDoc, MCRawUserDoc } from '@data/types/MCRawTypes';
import { loadJSON } from './util/Util';
import { levelOutDir, userOutDir } from './LevelConvert';
import TextDirIterator from './TextDirIterator';
import { MCRawLevelDocToMCLevelDoc, MCRawUserDocToMCUserDoc, MCRawUserToMCWorldDoc } from '@data/util/MCRawToMC';
import { MCLevelDocData, MCUserDocData, MCWorldDocSearchData } from '@data/types/MCBrowserTypes';

const wordDataOutputName = 'out/stats/wordData.json';

const popularLevelLikeThreshold = 25;
const client = new MeiliSearch(MeiliCredentials);

/**
 * Creates and uploads search data to Meilisearch.
 */
export async function createLevelSearchData(onlyPopular: boolean = false) {
	console.log('Loading levels...');
	const levelFileIterator = new TextDirIterator(levelOutDir);
	const indexName = onlyPopular ? 'popular-levels' : 'levels';
	
	let pool: MCLevelDocData[] = [];
	await levelFileIterator.iterate(async (data: string, i: number) => {
		console.log(`File #${i + 1}`);
		const rawDocs = JSON.parse(data) as MCRawLevelDoc[];
		const docs = rawDocs.map(rawDoc => MCRawLevelDocToMCLevelDoc(rawDoc));
		if (onlyPopular) {
			const popularDocs = docs.filter(doc => doc.numLikes >= popularLevelLikeThreshold);
			pool.push(...popularDocs);
		}
		else {
			pool.push(...docs);
		}

		if (pool.length > 2000) {
			const task = await client.index(indexName).addDocuments(pool);
			console.log(task);
			pool = [];
		}
		console.log(`${pool.length} levels in pool`);
	}, 179);
	if (pool.length > 0) {
		const task = await client.index(indexName).addDocuments(pool);
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
		
		const task = await client.index('users').addDocuments(docs);
		console.log(task);
	});
}

export async function createWorldSearchData() {
	console.log('Loading worlds...');
	const worldFileIterator = new TextDirIterator(userOutDir);

	let pool: MCWorldDocSearchData[] = [];
	await worldFileIterator.iterate(async (data: string, i: number) => {
		console.log(`File #${i + 1}`);
		const rawDocs = JSON.parse(data) as MCRawUserDoc[];
		const docs: MCWorldDocSearchData[] = rawDocs.map(rawDoc => MCRawUserToMCWorldDoc(rawDoc))
			.filter((world) => world !== null).map((world) => {
				const {levels, ...rest} = world!;
				return {
					...rest,
					levelText: levels.reduce((acc, level) => {
						return `${acc}; ${level.name}`;
					}, ''),
				};
			});
		pool.push(...docs);
		if (pool.length >= 20000) {
			const task = await client.index('worlds').addDocuments(pool);
			console.log(task);
			pool = [];
		}
	});
	if (pool.length > 0) {
		const task = await client.index('worlds').addDocuments(pool);
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
	const popularLevelIndex = client.index('popular-levels');

	console.log('Setting settings...');

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

	console.log(await levelIndex.updateFilterableAttributes(levelFilterableAttributes));
	console.log(await popularLevelIndex.updateFilterableAttributes(levelFilterableAttributes));

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
	console.log(await levelIndex.updateSortableAttributes(levelSortableAttributes));
	console.log(await popularLevelIndex.updateSortableAttributes(levelSortableAttributes));

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

	console.log(await levelIndex.updateRankingRules(levelRankingRules));
	console.log(await popularLevelIndex.updateRankingRules(levelRankingRules));

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

export async function search(query: string, indexName: string) {
	const index = client.index(indexName);
	return index.search(query);
}

export async function getDoc(id: string, indexName: string) {
	const index = client.index(indexName);
	return index.getDocument(id);
}