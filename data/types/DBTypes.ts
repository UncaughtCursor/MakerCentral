export interface DBLevel {
	data_id: number;
    name: string;
    description: string;
    uploaded: number;
    course_id: string;
    gamestyle: DBGameStyle;
    theme: DBTheme;
    difficulty: DBDifficulty;
    tag1: DBTag;
    tag2: DBTag;
    world_record: number;
    upload_time: number;
    num_comments: number;
    clear_condition: DBClearCondition;
    clear_condition_magnitude: number;
    clears: number;
    attempts: number;
    clear_rate: number;
    plays: number;
    versus_matches: number;
    coop_matches: number;
    likes: number;
    boos: number;
    unique_players_and_versus: number;
    weekly_likes: number;
    weekly_plays: number;
    one_screen_thumbnail: Buffer;
    one_screen_thumbnail_url: string;
    one_screen_thumbnail_size: number;
    one_screen_thumbnail_filename: string;
    entire_thumbnail: Buffer;
    entire_thumbnail_url: string;
    entire_thumbnail_size: number;
    entire_thumbnail_filename: string;
    uploader_pid: string;
    first_completer_pid?: string;
    record_holder_pid?: string;
    level_data: Buffer;
    unk2: number;
    unk3: Buffer;
    unk9: number;
    unk10: number;
    unk11: number;
    unk12: number;
}

export interface APILevel {
	data_id: number;
    name: string;
    description: string;
    uploaded: number;
    course_id: string;
    game_style: DBGameStyle;
    theme: DBTheme;
    difficulty: DBDifficulty;
    tag1: DBTag;
    tag2: DBTag;
    world_record: number;
    upload_time: number;
    num_comments: number;
    clear_condition: DBClearCondition;
    clear_condition_magnitude: number;
    clears: number;
    attempts: number;
    clear_rate: number;
    plays: number;
    versus_matches: number;
    coop_matches: number;
    likes: number;
    boos: number;
    unique_players_and_versus: number;
    weekly_likes: number;
    weekly_plays: number;
    one_screen_thumbnail: Buffer;
    one_screen_thumbnail_url: string;
    one_screen_thumbnail_size: number;
    one_screen_thumbnail_filename: string;
    entire_thumbnail: Buffer;
    entire_thumbnail_url: string;
    entire_thumbnail_size: number;
    entire_thumbnail_filename: string;
    uploader_pid: string;
    first_completer_pid?: string;
    record_holder_pid?: string;
    level_data: Buffer;
    unk2: number;
    unk3: Buffer;
    unk9: number;
    unk10: number;
    unk11: number;
    unk12: number;
}

export enum DBGameStyle {
	'SMB1' = 0,
	'SMB3' = 1,
	'SMW' = 2,
	'NSMBU' = 3,
	'SM3DW' = 4
}

export enum DBTheme {
    'Overworld' = 0,
	'Underground' = 1,
	'Castle' = 2,
	'Airship' = 3,
	'Underwater' = 4,
	'Ghost House' = 5,
	'Snow' = 6,
	'Desert' = 7,
	'Sky' = 8,
	'Forest' = 9
}

export enum DBDifficulty {
	'Easy' = 0,
	'Normal' = 1,
	'Expert' = 2,
	'Super expert' = 3
}

export enum DBTag {
	'None' = 0,
	'Standard' = 1,
	'Puzzle solving' = 2,
	'Speedrun' = 3,
	'Autoscroll' = 4,
	'Auto mario' = 5,
	'Short and sweet' = 6,
	'Multiplayer versus' = 7,
	'Themed' = 8,
	'Music' = 9,
	'Art' = 10,
	'Technical' = 11,
	'Shooter' = 12,
	'Boss battle' = 13,
	'Single player' = 14,
	'Link' = 15,
}

export enum DBClearCondition {
    'None' = 0,
	"Don't land after leaving the ground" = 137525990,
	'Defeat mechakoopa' = 199585683,
	'Defeat cheep cheep' = 272349836,
	"Don't take damage" = 375673178,
	'Be boomerang mario' = 426197923,
	'Wear a shoe' = 436833616,
	'Be fire mario' = 713979835,
	'Be frog mario' = 744927294,
	'Defeat larry' = 751004331,
	'Be raccoon mario' = 900050759,
	'Defeat blooper' = 947659466,
	'Be propeller mario' = 976173462,
	'Wear a propeller box' = 994686866,
	'Defeat spike' = 998904081,
	'Defeat boom boom' = 1008094897,
	'Hold a koopa shell' = 1051433633,
	'Defeat porcupuffer' = 1061233896,
	'Defeat charvaargh' = 1062253843,
	'Defeat bullet bill' = 1079889509,
	'Defeat bully bullies' = 1080535886,
	'Wear a goomba mask' = 1151250770,
	'Defeat hop chops' = 1182464856,
	'Hold or activate a red pow block' = 1219761531,
	'Defeat bob omb' = 1221661152,
	'Defeat spiny spinies' = 1259427138,
	'Defeat bowser meowser' = 1268255615,
	'Defeat ant trooper' = 1279580818,
	'Ride on a lakitus cloud' = 1283945123,
	'Defeat boo' = 1344044032,
	'Defeat roy' = 1425973877,
	'Hold a trampoline' = 1429902736,
	'Defeat morton' = 1431944825,
	'Defeat fish bone' = 1446467058,
	'Defeat monty mole' = 1510495760,
	'after picking up 1 up mushroom' = 1656179347,
	'Defeat hammer bro' = 1665820273,
	'Hit or hold a p switch' = 1676924210,
	'Activate or hold a pow block' = 1715960804,
	'Defeat angry sun' = 1724036958,
	'Defeat pokey' = 1730095541,
	'Be superball mario' = 1780278293,
	'Defeat pom pom' = 1839897151,
	'Defeat peepa' = 1969299694,
	'Defeat lakitu' = 2035052211,
	'Defeat lemmy' = 2038503215,
	'Defeat lava bubble' = 2048033177,
	'Wear a bullet bill mask' = 2076496776,
	'Be big mario' = 2089161429,
	'Be cat mario' = 2111528319,
	'Defeat goomba galoomba' = 2131209407,
	'Defeat thwomp' = 2139645066,
	'Defeat iggy' = 2259346429,
	'Wear a dry bones shell' = 2549654281,
	'Defeat sledge bro' = 2694559007,
	'Defeat rocky wrench' = 2746139466,
	'Grabbing 50 coin' = 2749601092,
	'Be flying squirrel mario' = 2855236681,
	'Be buzzy mario' = 3036298571,
	'Be builder mario' = 3074433106,
	'Be cape mario' = 3146932243,
	'Defeat wendy' = 3174413484,
	'Wear a cannon box' = 3206222275,
	'Be link' = 3314955857,
	'Have super star invincibility' = 3342591980,
	'Defeat goombrat goombud' = 3346433512,
	'Grab 10 coin' = 3348058176,
	'Defeat buzzy beetle' = 3353006607,
	'Defeat bowser jr' = 3392229961,
	'Defeat koopa troopa' = 3437308486,
	'Defeat chain chomp' = 3459144213,
	'Defeat muncher' = 3466227835,
	'Defeat wiggler' = 3481362698,
	'Be smb2 mario' = 3513732174,
	'Be in a clown car' = 3649647177,
	'Be spiny mario' = 3725246406,
	'Be in a koopa troopa car' = 3730243509,
	'Defeat piranha plant jumping piranha plant' = 3748075486,
	'Defeat dry bones' = 3797704544,
	'Defeat stingby stingbies' = 3824561269,
	'Defeat piranha creeper' = 3833342952,
	'Defeat fire piranha plant' = 3842179831,
	'Break crates' = 3874680510,
	'Defeat ludwig' = 3974581191,
	'Be super mario' = 3977257962,
	'Defeat skipsqueak' = 4042480826,
	'Grab coin' = 4116396131,
	'Defeat magikoopa' = 4117878280,
	'Grab 30 coin' = 4122555074,
	'Be balloon mario' = 4153835197,
	'Wear a red pow box' = 4172105156,
	'Be on yoshi' = 4209535561,
	'Defeat spike top' = 4269094462,
	'Defeat banzai bill' = 4293354249
}

export interface DBUser {
    pid: string;
    data_id: number;
    code: string;
    region: UserRegion;
    name: string;
    country: string;
    last_active: number;
    mii_data: Buffer;
    mii_image: string;
    mii_studio_code: string;
    pose: number;
    hat: number;
    shirt: number;
    pants: number;
    wearing_outfit: number;
    courses_played: number;
    courses_cleared: number;
    courses_attempted: number;
    courses_deaths: number;
    likes: number;
    maker_points: number;
    easy_highscore: number;
    normal_highscore: number;
    expert_highscore: number;
    super_expert_highscore: number;
    versus_rating: number;
    versus_rank: VersusRank;
    versus_won: number;
    versus_lost: number;
    versus_win_streak: number;
    versus_lose_streak: number;
    versus_plays: number;
    versus_disconnected: number;
    coop_clears: number;
    coop_plays: number;
    recent_performance: number;
    versus_kills: number;
    versus_killed_by_others: number;
    multiplayer_unk13: number;
    multiplayer_unk14: number;
    first_clears: number;
    world_records: number;
    unique_super_world_clears: number;
    uploaded_levels: number;
    maximum_uploaded_levels: number;
    weekly_maker_points: number;
    last_uploaded_level: number;
    is_nintendo_employee: number;
    comments_enabled: number;
    tags_enabled: number;
    super_world_id: string;
    unk3: number;
    unk12: number;
    unk16: number;
}

export interface DBSuperWorld {
	id: string;
	worlds: number;
	levels: number;
	planet_type: number;
	created: number;
	ninjis: number[];
	unk5: number;
	unk6: number;
	unk7: number;
	thumbnail: {
		url: string;
		size: number;
		filename: string;
	},
	courses: number[];
}

export enum UserRegion {
	'Asia' = 0,
	'Americas' = 1,
	'Europe' = 2,
	'Other' = 3,
}

export enum VersusRank {
	'D' = 1,
	'C' = 2,
	'B' = 3,
    'A' = 4,
    'S' = 5,
    'S+' = 6
}
