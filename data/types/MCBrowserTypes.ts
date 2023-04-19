import {
	APIGameStyle, APIGameStyles, APITheme, APIThemes,
} from '../APITypes';
import { CountryCode } from './CountryTypes';

export interface MCLevelDocData {
	name: string;
	id: string;
	uploadTime: number;
	updatedTime: number;
	makerName: string;
	makerId: string;
	country: CountryCode;
	difficulty: MCDifficulty;
	clearRate: number;
	gameStyle: MCGameStyle;
	theme: MCTheme;
	numLikes: number;
	numBoos: number;
	numPlays: number;
	likePercentage: number;
	description: string;
	tags: MCTag[];
}

export type MCPromoLevelDocData = MCLevelDocData & {
	promoter: string;
	expiry: number | null;
};

// Data that is used to update a level's entry in the meilisearch index.
export interface MCLevelDocUpdateData {
	id: string;
	updatedTime: number;
	difficulty: MCDifficulty;
	clearRate: number;
	numLikes: number;
	numBoos: number;
	numPlays: number;
	likePercentage: number;
	tags: MCTag[];
}

export type MCWorldLevelAggregation = {
	avgUploadTime: number;
	avgDifficulty: {[key in MCDifficulty]: number};
	avgClearRate: number;
	avgGameStyle: {[key in APIGameStyle]: number};
	avgTheme: {[key in APITheme]: number};
	avgLikes: number;
	avgPlays: number;
	avgLikeToPlayRatio: number;
	avgTags: {[key in MCTag]: number};
	isPromotedByPatron: boolean;
};

export interface MCUserDocData {
	id: string;
	name: string;
	likes: number;
	makerPoints: number;
	levels: number;
	world: MCWorldPreview | null;
	updatedTime?: number;
}

export interface MCWorldPreview {
	numLevels: number;
	numWorlds: number;
	avgPlays: number;
	avgLikes: number;
	avgClearRate: number;
	prominentTags: MCTag[];
	showcasedLevelIds: string[];
}

export interface MCWorldDocData extends MCWorldLevelAggregation {
	makerId: string;
	makerName: string;
	numLevels: number;
	numWorlds: number;
	created: number;
	levelText: string;
	levels: MCWorldLevelPreview[];
	updatedTime?: number;
}

export interface MCWorldLevelPreview {
	name: string,
	id: string,
	numPlays: number,
	numLikes: number,
}

export const MCTags = [
	'Standard',
	'Puzzle',
	'Music',
	'Autoscroll',
	'Speedrun',
	'Precision',
	'Auto',
	'Multiplayer',
	'Themed',
	'Boss Fight',
	'Glitch',
	'Technical',
	'Exploration',
	'Troll',
	'Story',
	'One Screen',
	'Kaizo',
	'Link',
	'Minigame',
	'Meme',
	'Pixel Art',
	'Shooter',
	'Short',
	'One Player Only',
] as const;
export type MCTag = typeof MCTags[number];

export const MCDifficulties = [
	'Easy',
	'Normal',
	'Expert',
	'Super Expert',
] as const;
export type MCDifficulty = typeof MCDifficulties[number];

export const MCThemes = APIThemes;
export type MCTheme = APITheme;

export const MCGameStyles = APIGameStyles;
export type MCGameStyle = APIGameStyle;

export const MCRegions = [
	'Asia',
	'Americas',
	'Europe',
	'Other',
] as const;
export type MCRegion = typeof MCRegions[number];
