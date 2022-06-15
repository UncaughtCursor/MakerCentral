import { KEY_C4 } from './PlaybackConstants';
import EntityJson from './Entities.json';
import MidiInstrumentsJson from './MidiInstruments.json';

export type EntityType = keyof typeof EntityJson;

export interface EntityTypeData {
	name: string;
    color: string;
    instrumentName: string;
    octave: number;
    isPowerup: boolean;
    isPercussion: boolean;
    isTraditionalBuildable: boolean;
    isLoopingBuildable: boolean;
    buildRules: BuildRules;
}

export interface BuildRules {
	canHaveSemisolid: boolean;
	canFallNextToWall: boolean;
	canFreeFall: boolean;
	canParachute: boolean;
	canBeInCell: boolean;
	canParachuteStack: boolean;
    bounceHeight: number,
	semiBounceHeight: number,
	width: number,
	height: number,
}

export const EntityData = EntityJson as { [key in EntityType]: EntityTypeData; };

export interface MidiInstrument {
    name: string,
    mm2Instrument: EntityType,
}

export const MidiInstruments = MidiInstrumentsJson as MidiInstrument[];

export const TraditionalNoteRange = { min: KEY_C4, max: KEY_C4 + 26 - 1 };
export const LoopingNoteRange = { min: KEY_C4 + 5, max: KEY_C4 + 25 - 1 };

export interface MM2ScrollMethod {
    name: string,
    tilesPerSecond: number,
    isCommon: boolean,
    isAuto: boolean,
}
export const MM2ScrollMethods: MM2ScrollMethod[] = [
	{
		name: 'Slow Autoscroll',
		tilesPerSecond: 1.875,
		isCommon: false,
		isAuto: true,
	},
	{
		name: 'Medium Autoscroll',
		tilesPerSecond: 3.75,
		isCommon: true,
		isAuto: true,
	},
	{
		name: 'Walking',
		tilesPerSecond: 5.625,
		isCommon: true,
		isAuto: false,
	},
	{
		name: 'Fast Autoscroll',
		tilesPerSecond: 7.5,
		isCommon: true,
		isAuto: true,
	},
	{
		name: 'Fast Lava Lift',
		tilesPerSecond: 9.375,
		isCommon: true,
		isAuto: false,
	},
	{
		name: 'Running',
		tilesPerSecond: 11.25,
		isCommon: true,
		isAuto: false,
	},
	{
		name: 'Fast Conveyor - Walking',
		tilesPerSecond: 13.125,
		isCommon: false,
		isAuto: false,
	},
	{
		name: 'Normal Conveyor - Running',
		tilesPerSecond: 15,
		isCommon: false,
		isAuto: false,
	},
	{
		name: 'Fast Conveyor - Running',
		tilesPerSecond: 18.75,
		isCommon: false,
		isAuto: false,
	},
];
