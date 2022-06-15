export interface LevelFileData {
	startY: number;
	goalY: number;
	goalX: number;
	timer: number;
	clearConditionMagnitude: number;
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	autoscroll: keyof typeof AutoscrollSpeed;
	clearConditionCategory: keyof typeof ClearConditionCategory;
	clearCondition: keyof typeof ClearCondition;
	unkGameVersion: number;
	unkManagementFlags: number;
	clearAttempts: number;
	clearTime: number;
	creationId: number;
	unkUploadId: bigint;
	gameVersion: keyof typeof GameVersion;
	unk1: number;
	gameStyle: keyof typeof LevelDataGameStyle;
	unk2: number;
	name: string;
	description: string;
	overworld: LevelFileArea;
	subworld: LevelFileArea;
}

export interface LevelFileArea {
	theme: keyof typeof Theme;
	autoscrollType: keyof typeof AutoscrollType;
	boundaryType: keyof typeof BoundaryType;
	orientation: keyof typeof Orientation;
	liquidEndHeight: number;
	liquidMode: keyof typeof LiquidMode;
	liquidSpeed: keyof typeof LiquidSpeed;
	liquidStartHeight: number;
	boundaryRight: number;
	boundaryTop: number;
	boundaryLeft: number;
	boundaryBottom: number;
	unkFlag: number;
	objectCount: number;
	soundEffectCount: number;
	snakeBlockCount: number;
	clearPipeCount: number;
	piranhaCreeperCount: number;
	exclamationMarkBlockCount: number;
	trackBlockCount: number;
	unk1: number;
	groundCount: number;
	trackCount: number;
	icicleCount: number;
	objects: LevelObject[];
	sounds: Sound[];
	snakes: SnakeBlock[];
	clearPipes: ClearPipe[];
	piranhaCreepers: GenericNodeGroupObject[];
	exclamationBlocks: GenericNodeGroupObject[];
	trackBlocks: GenericNodeGroupObject[];
	ground: Ground[];
	tracks: Track[];
	icicles: Icicle[];
}

export interface LevelObject {
	x: number;
	y: number;
	unk1: number;
	width: number;
	height: number;
	flags: number;
	cflags: number;
	ex: number;
	objId: keyof typeof ObjectID;
	cid: number;
	lid: number;
	sid: number;
}

export interface Ground {
	x: number;
	y: number;
	id: number;
	backgroundId: number;
}

export interface Sound {
	id: number;
	x: number;
	y: number;
	unk1: number;
}

export interface SnakeBlock {
	index: number;
	nodeCount: number;
	unk1: number;
	nodes: SnakeBlockNode[];
}

export interface SnakeBlockNode {
	index: number;
	direction: number;
	unk1: number;
}

export interface ClearPipe {
	index: number;
	nodeCount: number;
	unk1: number;
	nodes: ClearPipeNode[];
}

export interface ClearPipeNode {
	type: number;
	index: number;
	x: number;
	y: number;
	width: number;
	height: number;
	unk1: number;
	direction: number;
}

export interface GenericNodeGroupObject {
	unk1: number;
	index: number;
	nodeCount: number;
	unk2: number;
	nodes: GenericNode[];
}

export interface GenericNode {
	unk1: number;
	direction: number;
	unk2: number;
}

export interface Track {
	unk1: number;
	flags: number;
	x: number;
	y: number;
	type: number;
	lid: number;
	unk2: number;
	unk3: number;
}

export interface Icicle {
	x: number;
	y: number;
	type: number;
	unk1: number;
}

export enum ClearCondition {
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

export enum LevelDataGameStyle {
	'SMB1' = 12621,
	'SMB3' = 13133,
	'NSMBU' = 21847,
	'SM3DW' = 22323,
	'SMW' = 22349
}

export enum GameVersion {
	'v1.0.0' = 0,
	'v1.0.1' = 1,
	'v1.1.0'= 2,
	'v2.0.0' = 3,
	'v3.0.0' = 4,
	'v3.0.1' = 5,
	'Unknown Version' = 33
}

export enum ClearConditionCategory {
	'None' = 0,
	'Parts' = 1,
	'Status' = 2,
	'Actions' = 3
}

export enum BoundaryType { 'Built Above Line' = 0, 'Built Below Line' = 1 }

export enum AutoscrollType {
	'None' = 0,
	'Slow' = 1,
	'Medium' = 2,
	'Fast' = 3,
	'Custom' = 4
}

export enum AutoscrollSpeed { 'Slow' = 0, 'Medium', 'Fast' = 2 }

export enum Orientation { 'Horizontal' = 0, 'Vertical' = 1 }

export enum Theme {
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

export enum LiquidMode {
	'Static' = 0,
	'Rising or Falling' = 1,
	'Rising and Falling' = 2
}

export enum LiquidSpeed {
	'None' = 0,
	'Slow' = 1,
	'Medium' = 2,
	'Fast' = 3
}

export enum ObjectID {
	'Goomba' = 0,
	'Koopa' = 1,
	'Piranha Flower' = 2,
	'Hammer Bro' = 3,
	'Block' = 4,
	'Question Block' = 5,
	'Hard Block' = 6,
	'Ground' = 7,
	'Coin' = 8,
	'Pipe' = 9,
	'Spring' = 10,
	'Lift' = 11,
	'Thwomp' = 12,
	'Bullet Bill Blaster' = 13,
	'Mushroom Platform' = 14,
	'Bob Omb' = 15,
	'Semisolid Platform' = 16,
	'Bridge' = 17,
	'P Switch' = 18,
	'POW' = 19,
	'Super Mushroom' = 20,
	'Donut Block' = 21,
	'Cloud' = 22,
	'Note Block' = 23,
	'Fire Bar' = 24,
	'Spiny' = 25,
	'Goal Ground' = 26,
	'Goal' = 27,
	'Buzzy Beetle' = 28,
	'Hidden Block' = 29,
	'Lakitu' = 30,
	'Lakitu Cloud' = 31,
	'Banzai Bill' = 32,
	'One Up' = 33,
	'Fire Flower' = 34,
	'Super Star' = 35,
	'Lava Lift' = 36,
	'Starting Brick' = 37,
	'Starting Arrow' = 38,
	'Magikoopa' = 39,
	'Spike Top' = 40,
	'Boo' = 41,
	'Clown Car' = 42,
	'Spikes' = 43,
	'Big Mushroom' = 44,
	'Shoe Goomba' = 45,
	'Dry Bones' = 46,
	'Cannon' = 47,
	'Blooper' = 48,
	'Castle Bridge' = 49,
	'Jumping Machine' = 50,
	'Skipsqueak' = 51,
	'Wiggler' = 52,
	'Fast Conveyor Belt' = 53,
	'Burner' = 54,
	'Door' = 55,
	'Cheep Cheep' = 56,
	'Muncher' = 57,
	'Rocky Wrench' = 58,
	'Track' = 59,
	'Lava Bubble' = 60,
	'Chain Chomp' = 61,
	'Bowser' = 62,
	'Ice Block' = 63,
	'Vine' = 64,
	'Stingby' = 65,
	'Arrow' = 66,
	'One Way' = 67,
	'Saw' = 68,
	'Player' = 69,
	'Big Coin' = 70,
	'Half Collision Platform' = 71,
	'Koopa Car' = 72,
	'Cinobio' = 73,
	'Spike Ball' = 74,
	'Stone' = 75,
	'Twister' = 76,
	'Boom Boom' = 77,
	'Pokey' = 78,
	'P Block' = 79,
	'Sprint Platform' = 80,
	'Smb2 Mushroom' = 81,
	'Donut' = 82,
	'Skewer' = 83,
	'Snake Block' = 84,
	'Track Block' = 85,
	'Charvaargh' = 86,
	'Slight Slope' = 87,
	'Steep Slope' = 88,
	'Reel Camera' = 89,
	'Checkpoint Flag' = 90,
	'Seesaw' = 91,
	'Red Coin' = 92,
	'Clear Pipe' = 93,
	'Conveyor Belt' = 94,
	'Key' = 95,
	'Ant Trooper' = 96,
	'Warp Box' = 97,
	'Bowser Jr' = 98,
	'On Off Block' = 99,
	'Dotted Line Block' = 100,
	'Water Marker' = 101,
	'Monty Mole' = 102,
	'Fish Bone' = 103,
	'Angry Sun' = 104,
	'Swinging Claw' = 105,
	'Tree' = 106,
	'Piranha Creeper' = 107,
	'Blinking Block' = 108,
	'Sound Effect' = 109,
	'Spike Block' = 110,
	'Mechakoopa' = 111,
	'Crate' = 112,
	'Mushroom Trampoline' = 113,
	'Porkupuffer' = 114,
	'Cinobic' = 115,
	'Super Hammer' = 116,
	'Bully' = 117,
	'Icicle' = 118,
	'Exclamation Block' = 119,
	'Lemmy' = 120,
	'Morton' = 121,
	'Larry' = 122,
	'Wendy' = 123,
	'Iggy' = 124,
	'Roy' = 125,
	'Ludwig' = 126,
	'Cannon Box' = 127,
	'Propeller Box' = 128,
	'Goomba Mask' = 129,
	'Bullet Bill Mask' = 130,
	'Red POW Box' = 131,
	'On Off Trampoline' = 132
}
