/* eslint-disable import/prefer-default-export */
import { getLevelThumbnailUrl } from '@scripts/site/FirebaseUtil';
import { LevelSearchParams } from 'pages/levels/search/[q]';
import { LevelSearchResults, searchLevels } from './MeilisearchUtil';

/**
 * Performs a level search and returns the results and thumbnails for each level.
 * @param searchParams The search parameters for the search.
 * @returns The results and thumbnails for each level.
 */
export async function getLevelResultDisplayData(
	searchParams: FullLevelSearchParams | LevelSearchParams,
): Promise<{
	results: LevelSearchResults,
	thumbnailUrlObj: {[key: string]: string},
}> {
	const results = await searchLevels(searchParams);

	const thumbnailUrls = await Promise.all(results.results.map(
		async (level) => ({
			id: level.id, url: await getLevelThumbnailUrl(level.id),
		}),
	));
	const thumbnailUrlObj: {[key: string]: string} = {};
	thumbnailUrls.forEach((urlEntry) => {
		thumbnailUrlObj[urlEntry.id] = urlEntry.url;
	});

	return {
		results,
		thumbnailUrlObj,
	};
}

export interface FullLevelSearchParams extends LevelSearchParams {
	makerId?: string;
}

export const defaultFullSearchParams: FullLevelSearchParams = {
	q: '',
	sortType: 'By Likes',
	sortOrder: 'Descending',
	difficulty: 'Any',
	theme: 'Any',
	gameStyle: 'Any',
	tag: 'Any',
	page: 0,
};
