/* eslint-disable import/prefer-default-export */
import {
	MCDifficulties, MCDifficulty, MCGameStyles,
	MCLevelDocData, MCTag, MCThemes, MCUserDocData, MCWorldDocData,
} from '@data/types/MCBrowserTypes';
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
	const results = await searchLevels(searchParams, levelSortTypeMap, true);

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
	type: 'Level',
	q: '',
	sortType: 'By Likes',
	sortOrder: 'Descending',
	difficulty: 'Any',
	theme: 'Any',
	gameStyle: 'Any',
	tag: 'Any',
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

export type SearchType = 'Level' | 'User' | 'World';

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
export type LevelSortType = typeof sortTypes.Level[number];
export type UserSortType = typeof sortTypes.User[number];
export type WorldSortType = typeof sortTypes.World[number];

interface BaseSearchFilterSettings {
	sortOrder: 'Ascending' | 'Descending';
	page: number;
}

export interface LevelSearchFilterSettings extends BaseSearchFilterSettings {
	type: 'Level';
	sortType: LevelSortType;
	difficulty: MCDifficulty | 'Any';
	theme: SMM2Theme | 'Any';
	gameStyle: SMM2GameStyle | 'Any';
	tag: MCTag | 'Any';
}

export interface UserSearchFilterSettings extends BaseSearchFilterSettings {
	type: 'User';
	sortType: UserSortType;
}

export interface WorldSearchFilterSettings extends BaseSearchFilterSettings {
	type: 'World';
	sortType: WorldSortType;
	difficulty: MCDifficulty | 'Any';
	theme: SMM2Theme | 'Any';
	gameStyle: SMM2GameStyle | 'Any';
	tag: MCTag | 'Any';
	worldSize: WorldSize | 'Any';
}

export type SearchFilterSettings = LevelSearchFilterSettings
	| UserSearchFilterSettings | WorldSearchFilterSettings;

export const defaultFilterSettings: LevelSearchFilterSettings = {
	type: 'Level',
	sortType: 'By Likes',
	sortOrder: 'Descending',
	difficulty: 'Any',
	theme: 'Any',
	gameStyle: 'Any',
	tag: 'Any',
	page: 0,
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

export const levelSearchTemplate: LevelSearchOptionsTemplate = {
	searchType: 'Level',
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
			property: 'tag',
			options: ['Any', ...MCTagOptions],
		},
	],
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
	],
};
export const levelSortTypeMap: { [key in LevelSortType]: keyof MCLevelDocData } = (() => {
	const map: any = {};
	for (const sort of levelSearchTemplate.sortOptions) {
		map[sort.label] = sort.property;
	}
	const res: { [key in LevelSortType]: keyof MCLevelDocData } = map;
	return res;
})();

export const userSearchTemplate: UserSearchOptionsTemplate = {
	searchType: 'User',
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
export const userSortTypeMap: { [key in UserSortType]: keyof MCUserDocData } = (() => {
	const map: any = {};
	for (const sort of userSearchTemplate.sortOptions) {
		map[sort.label] = sort.property;
	}
	const res: { [key in UserSortType]: keyof MCUserDocData } = map;
	return res;
})();

export const worldSearchTemplate: WorldSearchOptionsTemplate = {
	searchType: 'World',
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
			property: 'tag',
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
export const worldSortTypeMap: { [key in WorldSortType]: keyof MCWorldDocData } = (() => {
	const map: any = {};
	for (const sort of worldSearchTemplate.sortOptions) {
		map[sort.label] = sort.property;
	}
	const res: { [key in WorldSortType]: keyof MCWorldDocData } = map;
	return res;
})();

interface LevelSearchOptionsFilter {
	label: string;
	property: keyof LevelSearchFilterSettings;
	options: (LevelSearchFilterSettings[LevelSearchOptionsFilter['property']] | 'Any')[];
}

interface LevelSearchOptionsSort {
	label: LevelSortType;
	property: keyof MCLevelDocData;
}

export interface LevelSearchOptionsTemplate {
	searchType: 'Level';
	filterOptions: LevelSearchOptionsFilter[];
	sortOptions: LevelSearchOptionsSort[];
}

interface UserSearchOptionsFilter {
	label: string;
	property: keyof UserSearchFilterSettings;
	options: UserSearchFilterSettings[UserSearchOptionsFilter['property']][];
}

interface UserSearchOptionsSort {
	label: UserSortType;
	property: keyof MCUserDocData;
}

export interface UserSearchOptionsTemplate {
	searchType: 'User';
	filterOptions: UserSearchOptionsFilter[];
	sortOptions: UserSearchOptionsSort[];
}

interface WorldSearchOptionsFilter {
	label: string;
	property: keyof WorldSearchFilterSettings;
	options: WorldSearchFilterSettings[WorldSearchOptionsFilter['property']][];
}

interface WorldSearchOptionsSort {
	label: WorldSortType;
	property: keyof MCWorldDocData;
}

export interface WorldSearchOptionsTemplate {
	searchType: 'World';
	filterOptions: WorldSearchOptionsFilter[];
	sortOptions: WorldSearchOptionsSort[];
}

export type SearchOptionsTemplate = LevelSearchOptionsTemplate
	| UserSearchOptionsTemplate | WorldSearchOptionsTemplate;

export const sortOrders = ['Ascending', 'Descending'] as const;
