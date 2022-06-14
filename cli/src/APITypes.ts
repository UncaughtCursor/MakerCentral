export interface APIError {
	error: string;
}

export interface APILevel {
	name: string,
	description: string
	uploaded_pretty: string,
	uploaded: number,
	data_id: number,
	course_id: string,
	game_style_name: APIGameStyle,
	game_style: number,
	theme_name: APITheme,
	theme: number,
	difficulty_name: APIDifficulty,
	difficulty: number,
	tags_name: APITag[],
	tags: number[],
	world_record_pretty: string,
	world_record: number,
	upload_time_pretty: string,
	upload_time: number,
	num_comments: number,
	clear_condition: number,
	clear_condition_magnitude: number,
	clears: number,
	attempts: number,
	clear_rate: string,
	plays: number,
	versus_matches: number,
	coop_matches: number,
	likes: number,
	boos: number,
	unique_players_and_versus: number,
	weekly_likes: number,
	weekly_plays: number,
	one_screen_thumbnail: APIImage,
	entire_thumbnail: APIImage,
	unk2: number,
	unk3: string,
	unk9: number,
	unk10: number,
	unk11: number,
	unk12: number,
	uploader: APIUser,
	first_completer: APIUser,
	record_holder: APIUser,
}

export interface APIUser {
	region: number,
	region_name: 'Asia' | 'Americas' | 'Europe' | 'Other',
	code: string,
	pid: number,
	name: string,
	country: string,
	last_active: number,
	last_active_pretty: string,
	mii_data: string,
	mii_image: string,
	mii_studio_code: string,
	pose: number,
	hat: number,
	shirt: number,
	pants: number,
	pose_name: string,
	hat_name: string,
	shirt_name: string,
	pants_name: string,
	wearing_outfit: boolean,
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
	versus_rank: number,
	versus_rank_name: 'D' | 'C' | 'B' | 'A' | 'S' | 'S+',
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
	multiplayer_stats_unk13: number,
	multiplayer_stats_unk14: number,
	first_clears: number,
	world_records: number,
	unique_super_world_clears: number,
	uploaded_levels: number,
	maximum_uploaded_levels: number,
	weekly_maker_points: number,
	last_uploaded_level: number,
	last_uploaded_level_pretty: string,
	is_nintendo_employee: boolean,
	comments_enabled: boolean,
	tags_enabled: boolean,
	super_world_id: string,
	badges: APIBadge,
	unk3: boolean,
	unk12: boolean,
	unk16: boolean
}

export interface APIComment {
	comment_id: string,
	text?: string,
	type_name: 'Text' | 'Custom Image' | 'Reaction Image',
	type: number,
	custom_comment_image?: APIImage,
	reaction_image_id?: number,
	reaction_image_id_name?: APICommentReaction,
	posted_pretty: string,
	posted: number,
	clear_required: boolean,
	has_beaten: boolean,
	x: number,
	y: number,
	reaction_face: number,
	reaction_face_name: 'Normal' | 'Happy' | 'Wink' | 'Surprised' | 'Scared' | 'Confused',
	unk8: number,
	unk10: number,
	unk12: boolean,
	unk14: string,
	unk17: number,
	poster: APIUser,
}

export interface APIImage {
	url: string,
	size: number,
	filename: string,
}

export type APIGameStyle = 'SMB1' | 'SMB3' | 'SMW' | 'NSMBU' | 'SM3DW';

const APIThemes = [
	'Overworld', 'Underground',
	'Castle', 'Airship',
	'Underwater', 'Ghost house',
	'Snow', 'Desert',
	'Sky', 'Forest',
] as const;
export type APITheme = typeof APIThemes[number];

const APITags = [
	'None', 'Standard',
	'Puzzle solving', 'Speedrun',
	'Autoscroll', 'Auto mario',
	'Short and sweet', 'Multiplayer versus',
	'Themed', 'Music',
	'Art', 'Technical',
	'Shooter', 'Boss battle',
	'Single player', 'Link',
] as const;
export type APITag = typeof APITags[number];

const APIDifficulties = [
	'Easy', 'Normal', 'Expert', 'Super expert',
] as const;
export type APIDifficulty = typeof APIDifficulties[number];

const APIBadges = [
	'Maker Points (All-Time)',
	'Endless Challenge (Easy)',
	'Endless Challenge (Normal)',
	'Endless Challenge (Expert)',
	'Endless Challenge (Super Expert)',
	'Multiplayer Versus',
	'Number of Clears',
	'Number of First Clears',
	'Number of World Records',
	'Maker Points (Weekly)',
] as const;
export type APIBadge = typeof APIBadges[number];

const APICommentReactions = [
	'Nice!', 'Good stuff!',
	'So tough...', 'EASY',
	'Seriously?!', 'Wow!',
	'Cool idea!', 'SPEEDRUN!',
	'How?!', 'Be careful!',
	'So close!', 'Beat it!',
] as const;
export type APICommentReaction = typeof APICommentReactions[number];
