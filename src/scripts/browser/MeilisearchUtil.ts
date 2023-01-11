import { MeiliSearch } from 'meilisearch';
import MeilisearchConfig from '@data/meilisearch-config.json';
import { SearchParams } from 'pages/levels/search/[q]';
import { MCLevelDocData, MCUserDocData, MCWorldDocData } from '@data/types/MCBrowserTypes';
import { isInBackupMode } from 'pages/_app';
import {
	defaultFilterSettings, FullSearchParams,
	levelSearchTemplate, SearchMode, SearchResults, SearchTimeFilter, userSearchTemplate, worldSearchTemplate,
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
	// eslint-disable-next-line no-array-constructor
	const filter = (new Array<string>()).concat(...(
		(Object.keys(searchData) as (keyof typeof searchData)[]).filter(
			(paramName) => filterParamNames[searchData.searchMode].includes(paramName)
			&& searchData[paramName as keyof SearchParams]
			!== defaultFilterSettings[searchData.searchMode][paramName as
					keyof typeof defaultFilterSettings[SearchMode]],
		).map(
			(paramName) => getSearchFilterString(
paramName as SearchFilterKey,
			searchData[paramName] as SearchParams[SearchFilterKey],
			),
		)));

	// Abbreviation used for ascending/descending sort order.
	const sortOrderAbbr = searchData.sortOrder === 'Ascending' ? 'asc' : 'desc';

	// Sort substring to use for the search.
	const sort = [`${sortTypeMap[searchData.sortType]}:${sortOrderAbbr}`];

	// Index name for the search.
	const indexName = (() => {
		switch (searchData.searchMode) {
		case 'Levels':
			if (popularOnly || isInBackupMode) {
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

type Operator = '=' | '!=' | '>' | '>=' | '<' | '<=';
type FilterExcludedSearchParams = 'q' | 'searchMode' | 'sortType' | 'sortOrder' | 'page';
type SearchParamKey = keyof (SearchParams | FullSearchParams);
type SearchFilterKey = Exclude<SearchParamKey, FilterExcludedSearchParams>
type PropertyAccessorString = `[${string}]` | `.${string}`;
type SearchFilterString = `${keyof MCLevelDocData | keyof MCUserDocData | keyof MCWorldDocData}${PropertyAccessorString | ''} ${Operator} ${string}`;

/**
 * Gets the filter string for the provided search parameter.
 * @param key The search parameter's key.
 * @param value The search parameter's value.
 * @returns The filter string.
 */
function getSearchFilterString(
	key: SearchFilterKey,
	value: SearchParams[SearchFilterKey],
): SearchFilterString[] {
	if (key === 'worldSize') {
		switch (value) {
		case 'Small':
			return ['numLevels <= 12'];
		case 'Medium':
			return ['numLevels >= 13', 'numLevels <= 24'];
		case 'Large':
			return ['numLevels >= 25'];
		default:
			throw new Error(`Invalid world size: ${value}`);
		}
	}
	if (key === 'avgDifficulty' || key === 'avgTheme' || key === 'avgGameStyle' || key === 'avgTags') {
		// Include in the search results if the desired property
		// shows up in this percentage of the world's levels.
		// FIXME: This does not work.
		const prominencePercentage = 0.5;
		return [`${key}.${value} >= ${prominencePercentage}`];
	}
	if (key === 'time') {
		const minResultUnixTime = getMinResultUnixTime(value as SearchTimeFilter);
		return [`uploadTime >= ${minResultUnixTime}`];
	}
	return [`${key} = "${value}"`];
}

/**
 * For the time filter, returns the minimum unix timestamp to show levels from.
 * @param timeFilter The time filter to use.
 * @returns The minimum unix timestamp to show levels from.
 */
function getMinResultUnixTime(timeFilter: SearchTimeFilter): number {
	const now = Date.now();
	let msToSubtract = 0;

	switch (timeFilter) {
	case 'Past Day': {
		msToSubtract = 24 * 60 * 60 * 1000;
		break;
	}
	case 'Past Week': {
		msToSubtract = 7 * 24 * 60 * 60 * 1000;
		break;
	}
	case 'Past Month': {
		msToSubtract = 30 * 24 * 60 * 60 * 1000;
		break;
	}
	case 'Past Year': {
		msToSubtract = 365 * 24 * 60 * 60 * 1000;
		break;
	}
	case 'Any': {
		// Any time is valid, so just return 0.
		return 0;
	}
	default: {
		throw new Error(`Invalid time filter: ${timeFilter}`);
	}
	}

	return now - msToSubtract;
}
