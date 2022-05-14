import { MeiliSearch } from 'meilisearch';
import MeiliCredentials from '@data/private/meilisearch-credentials.json';
import { MakerCentralLevel } from './BrowserUtil';

export interface LevelSearch {
	query: string;
	sort?: LevelSearchSort;
	filters?: LevelSearchFilter[];
}

export interface LevelSearchSort {
	property: keyof MakerCentralLevel;
	order: 'Ascending' | 'Descending';
}

export interface LevelSearchFilter {
	property: keyof MakerCentralLevel;
	operator: LevelSearchFilterOperator;
	value: any;
}

export type LevelSearchFilterOperator = '==' | '!=' | '>' | '>=' | '<' | '<=' | 'contains' | 'does not contain';

export interface LevelSearchResults {
	results: MakerCentralLevel[];
	numResults: number;
	isNumResultsExact: boolean;
	computeTimeMs: number;
	searchData: LevelSearch;
}

const client = new MeiliSearch(MeiliCredentials);

/**
 * Searches for levels based on the provided search data.
 * @param searchData The data to search based off of.
 * @returns A promise that resolves with a search results object.
 */
export async function searchLevels(searchData: LevelSearch): Promise<LevelSearchResults> {
	const res = await client.index('levels').search(searchData.query);
	return {
		results: res.hits as MakerCentralLevel[],
		numResults: res.nbHits,
		isNumResultsExact: res.exhaustiveNbHits,
		computeTimeMs: res.processingTimeMs,
		searchData,
	};
}

/**
 * Searches for levels based on the provided search data.
 * @param searchData The data to search based off of.
 * @returns A promise that resolves with a search results object.
 */
export async function getSuggestions(text: string): Promise<string[]> {
	const res = await client.index('level-suggestions').search(text);
	return res.hits.slice(0, 6).map((suggestion) => suggestion.word);
}
