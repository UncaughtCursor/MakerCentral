import {
	DBClearCondition, DBDifficulty, DBGameStyle, DBTag, DBTheme, UserRegion, VersusRank,
} from './DBTypes';

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
	world_record: number | null,
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
	first_completer: MCRawUserPreview | null,
	record_holder: MCRawUserPreview | null,
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
	medals: MCRawMedal[],
	super_world: MCRawSuperWorld | null,
}

export interface MCRawMedal {
	type: number;
	rank: number;
}

export interface MCRawLevelAggregationUnit {
	name: string;
	code: string;
	uploaded: number;
	difficulty: DBDifficulty;
	clear_rate: number;
	gamestyle: DBGameStyle;
	theme: DBTheme;
	likes: number;
	plays: number;
	like_to_play_ratio: number;
	tags: DBTag[];
	upload_time: number;
	uploader_pid: string;
}

export interface MCRawSuperWorld {
	world_id: string,
	worlds: number,
	levels: number,
	planet_type: number,
	created: number,
	aggregated_properties: MCRawLevelAggregation,
	level_info: MCRawWorldLevelPreview[];
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
	avg_tags: {[key in DBTag]: number};
	avg_upload_time: number;
}

export interface MCRawWorldLevelPreview {
	name: string,
	course_id: string,
	plays: number,
	likes: number,
}
