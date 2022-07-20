import { MeiliSearch } from 'meilisearch';
import MeilisearchConfig from '@data/meilisearch-config.json';
import { SearchParams } from 'pages/levels/search/[q]';
import { MCLevelDocData, MCUserDocData, MCWorldDocData } from '@data/types/MCBrowserTypes';
import {
	defaultFilterSettings, FullSearchParams,
	levelSearchTemplate, SearchMode, SearchResults, userSearchTemplate, worldSearchTemplate,
} from './SearchUtil';

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

export interface MeiliSearchResults<T> {
	results: T[];
	numResults: number;
	isNumResultsExact: boolean;
	computeTimeMs: number;
	searchParams: SearchParams;
}

const client = new MeiliSearch(MeilisearchConfig);

export const numResultsPerPage = 10;

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
	searchData: SearchParams | FullSearchParams,
	sortTypeMap: { [key in typeof searchData.sortType]: keyof MCLevelDocData
		| keyof MCUserDocData | keyof MCWorldDocData },
	popularOnly: boolean = false,
): Promise<SearchResults> {
	const filterParamNames: {[key in SearchMode]: string[]} = {
		Levels: levelSearchTemplate.filterOptions.map((option) => option.property),
		Users: userSearchTemplate.filterOptions.map((option) => option.property),
		Worlds: worldSearchTemplate.filterOptions.map((option) => option.property),
	};

	// Get the search parameters to use. This is done by filtering out the
	// parameters that don't apply to the search mode, then mapping the
	// remaining parameters to equality strings for the search.
	const filter = Object.keys(searchData).filter(
		(paramName) => filterParamNames[searchData.searchMode].includes(paramName)
			&& searchData[paramName as keyof SearchParams]
			!== defaultFilterSettings[paramName as keyof typeof defaultFilterSettings],
	).map(
		(paramName) => `${paramName} = "${searchData[paramName as keyof SearchParams]}"`,
	);

	// Abbreviation used for ascending/descending sort order.
	const sortOrderAbbr = searchData.sortOrder === 'Ascending' ? 'asc' : 'desc';

	// Sort substring to use for the search.
	const sort = [`${sortTypeMap[searchData.sortType]}:${sortOrderAbbr}`];

	// Index name for the search.
	const indexName = (() => {
		switch (searchData.searchMode) {
		case 'Levels':
			if (popularOnly) {
				return 'popular-levels';
			}
			return 'levels';
		case 'Users':
			return 'users';
		case 'Worlds':
			return 'worlds';
		default:
			throw new Error(`Invalid search mode: ${searchData.searchMode}`);
		}
	})();

	// Perform the search and return the results.
	const res = await client.index(indexName).search(searchData.q, {
		// TODO: Enable filtering and sorting for the other search modes.
		filter: searchData.searchMode === 'Levels' ? filter : undefined,
		sort: searchData.searchMode === 'Levels' ? sort : undefined,
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
