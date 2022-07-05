import { MeiliSearch } from 'meilisearch';
import MeilisearchConfig from '@data/meilisearch-config.json';
import { LevelSearchParams } from 'pages/levels/search/[q]';
import { MCLevelDocData } from '@data/types/MCBrowserTypes';
import { defaultFilterSettings, FullLevelSearchParams } from './SearchUtil';

export interface LevelSearch {
	query: string;
}

export interface LevelSearchSort {
	property: keyof MCLevelDocData;
	order: 'Ascending' | 'Descending';
}

export interface LevelSearchFilter {
	property: keyof MCLevelDocData;
	operator: LevelSearchFilterOperator;
	value: any;
}

export type LevelSearchFilterOperator = '==' | '!=' | '>' | '>=' | '<' | '<=' | 'contains' | 'does not contain';

export interface LevelSearchResults {
	results: MCLevelDocData[];
	numResults: number;
	isNumResultsExact: boolean;
	computeTimeMs: number;
	searchParams: LevelSearchParams;
}

const client = new MeiliSearch(MeilisearchConfig);

export const numResultsPerPage = 10;

const filterParamNames = [
	'difficulty',
	'theme',
	'gameStyle',
	'tag',
	'makerId',
];

/**
 * Searches for levels based on the provided search data.
 * @param searchData The data to search based off of.
 * @param sortTypeMap A map of sort types to their corresponding sort properties.
 * @param popularOnly (Optional) Whether to only search for popular levels.
 * The popular search is much faster than the regular search,
 * but only returns levels with at least 25 likes.
 * @returns A promise that resolves with a search results object.
 */
export async function searchLevels(
	searchData: LevelSearchParams | FullLevelSearchParams,
	sortTypeMap: { [key in typeof searchData.sortType]: keyof MCLevelDocData },
	popularOnly: boolean = false,
): Promise<LevelSearchResults> {
	const filter = Object.keys(searchData).filter(
		(paramName) => filterParamNames.includes(paramName)
			&& searchData[paramName as keyof LevelSearchParams]
			!== defaultFilterSettings[paramName as keyof typeof defaultFilterSettings],
	).map(
		(paramName) => `${paramName !== 'tag' ? paramName : 'tags'} = "${searchData[paramName as keyof LevelSearchParams]}"`,
	);

	const sortOrderAbbr = searchData.sortOrder === 'Ascending' ? 'asc' : 'desc';

	const sort = [`${sortTypeMap[searchData.sortType]}:${sortOrderAbbr}`];

	const indexName = popularOnly ? 'popular-levels' : 'levels';

	const res = await client.index(indexName).search(searchData.q, {
		filter,
		sort,
		offset: searchData.page * numResultsPerPage,
		limit: numResultsPerPage + 1,
	});
	return {
		results: res.hits as MCLevelDocData[],
		numResults: res.nbHits,
		isNumResultsExact: res.exhaustiveNbHits,
		computeTimeMs: res.processingTimeMs,
		searchParams: searchData,
	};
}

/**
 * Searches for levels based on the provided search data.
 * @param searchData The data to search based off of.
 * @returns A promise that resolves with a search results object.
 */
export async function getSuggestions(text: string): Promise<string[]> {
	const res = await client.index('level-suggestions').search(text, {
		limit: 6,
	});
	return res.hits.map((suggestion) => suggestion.word);
}
