import {
	APIGameStyle, APIGameStyles, APITheme, APIThemes,
} from '../APITypes';
import {
	DBClearCondition,
	DBDifficulty, DBGameStyle, DBTag, DBTheme, UserRegion, VersusRank,
} from './DBTypes';

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
	docVer: 0;
}

export interface MCLevelPreprocessData {
	name: string;
	id: string;
	uploadTime: number;
	addedTime: number;
	makerPid: string;
	difficulty: MCDifficulty;
	clearRate: number;
	gameStyle: APIGameStyle;
	theme: APITheme;
	numLikes: number;
	numPlays: number;
	likeToPlayRatio: number;
	numComments: number;
	description: string;
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
	avgComments: number;
	avgTags: {[key in MCTag]: number};
	isPromotedByPatron: boolean;
};

export interface MCUserDocData {
	id: string;
	pid: string;
	name: string;
	likes: number;
	makerPoints: number;
	docVer: 0;
}

export interface MCWorldInfo extends MCWorldLevelAggregation {
	numLevels: number;
	numWorlds: number;
	created: number;
	keywords: string[];
	totalLikes: number;
	totalPlays: number;
	featuredLevelIds: string[];
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

export interface MCRawLevelDoc {
	data_id: number,
	name: string,
	description: string,
	uploaded: number,
	course_id: string,
	gamestyle: DBGameStyle,
	theme: DBTheme,
	difficulty: DBDifficulty,
	tag1: DBTag,
	tag2: DBTag,
	world_record: number,
	upload_time: number,
	num_comments: number,
	clear_condition: DBClearCondition,
	clear_condition_magnitude: number,
	clears: number,
	attempts: number,
	clear_rate: number,
	plays: number,
	versus_matches: number,
	coop_matches: number,
	likes: number,
	boos: number,
	unique_players_and_versus: number,
	weekly_likes: number,
	weekly_plays: number,
	uploader: MCRawUserPreview,
	first_completer: MCRawUserPreview,
	record_holder: MCRawUserPreview,
}

export interface MCRawUserPreview {
	name: string;
	pid: string;
	makerId: string;
	region: UserRegion;
	country: string;
	medals: MCRawMedal[];
	likes: number;
	maker_points: number;
	mii_image: string;
	mii_studio_code: string;
	has_super_world: boolean;
}

export interface MCRawUserDoc {
	pid: string,
	data_id: number,
	code: string,
	region: UserRegion,
	name: string,
	country: string,
	last_active: number,
	mii_image: string,
	mii_studio_code: string,
	courses_played: number,
	courses_cleared: number,
	courses_attempted: number,
	courses_deaths: number,
	likes: number,
	maker_points: number,
	easy_highscore: number,
	normal_highscore: number,
	expert_highscore: number,
	super_expert_highscore: number,
	versus_rating: number,
	versus_rank: VersusRank,
	versus_won: number,
	versus_lost: number,
	versus_win_streak: number,
	versus_lose_streak: number,
	versus_plays: number,
	versus_disconnected: number,
	coop_clears: number,
	coop_plays: number,
	recent_performance: number,
	versus_kills: number,
	versus_killed_by_others: number,
	first_clears: number,
	world_records: number,
	unique_super_world_clears: number,
	uploaded_levels: number,
	weekly_maker_points: number,
	last_uploaded_level: number,
	is_nintendo_employee: number,
	comments_enabled: number,
	tags_enabled: number,
	super_world: MCRawSuperWorld;
}

export interface MCRawMedal {
	type: number;
	rank: number;
}

export interface MCRawSuperWorld {
	world_id: string,
	worlds: number,
	levels: number,
	planet_type: number,
	created: number,
	aggregated_properties: MCRawLevelAggregation,
}

export interface MCRawLevelAggregation {
	avg_uploaded: number;
	avg_difficulty: {[key in DBDifficulty]: number};
	avg_clear_rate: number;
	avg_gamestyle: {[key in DBGameStyle]: number};
	avg_theme: {[key in DBTheme]: number};
	avg_likes: number;
	avg_plays: number;
	avg_like_to_play_ratio: number;
	avg_comments: number;
	avg_tags: {[key in DBTag]: number};
	top_levels: MCRawWorldLevelPreview[];
}

export interface MCRawWorldLevelPreview {
	data_id: number,
	name: string,
	course_id: string,
	plays: number,
	likes: number,
	boos: number,
}

export interface MCRawSuperWorldDoc extends MCRawSuperWorld {
	pid: string;
	maker_id: string;
	level_previews: MCRawWorldLevelPreview[];
}
