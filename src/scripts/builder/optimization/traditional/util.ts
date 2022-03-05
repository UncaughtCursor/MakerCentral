/* eslint-disable require-jsdoc */
import { EntityType } from '@data/MakerConstants';
import { Setup } from './AlphaOptimizer';
import Blueprint from './Blueprint';
import CollisionBox from './CollisionBox';

export const maxLevelWidth = 240;
export const levelHeight = 27;

export function getStructTemplate(n: number) {
	// TODO: Allow other setups to be in cells after fixing interactions
	switch (n) {
	case 0:
		return {
			blueprint: getBlueprint(n),
			entityPos: [{ x: 1, y: 2 }],
			entityProperties: [{ parachute: false }],
			xOfs: -1,
			yOfs: -3,
			collisionBox: getColBox(n),
			canBeInCell: true,
			hasFall: false,
			hasParachute: false,
		};
	case 1:
		return {
			blueprint: getBlueprint(n),
			entityPos: [{ x: 1, y: 2 }],
			entityProperties: [{ parachute: false }],
			xOfs: -1,
			yOfs: -5,
			collisionBox: getColBox(n),
			canBeInCell: false,
			hasFall: true,
			hasParachute: false,
		};
	case 2:
		return {
			blueprint: getBlueprint(n),
			entityPos: [{ x: 1, y: 2 }],
			entityProperties: [{ parachute: true }],
			xOfs: -1,
			yOfs: -4,
			collisionBox: getColBox(n),
			canBeInCell: false,
			hasFall: false,
			hasParachute: true,
		};
	case 3:
		return {
			blueprint: getBlueprint(n),
			entityPos: [{ x: 1, y: 2 }],
			entityProperties: [{ parachute: true }],
			xOfs: -1,
			yOfs: -5,
			collisionBox: getColBox(n),
			canBeInCell: false,
			hasFall: false,
			hasParachute: true,
		};
	case 4:
		return {
			blueprint: getBlueprint(n),
			entityPos: [{ x: 1, y: 2 }],
			entityProperties: [{ parachute: true }],
			xOfs: -1,
			yOfs: -6,
			collisionBox: getColBox(n),
			canBeInCell: false,
			hasFall: false,
			hasParachute: true,
		};
	case 5:
		return {
			blueprint: getBlueprint(n),
			entityPos: [{ x: 1, y: 2 }],
			entityProperties: [{ parachute: false }],
			xOfs: -1,
			yOfs: -6,
			collisionBox: getColBox(n),
			canBeInCell: false,
			hasFall: true,
			hasParachute: false,
		};
	case 6:
		return {
			blueprint: getBlueprint(n),
			entityPos: [{ x: 1, y: 2 }],
			entityProperties: [{ parachute: false }],
			xOfs: -1,
			yOfs: -4,
			collisionBox: getColBox(n),
			canBeInCell: false,
			hasFall: true,
			hasParachute: false,
		};

	default:
		console.log('invalid setup');
		return null;
	}
}

export function getBlueprint(n: number) {
	switch (n) {
	case 0:
		return new Blueprint([
			[0, 1, 0],
			[1, 0, 1],
			[1, 2, 1],
			[0, 3, 0],
		]);
	case 1:
		return new Blueprint([
			[0, 1, 0],
			[1, 0, 1],
			[1, 2, 1],
			[1, 0, 1],
			[1, 0, 1],
			[0, 3, 0],
		]);
	case 2:
		return new Blueprint([
			[0, 1, 0],
			[1, 0, 1],
			[1, 2, 1],
			[1, 0, 1],
			[0, 3, 0],
		]);
	case 3:
		return new Blueprint([
			[0, 1, 0],
			[1, 0, 1],
			[1, 2, 1],
			[1, 0, 1],
			[1, 0, 1],
			[0, 3, 0],
		]);
	case 4:
		return new Blueprint([
			[0, 1, 0],
			[1, 0, 1],
			[1, 2, 1],
			[1, 0, 1],
			[1, 0, 1],
			[1, 0, 1],
			[0, 3, 0],
		]);
	case 5:
		return new Blueprint([
			[0, 1, 0],
			[1, 0, 1],
			[1, 2, 1],
			[1, 0, 1],
			[1, 0, 1],
			[1, 0, 1],
			[0, 3, 0],
		]);
	case 6:
		return new Blueprint([
			[0, 1, 0],
			[1, 0, 1],
			[1, 2, 1],
			[1, 0, 1],
			[0, 3, 0],
		]);
	default:
		console.log('invalid blueprint');
		return null;
	}
}
export function getColBox(n: number) {
	switch (n) {
	case 0:
		return new CollisionBox(1, 1, 1, 3);
	case 1:
		return new CollisionBox(1, 1, 1, 5);
	case 2:
		return new CollisionBox(1, 1, 1, 4);
	case 3:
		return new CollisionBox(1, 1, 1, 5);
	case 4:
		return new CollisionBox(1, 1, 1, 6);
	case 5:
		return new CollisionBox(1, 1, 1, 6);
	case 6:
		return new CollisionBox(1, 1, 1, 4);
	default:
		console.log('invalid collision box');
		return null;
	}
}

interface Rectangle {
    x1: number,
    y1: number,
    x2: number,
    y2: number,
}

export function getRectangleDist(r1: Rectangle, r2: Rectangle) { // Thanks tint
	const xdist = Math.max(r1.x1 - r2.x2, r2.x1 - r1.x2);
	const ydist = Math.max(r1.y1 - r2.y2, r2.y1 - r1.y2);
	return { xdist, ydist };
}

interface MM2Tempo {
	name: string,
	bpm: number,
	isCommon: boolean,
	isBuildable: boolean,
	setups: Setup[],
}

export const MM2Tempos: MM2Tempo[] = [
	{
		name: 'Slow Autoscroll',
		bpm: 28,
		isCommon: false,
		isBuildable: true,
		setups: [],
	},
	{
		name: 'Medium Autoscroll',
		bpm: 56,
		isCommon: true,
		isBuildable: true,
		setups: [],
	},
	{
		name: 'Walking',
		bpm: 84,
		isCommon: true,
		isBuildable: true,
		setups: [],
	},
	{
		name: 'Fast Autoscroll',
		bpm: 112,
		isCommon: true,
		isBuildable: true,
		setups: [],
	},
	{
		name: 'Fast Lava Lift',
		bpm: 140,
		isCommon: true,
		isBuildable: true,
		setups: [],
	},
	{
		name: 'Running',
		bpm: 168,
		isCommon: true,
		isBuildable: true,
		setups: [],
	},
	{
		name: 'Fast Conveyor - Walking',
		bpm: 194,
		isCommon: false,
		isBuildable: false,
		setups: [],
	},
	{
		name: 'Normal Conveyor - Running',
		bpm: 227,
		isCommon: false,
		isBuildable: false,
		setups: [],
	},
	{
		name: 'Blaster in Cloud - Running',
		bpm: 256,
		isCommon: false,
		isBuildable: false,
		setups: [],
	},
	{
		name: 'Fast Conveyor - Running',
		bpm: 279,
		isCommon: false,
		isBuildable: false,
		setups: [],
	},
];

export const defaultSetups = [
	{ offset: 0, structType: 0, usesSemisolid: false },
];

// This and redundant code will be removed if it turns out semisolids are not additive
export const semisolidDelay = -17;

// NOTE: Time units per block = (60/(4 * bpm)) * 200
// # of Blocks = (setup time units) / (tempo time units per block)
// Accuracy error in seconds =
// ( Abs(target fraction - actual fraction) * Time units per block ) / 200

export const standardBuildSetups = [
	{ structType: 0, usesSemisolid: false, timeDelay: 0 }, // Default
	{ structType: 0, usesSemisolid: true, timeDelay: semisolidDelay }, // Default + Semisolid
	{ structType: 6, usesSemisolid: false, timeDelay: 39 }, // 1 Block Drop
	// 1 Block Drop + Semisolid
	{ structType: 6, usesSemisolid: true, timeDelay: 39 + semisolidDelay },
	{ structType: 2, usesSemisolid: false, timeDelay: 166 }, // 1 Block Parachute
	// 1 Block Parachute + Semisolid
	{ structType: 2, usesSemisolid: true, timeDelay: 166 + semisolidDelay },
	{ structType: 1, usesSemisolid: false, timeDelay: 56 }, // 2 Block Drop
	// 2 Block Drop + Semisolid
	{ structType: 1, usesSemisolid: true, timeDelay: 56 + semisolidDelay },
	{ structType: 3, usesSemisolid: false, timeDelay: 301 }, // 2 Block Parachute
	// 2 Block Parachute + Semisolid
	{ structType: 3, usesSemisolid: true, timeDelay: 301 + semisolidDelay },
	{ structType: 5, usesSemisolid: false, timeDelay: 72 }, // 3 Block Drop
	// 3 Block Drop + Semisolid
	{ structType: 5, usesSemisolid: true, timeDelay: 72 + semisolidDelay },
	{ structType: 4, usesSemisolid: false, timeDelay: 434 }, // 3 Block Parachute
	// 3 Block Parachute + Semisolid
	{ structType: 4, usesSemisolid: true, timeDelay: 434 + semisolidDelay },
];

const showSetupLogs = false;
export const soundSubframesPerSecond = 200;
export const setupErrorToleranceSeconds = 0.035;

// TODO: Compute available setups for each note to allow triplets and fractional bpbs
// i.e. notes that are not aligned to the grid

MM2Tempos.forEach((thisTempo) => {
	const timePerBlock = (60 / (4 * thisTempo.bpm)) * soundSubframesPerSecond;
	if (showSetupLogs) console.log(`${thisTempo.name}\n\n`);
	standardBuildSetups.forEach((setup) => {
		const setupBlocks = setup.timeDelay / timePerBlock;
		const frac = setupBlocks - Math.round(setupBlocks);
		const secondsError = (Math.abs(frac) * timePerBlock) / soundSubframesPerSecond;
		if (secondsError < setupErrorToleranceSeconds && Math.round(setupBlocks) < 25) {
			if (showSetupLogs) {
				console.log(`\nsetup: ${setup.structType}, semisolid: ${setup.usesSemisolid}`);
				console.log(`approx. ${Math.round(setupBlocks)} blocks`);
				console.log(`${setupBlocks} blocks`);
				console.log(`${secondsError} seconds of error`);
				// numSetupsFound++;
			}
			thisTempo.setups.push({
				structType: setup.structType,
				usesSemisolid: setup.usesSemisolid,
				offset: -Math.round(setupBlocks),
			});
		}
	});
});

/**
 * Converts a legacy entity id number to the proper entity name.
 * @param id The entity id to convert to a name.
 * @returns The game entity associated with the ID number.
 */
export function entityIdToName(id: number): EntityType {
	switch (id) {
	case 2: return 'Goomba';
	case 4: return '1-Up';
	case 5: return 'Spike Top';
	case 6: return 'Sledge Bro';
	case 7: return 'Piranha Plant';
	case 8: return 'Bob-Omb';
	case 9: return 'Spiny Shellmet';
	case 10: return 'Dry Bones Shell';
	case 11: return 'Super Mushroom';
	case 12: return 'Rotten Mushroom';
	case 14: return 'Monty Mole';
	case 15: return 'P-Switch';
	case 17: return 'Giant Mushroom';
	case 18: return 'Bill Blaster';
	case 19: return 'Goomba (Shoe)';
	case 20: return 'Goomba (Stiletto)';
	case 21: return 'Cannon';
	case 22: return 'Unchained Chomp';
	case 25: return 'Piranha Plant (Fire)';
	case 26: return 'Fire Flower';
	case 27: return 'Goombrat';
	case 28: return 'Koopa (Green)';
	case 29: return 'Koopa (Red)';
	case 30: return 'Hammer Bro';
	case 31: return 'Magikoopa';
	case 32: return 'Muncher';
	case 33: return 'POW Block';
	case 34: return 'Trampoline';
	case 35: return 'Trampoline (Sideways)';
	case 36: return 'Super Star';
	case 37: return 'Superball Flower';
	case 39: return 'Wiggler';
	case 40: return 'Spike';
	case 43: return 'Pokey';
	case 44: return 'Pokey (Snow)';
	case 45: return 'Master Sword';
	case 46: return 'Super Acorn';
	case 47: return 'Mechakoopa';
	case 48: return 'Mechakoopa (Red)';
	case 49: return 'Mechakoopa (Blue)';
	default: return 'Goomba';
	}
}

/**
 * Converts an entity type name to a legacy ID number.
 * @param type The entity type name.
 * @returns The ID number.
 */
export function entityTypeToId(type: EntityType): number {
	switch (type) {
	case 'Goomba': return 2;
	case '1-Up': return 4;
	case 'Spike Top': return 5;
	case 'Sledge Bro': return 6;
	case 'Piranha Plant': return 7;
	case 'Bob-Omb': return 8;
	case 'Spiny Shellmet': return 9;
	case 'Dry Bones Shell': return 10;
	case 'Super Mushroom': return 11;
	case 'Rotten Mushroom': return 12;
	case 'Monty Mole': return 14;
	case 'P-Switch': return 15;
	case 'Giant Mushroom': return 17;
	case 'Bill Blaster': return 18;
	case 'Goomba (Shoe)': return 19;
	case 'Goomba (Stiletto)': return 20;
	case 'Cannon': return 21;
	case 'Unchained Chomp': return 22;
	case 'Piranha Plant (Fire)': return 25;
	case 'Fire Flower': return 26;
	case 'Goombrat': return 27;
	case 'Koopa (Green)': return 28;
	case 'Koopa (Red)': return 29;
	case 'Hammer Bro': return 30;
	case 'Magikoopa': return 31;
	case 'Muncher': return 32;
	case 'POW Block': return 33;
	case 'Trampoline': return 34;
	case 'Trampoline (Sideways)': return 35;
	case 'Super Star': return 36;
	case 'Superball Flower': return 37;
	case 'Wiggler': return 39;
	case 'Spike': return 40;
	case 'Pokey': return 43;
	case 'Pokey (Snow)': return 44;
	case 'Master Sword': return 45;
	case 'Super Acorn': return 46;
	case 'Mechakoopa': return 47;
	case 'Mechakoopa (Red)': return 48;
	case 'Mechakoopa (Blue)': return 49;
	default: return 2;
	}
}

export const MM2Instruments = [
	{ // 2
		id: 'goomba',
		name: 'Goomba (Grand Piano)',
		octave: 1,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 3
		id: 'buzzybeetle',
		name: 'Buzzy Shellmet (Detuned Bell)',
		octave: 1,
		isPowerup: false,
		isPercussion: false,
		isBuildable: false,
		buildRules: {},
	},
	{ // 4
		id: '1up',
		name: '1-Up (Synth Organ)',
		octave: 0,
		isPowerup: true,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 5
		id: 'spiketop',
		name: 'Spike Top (Harpsichord)',
		octave: 0,
		isPowerup: false,
		isPercussion: false,
		isBuildable: false,
		buildRules: {
			canFallNextToWall: false,
		},
	},
	{ // 6
		id: 'sledgebro',
		name: 'Sledge Bro (Bass Guitar)',
		octave: -2,
		isPowerup: false,
		isPercussion: false,
		isBuildable: false,
		buildRules: {
			width: 2,
			height: 2,
		},
	},
	{ // 7
		id: 'piranhaplant',
		name: 'Piranha Plant (Pizzicato Strings)',
		octave: 1,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {
			canFallNextToWall: false,
		},
	},
	{ // 8
		id: 'bobomb',
		name: 'Bob-Omb (Orchestra Hit)',
		octave: 0,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 9
		id: 'spiny',
		name: 'Spiny Shellmet (Trumpet)',
		octave: 1,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 10
		id: 'drybones',
		name: 'Dry Bones Shell (Flute)',
		octave: 2,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 11
		id: 'mushroom',
		name: 'Mushroom (Square Wave)',
		octave: 1,
		isPowerup: true,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 12
		id: 'rottenmushroom',
		name: 'Rotten Mushroom (Low Synth)',
		octave: -2,
		isPowerup: true,
		isPercussion: false,
		isBuildable: true,
		buildRules: {
			canHaveSemisolid: false,
		},
	},
	{ // 13
		id: 'greenbeachkoopa',
		name: 'Green Beach Koopa (Bark)',
		octave: 0,
		isPowerup: false,
		isPercussion: false,
		isBuildable: false,
		buildRules: {},
	},
	{ // 14
		id: 'montymole',
		name: 'Monty Mole (Banjo)',
		octave: 0,
		isPowerup: false,
		isPercussion: false,
		isBuildable: false,
		buildRules: {
			bounceHeight: 1,
			semiBounceHeight: 2,
		},
	},
	{ // 15
		id: 'pswitch',
		name: 'P-Switch (Snare Drum)',
		octave: 0,
		isPowerup: false,
		isPercussion: true,
		isBuildable: true,
		buildRules: {
			canParachute: false,
			canParachuteStack: false,
		},
	},
	{ // 16
		id: 'redbeachkoopa',
		name: 'Red Beach Koopa (Meow)',
		octave: 0,
		isPowerup: false,
		isPercussion: false,
		isBuildable: false,
		buildRules: {},
	},
	{ // 17
		id: 'bigmushroom',
		name: 'Big Mushroom (Shamisen)',
		octave: 0,
		isPowerup: true,
		isPercussion: false,
		isBuildable: false,
		buildRules: {
			width: 2,
			height: 2,
		},
	},
	{ // 18
		id: 'billblaster',
		name: 'Bill Blaster (Timpani)',
		octave: 0,
		isPowerup: false,
		isPercussion: true,
		isBuildable: false,
		buildRules: {
			canParachuteStack: false,
			canParachute: false,
			bounceHeight: 3,
			semiBounceHeight: 4,
			height: 2,
		},
	},
	{ // 19
		id: 'shoegoomba',
		name: 'Shoe Goomba (Low Accordion)',
		octave: -1,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 20
		id: 'stilettogoomba',
		name: 'Stiletto Goomba (Accordion)',
		octave: 0,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 21
		id: 'cannon',
		name: 'Cannon (Timbales)',
		octave: 0,
		isPowerup: false,
		isPercussion: true,
		isBuildable: true,
		buildRules: {
			canFallNextToWall: false,
			canParachute: false,
			canParachuteStack: false,
		},
	},
	{ // 22
		id: 'chainchomp',
		name: 'Chain Chomp (Unchained) (Synth Piano)',
		octave: 0,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {
			canHaveSemisolid: false,
		},
	},
	{ // 23
		id: 'post',
		name: 'Chain Chomp Post (Wood Block)',
		octave: 0,
		isPowerup: false,
		isPercussion: true,
		isBuildable: false,
		buildRules: {},
	},
	{ // 24
		id: 'coin',
		name: 'Coin (Sleigh Bells)',
		octave: 0,
		isPowerup: false,
		isPercussion: true,
		isBuildable: false,
		buildRules: {},
	},
	{ // 25
		id: 'firepiranhaplant',
		name: 'Fire Piranha Plant (Legato Strings)',
		octave: 0,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {
			canFallNextToWall: false,
		},
	},
	{ // 26
		id: 'fireflower',
		name: 'Fire Flower (Recorder)',
		octave: 1,
		isPowerup: true,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 27
		id: 'goombrat',
		name: 'Goombrat (Honky-Tonk Piano)',
		octave: 1,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 28
		id: 'greenkoopa',
		name: 'Green Koopa (Xylophone)',
		octave: 1,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 29
		id: 'redkoopa',
		name: 'Red Koopa (Vibraphone)',
		octave: 1,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 30
		id: 'hammerbro',
		name: 'Hammer Bro (Electric Guitar)',
		octave: 1,
		isPowerup: false,
		isPercussion: false,
		isBuildable: false,
		buildRules: {},
	},
	{ // 31
		id: 'magikoopa',
		name: 'Magikoopa (Synth Choir)',
		octave: 1,
		isPowerup: false,
		isPercussion: false,
		isBuildable: false,
		buildRules: {},
	},
	{ // 32
		id: 'muncher',
		name: 'Muncher (Synth Piano 2)',
		octave: 0,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {
			canParachuteStack: false,
			canParachute: false,
		},
	},
	{ // 33
		id: 'pow',
		name: 'POW Block (Kick Drum)',
		octave: 0,
		isPowerup: false,
		isPercussion: true,
		isBuildable: true,
		buildRules: {
			canParachuteStack: false,
			canParachute: false,
		},
	},
	{ // 34
		id: 'spring',
		name: 'Trampoline (Crash Cymbal)',
		octave: 0,
		isPowerup: false,
		isPercussion: true,
		isBuildable: true,
		buildRules: {
			canParachuteStack: false,
			canParachute: false,
		},
	},
	{ // 35
		id: 'sidewaysspring',
		name: 'Sideways Trampoline (Hi-Hat)',
		octave: 0,
		isPowerup: false,
		isPercussion: true,
		isBuildable: true,
		buildRules: {
			canParachuteStack: false,
			canParachute: false,
		},
	},
	{ // 36
		id: 'star',
		name: 'Super Star (Music Box)',
		octave: 1,
		isPowerup: true,
		isPercussion: false,
		isBuildable: true,
		buildRules: {
			canHaveSemisolid: false,
			semiBounceHeight: 2,
		},
	},
	{ // 37
		id: 'superball',
		name: 'Superball Flower (Organ)',
		octave: 1,
		isPowerup: true,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 38
		id: 'thwomp',
		name: 'Thwomp (Ethnic Drum)',
		octave: 0,
		isPowerup: false,
		isPercussion: true,
		isBuildable: false,
		buildRules: {
			width: 2,
			height: 2,
		},
	},
	{ // 39
		id: 'wiggler',
		name: 'Wiggler (Tubular Bells)',
		octave: 1,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {
			canHaveSemisolid: false,
		},
	},
	{ // 40
		id: 'spike',
		name: 'Spike (Acoustic Bass Guitar)',
		octave: -2,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {
			canFreeFall: false,
		},
	},
	{ // 41
		id: 'spikeball',
		name: 'Spike Ball (Bass Drum)',
		octave: 0,
		isPowerup: false,
		isPercussion: true,
		isBuildable: false,
		buildRules: {},
	},
	{ // 42
		id: 'snowball',
		name: 'Snowball (Tom-Tom Drum)',
		octave: 0,
		isPowerup: false,
		isPercussion: true,
		isBuildable: false,
		buildRules: {},
	},
	{ // 43
		id: 'pokey',
		name: 'Pokey (Acoustic Guitar)',
		octave: 0,
		isPowerup: false,
		isPercussion: false,
		isBuildable: false,
		buildRules: {
			height: 2,
		},
	},
	{ // 44
		id: 'snowpokey',
		name: 'Snow Pokey (Kazoo)',
		octave: 1,
		isPowerup: false,
		isPercussion: false,
		isBuildable: false,
		buildRules: {
			height: 2,
		},
	},
	{ // 45
		id: 'sword',
		name: 'Master Sword (Synth Horn)',
		octave: 0,
		isPowerup: true,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 46
		id: 'acorn',
		name: 'Super Acorn (Short String)',
		octave: 0,
		isPowerup: true,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 47
		id: 'mechakoopa',
		name: 'Mechakoopa (Disco Synth)',
		octave: 0,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 48
		id: 'blasta',
		name: 'Mechakoopa (Blasta) (Bass Synth)',
		octave: -2,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
	{ // 49
		id: 'zappa',
		name: 'Mechakoopa (Zappa) (Chorded Synth)',
		octave: 0,
		isPowerup: false,
		isPercussion: false,
		isBuildable: true,
		buildRules: {},
	},
];

export const stdBuildRules = {
	canFreeFall: true,
	canFallNextToWall: true,
	canParachute: true,
	canHaveSemisolid: true,
	canBeInCell: true,
	canParachuteStack: true,
	bounceHeight: 5,
	semiBounceHeight: 6,
	width: 1,
	height: 1,
};
