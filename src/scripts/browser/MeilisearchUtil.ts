import { MeiliSearch } from 'meilisearch';
import MeilisearchConfig from '@data/meilisearch-config.json';
import { LevelSearchParams } from 'pages/levels/search/[q]';
import { defaultFilterSettings } from '@components/pages/search/LevelSearchBar';
import { MCLevelDocData } from '@data/types/MCBrowserTypes';
import { FullLevelSearchParams } from './SearchUtil';

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
 * @returns A promise that resolves with a search results object.
 */
export async function searchLevels(
	searchData: LevelSearchParams | FullLevelSearchParams,
): Promise<LevelSearchResults> {
	const filter = Object.keys(searchData).filter(
		(paramName) => filterParamNames.includes(paramName)
			&& searchData[paramName as keyof LevelSearchParams]
			!== defaultFilterSettings[paramName as keyof typeof defaultFilterSettings],
	).map(
		(paramName) => `${paramName !== 'tag' ? paramName : 'tags'} = "${searchData[paramName as keyof LevelSearchParams]}"`,
	);
	// Disable levels with less than 25 likes from showing up for now
	// filter.push('numLikes >= 25');

	// eslint-disable-next-line consistent-return
	const sortTypePropertyName = (() => {
		switch (searchData.sortType) {
		case 'By Clear Rate': return 'clearRate';
		case 'By Date': return 'uploadTime';
		case 'By Likes': return 'numLikes';
		}
	})();
	const sortOrderAbbr = searchData.sortOrder === 'Ascending' ? 'asc' : 'desc';

	const sort = [`${sortTypePropertyName}:${sortOrderAbbr}`];

	const res = await client.index('levels').search(searchData.q, {
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
