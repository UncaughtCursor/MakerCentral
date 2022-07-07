import {
	APIGameStyle, APIGameStyles, APITheme, APIThemes,
} from '../APITypes';

export interface MCLevelDocData {
	name: string;
	id: string;
	uploadTime: number;
	addedTime: number;
	makerName: string;
	makerId: string;
	difficulty: MCDifficulty;
	clearRate: number;
	gameStyle: MCGameStyle;
	theme: MCTheme;
	numLikes: number;
	numPlays: number;
	likeToPlayRatio: number;
	numComments: number;
	description: string;
	tags: MCTag[];
	isPromotedByPatron: boolean;
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
