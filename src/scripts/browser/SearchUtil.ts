/* eslint-disable import/prefer-default-export */
import {
	MCDifficulties, MCDifficulty, MCGameStyles,
	MCLevelDocData, MCTag, MCThemes, MCUserDocData, MCWorldDocData,
} from '@data/types/MCBrowserTypes';
import { getLevelThumbnailUrl } from '@scripts/site/FirebaseUtil';
import { SearchParams } from 'pages/levels/search/[q]';
import { MeiliSearchResults, searchLevels } from './MeilisearchUtil';

/**
 * Performs a level search and returns the results and thumbnails for each level.
 * @param searchParams The search parameters for the search.
 * @returns The results and thumbnails for each level if applicable.
 */
export async function getLevelResultData(
	searchParams: FullSearchParams | SearchParams,
): Promise<{
	results: SearchResults,
	levelThumbnailUrlObj?: {[key: string]: string},
	worldThumbnailUrlObjs?: {[key: string]: string}[],
}> {
	const results = await searchLevels(searchParams, levelSortTypeMap, false);
	let levelThumbnailUrlObj: {[key: string]: string} | undefined;
	let worldThumbnailUrlObj: {[key: string]: string}[] | undefined;

	let levelIds: string[] | null = null;
	let worldLevelIds: string[][] | null = null;
	if (searchParams.searchMode === 'Levels') {
		levelIds = (results.results as MCLevelDocData[]).map((level) => level.id);
	} else if (searchParams.searchMode === 'Worlds') {
		worldLevelIds = (results.results as MCWorldDocData[]).map((world) => (() => {
			const topFourLevelIds = world.levels.sort((a, b) => b.numLikes - a.numLikes)
				.slice(0, 4).map((level) => level.id);
			return topFourLevelIds;
		})());
	}

	if (searchParams.searchMode === 'Levels') {
		const thumbnailUrls = await Promise.all(levelIds!.map(
			async (levelId) => ({
				id: levelId, url: await getLevelThumbnailUrl(levelId),
			}),
		));
		levelThumbnailUrlObj = {};
		thumbnailUrls.forEach((urlEntry) => {
			levelThumbnailUrlObj![urlEntry.id] = urlEntry.url;
		});
	} else if (searchParams.searchMode === 'Worlds') {
		const thumbnailUrls = await Promise.all(worldLevelIds!.map(
			async (thisWorldLevelIds) => Promise.all(thisWorldLevelIds.map(
				async (levelId) => ({
					id: levelId, url: await getLevelThumbnailUrl(levelId),
				}),
			)),
		));
		worldThumbnailUrlObj = thumbnailUrls.map((urlGroup) => {
			const obj: {[key: string]: string} = {};
			urlGroup.forEach((urlEntry) => {
				obj[urlEntry.id] = urlEntry.url;
			});
			return obj;
		});
	}

	return {
		results,
		levelThumbnailUrlObj,
		worldThumbnailUrlObjs: worldThumbnailUrlObj,
	};
}

export interface FullSearchParams extends SearchParams {
	makerId?: string;
}

export const defaultFullSearchParams: FullSearchParams = {
	searchMode: 'Levels',
	q: '',
	sortType: 'By Likes',
	sortOrder: 'Descending',
	difficulty: 'Any',
	theme: 'Any',
	gameStyle: 'Any',
	tags: 'Any',
	page: 0,
};

export const SMM2GameStyles = [
	'SMB1', 'SMB3', 'SMW', 'NSMBU', 'SM3DW',
] as const;
export type SMM2GameStyle = typeof SMM2GameStyles[number];

export const SMM2Themes = [
	'Overworld', 'Underground',
	'Castle', 'Airship',
	'Underwater', 'Ghost house',
	'Snow', 'Desert',
	'Sky', 'Forest',
] as const;
export type SMM2Theme = typeof SMM2Themes[number];

export const worldSizes = [
	'Small', 'Medium', 'Large',
] as const;
export type WorldSize = typeof worldSizes[number];

export const SearchModes = [
	'Levels', 'Users', 'Worlds',
] as const;
export type SearchMode = typeof SearchModes[number];

export const sortTypes = {
	Level: [
		'By Likes', 'By Date', 'By Clear Rate',
	],
	User: [
		'By Maker Points', 'By Number of Levels',
	],
	World: [
		'By Likes', 'By Date', 'By Clear Rate',
	],
} as const;
export type SortType = typeof sortTypes.Level[number]
	| typeof sortTypes.User[number] | typeof sortTypes.World[number];

export interface SearchFilterSettings {
	searchMode: 'Levels' | 'Users' | 'Worlds';
	sortType: SortType;
	difficulty?: MCDifficulty | 'Any';
	theme?: SMM2Theme | 'Any';
	gameStyle?: SMM2GameStyle | 'Any';
	tags?: MCTag | 'Any';
	worldSize?: WorldSize | 'Any';
	makerId?: string;
	sortOrder: 'Ascending' | 'Descending';
	page: number;
}

export const defaultFilterSettings: {[key in SearchMode]: SearchFilterSettings} = {
	Levels: {
		searchMode: 'Levels',
		sortType: 'By Likes',
		sortOrder: 'Descending',
		difficulty: 'Any',
		theme: 'Any',
		gameStyle: 'Any',
		tags: 'Any',
		page: 0,
	},
	Users: {
		searchMode: 'Users',
		sortType: 'By Likes',
		sortOrder: 'Descending',
		page: 0,
	},
	Worlds: {
		searchMode: 'Worlds',
		difficulty: 'Any',
		theme: 'Any',
		gameStyle: 'Any',
		tags: 'Any',
		sortType: 'By Likes',
		sortOrder: 'Descending',
		worldSize: 'Any',
		page: 0,
	},
};

const MCTagOptions: MCTag[] = [
	'Auto',
	'Autoscroll',
	'Boss Fight',
	'Link',
	'Multiplayer',
	'Music',
	'One Player Only',
	'Pixel Art',
	'Puzzle',
	'Shooter',
	'Short',
	'Speedrun',
	'Standard',
	'Technical',
	'Themed',
];

/**
 * Generates a sort type map for the given search options template.
 * @param template The search options template.
 * @returns The sort type map.
 */
function getSortTypeMap(template: SearchOptionsTemplate): { [key in SortType]: keyof MCLevelDocData
	| keyof MCUserDocData | keyof MCWorldDocData } {
	const map: any = {};
	for (const sort of template.sortOptions) {
		map[sort.label] = sort.property;
	}
	const res: { [key in SortType]: keyof MCLevelDocData
		| keyof MCUserDocData | keyof MCWorldDocData } = map;
	return res;
}

// Describes the filtering and sorting options for a search.
// In this case, for levels.
export const levelSearchTemplate: SearchOptionsTemplate = {
	filterOptions: [
		{
			label: 'Game Style' as const,
			property: 'gameStyle' as const,
			options: ['Any', ...MCGameStyles] as const,
		} as const,
		{
			label: 'Theme' as const,
			property: 'theme' as const,
			options: ['Any', ...MCThemes] as const,
		} as const,
		{
			label: 'Difficulty',
			property: 'difficulty',
			options: ['Any', ...MCDifficulties] as const,
		} as const,
		{
			label: 'Tag',
			property: 'tags',
			options: ['Any', ...MCTagOptions] as const,
		} as const,
		{
			label: 'Maker ID',
			property: 'makerId',
			options: ['Any'],
			userVisible: false,
		} as const,
	] as const,
	sortOptions: [
		{
			label: 'By Likes',
			property: 'numLikes',
		},
		{
			label: 'By Date',
			property: 'uploadTime',
		},
		{
			label: 'By Clear Rate',
			property: 'clearRate',
		},
	] as const,
} as const;
export const levelSortTypeMap = getSortTypeMap(levelSearchTemplate);

export const userSearchTemplate: SearchOptionsTemplate = {
	filterOptions: [],
	sortOptions: [
		{
			label: 'By Maker Points',
			property: 'makerPoints',
		},
		{
			label: 'By Number of Levels',
			property: 'levels',
		},
	],
};
export const userSortTypeMap = getSortTypeMap(userSearchTemplate);

export const worldSearchTemplate: SearchOptionsTemplate = {
	filterOptions: [
		{
			label: 'Game Style',
			property: 'gameStyle',
			options: ['Any', ...MCGameStyles],
		},
		{
			label: 'Theme',
			property: 'theme',
			options: ['Any', ...MCThemes],
		},
		{
			label: 'Difficulty',
			property: 'difficulty',
			options: ['Any', ...MCDifficulties],
		},
		{
			label: 'Tag',
			property: 'tags',
			options: ['Any', ...MCTagOptions],
		},
		{
			label: 'Size',
			property: 'worldSize',
			options: ['Any', ...worldSizes],

		},
	],
	sortOptions: [
		{
			label: 'By Likes',
			property: 'avgLikes',
		},
		{
			label: 'By Date',
			property: 'created',
		},
		{
			label: 'By Clear Rate',
			property: 'avgClearRate',
		},
	],
};
export const worldSortTypeMap = getSortTypeMap(worldSearchTemplate);

interface SearchOptionsFilter {
	readonly label: string;
	readonly property: keyof SearchFilterSettings;
	readonly options: Readonly<(SearchFilterSettings[SearchOptionsFilter['property']] | 'Any')[]>;
	readonly userVisible?: boolean;
}

interface SearchOptionsSort {
	readonly label: SortType;
	readonly property: keyof MCLevelDocData | keyof MCUserDocData | keyof MCWorldDocData;
	readonly userVisible?: boolean;
}

export interface SearchOptionsTemplate {
	filterOptions: readonly SearchOptionsFilter[];
	sortOptions: readonly SearchOptionsSort[];
}

export type SearchResults = MeiliSearchResults<MCLevelDocData>
	| MeiliSearchResults<MCUserDocData> | MeiliSearchResults<MCWorldDocData>;

export const sortOrders = ['Ascending', 'Descending'] as const;
