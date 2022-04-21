/* eslint-disable vars-on-top */
/* eslint-disable no-var */
import { MM2ScrollMethod, MM2ScrollMethods } from '@data/MakerConstants';
import GridEntityManager from '@scripts/builder/graphics/GridEntityManager';
import { appPPQN } from '@scripts/builder/project/MidiLoader';
import { ScrollPreference } from '@scripts/builder/project/Project';
import lcm from 'compute-lcm';
import { OptimizationResult } from '../looping/DeltaOptimizer';
import { MM2GameEntity } from '../MM2GameEntity';
import Cell from './Cell';
import NoteStructure from './NoteStructure';
import Structure from './Structure';
import TraditionalLevel from './TraditionalLevel';
import {
	maxLevelWidth, setupErrorToleranceSeconds, soundSubframesPerSecond, standardBuildSetups,
} from './util';

export const noteHeightLimit = 6; // 3 block jump
export const buildSetups = [];
export const blocksPerChunk = 8;
export const marginWidth = 27;
export const numStructChunks = Math.ceil(maxLevelWidth / blocksPerChunk);

export interface TraditionalOptimizerTarget {
	y: number;
	beats: number;
	entityType: number;
	id: number;
}

export interface TraditionalOptimizationResult extends OptimizationResult {
	type: 'traditional';
	level: TraditionalLevel;
}

const showSetupLogs = true;
const useSolver = true;

/* Structure Encoding:
      0 = Air
      1 = Block
      2 = Cloud Block
      3 = Note Block
*/

interface StructQueueEntry {
    struct: NoteStructure,
    blacklist: number[],
    forceMove: boolean,
}

interface MoveQueueEntry {
	struct: NoteStructure,
	history: MoveQueueEntryHistoryEntry[],
}

interface MoveQueueEntryHistoryEntry {
	struct: NoteStructure,
	setup: Setup,
	origSetup: Setup,
}

export interface Setup {
	structType: number,
	usesSemisolid: boolean,
	offset: number,
}

declare global {
	var structures: NoteStructure[];
	var cells: Cell[];
	var chunks: NoteStructure[][];
	var levelWidth: number;
}

export interface ScrollBpbConfig {
	scrollMethod: MM2ScrollMethod;
	bpb: number;
	bpm: number;
}

/**
 * Builds a traditional music level.
 * @param targetGroups The optimization targets comprising the notes of the song.
 * @param bpm The tempo of the song in beats per minute.
 * @param levelWidth The maximum width of the area to build in.
 * @param scrollPref The user's preference for how the level should scroll.
 * @returns The first successful result or a failure case if there were no successful builds.
 */
export async function buildMusic(
	targetGroups: TraditionalOptimizerTarget[][],
	bpm: number,
	levelWidth: number = maxLevelWidth,
	scrollPref: ScrollPreference = 'Any Scroll Method',
):
	Promise<{optResult: TraditionalOptimizationResult, config: ScrollBpbConfig}> {
	const configs = getPossibleConfigs(targetGroups, bpm, levelWidth, scrollPref);
	console.log(configs);

	let optResult: TraditionalOptimizationResult = {
		type: 'traditional',
		succeeded: false,
		level: new TraditionalLevel([], 0, [], 0),
		entityGrid: new GridEntityManager<MM2GameEntity>(0, 0),
		messages: [],
	};
	for (let i = 0; i < configs.length; i++) {
		const config = configs[i];
		const setups = getScrollSetups(config.scrollMethod);
		const level = new TraditionalLevel(
			targetGroups,
			config.bpb,
			setups,
			levelWidth,
		);
		await level.build();
		optResult = {
			type: 'traditional',
			succeeded: level.conflictingIds.length === 0,
			level,
			entityGrid: level.entityGrid,
			messages: level.conflictingIds.map((confId) => ({
				type: 'ERR',
				text: 'Not enough space to place one or more notes.',
				targetId: confId,
			})),
		};
		// Terminate and return a success when it happens
		if (optResult.succeeded) return { optResult, config };
	}
	// Return error msg if no valid configs were found
	if (configs.length === 0) {
		optResult = {
			type: 'traditional',
			succeeded: false,
			level: new TraditionalLevel([], 0, [], 0),
			entityGrid: new GridEntityManager<MM2GameEntity>(0, 0),
			messages: [
				{
					type: 'ERR',
					text: 'No valid combination of scroll speed and tile per beat values available.',
					targetId: null,
				},
			],
		};
	}
	return {
		optResult,
		config: {
			bpm: 0,
			bpb: 0,
			scrollMethod: MM2ScrollMethods[0],
		},
	};
}

/**
 * Generates all of the possible scroll-bpb options to generate a traditional level with.
 * @param targetGroups The optimization targets comprising the notes of the song.
 * @param bpm The tempo of the song in beats per minute.
 * @param levelWidth The maximum width of the area to build in.
 * @param scrollPref The user's preference for how the level should scroll.
 * @returns A list of possible configurations to build with.
 */
function getPossibleConfigs(
	targetGroups: TraditionalOptimizerTarget[][],
	bpm: number,
	levelWidth: number,
	scrollPref: ScrollPreference,
): ScrollBpbConfig[] {
	const configs: ScrollBpbConfig[] = [];
	const bpbs = getPossibleBpbs(targetGroups, levelWidth);
	for (let i = 0; i < bpbs.length; i++) {
		const bpb = bpbs[i];
		const scrolls = getPossibleScrolls(bpm, bpb, scrollPref);
		for (let j = 0; j < scrolls.length; j++) {
			const scroll = scrolls[j];
			configs.push({
				scrollMethod: scroll,
				bpb,
				bpm: scroll.tilesPerSecond * (60 / bpb),
			});
		}
	}
	// Sort configs from most to least similar to the original bpm
	const sortedConfigs = configs.sort(
		(a, b) => Math.abs(a.bpm - bpm) - Math.abs(b.bpm - bpm),
	);
	return sortedConfigs;
}

/**
 * Generates a list of available setups for grid-aligned notes.
 * @param scrollMethod The scroll method to generate setups for.
 * @returns The generated setups.
 */
function getScrollSetups(scrollMethod: MM2ScrollMethod): Setup[] {
	const setups: Setup[] = [];
	const subframesPerTile = soundSubframesPerSecond / scrollMethod.tilesPerSecond;
	standardBuildSetups.forEach((setup) => {
		const setupTiles = setup.timeDelay / subframesPerTile;
		const frac = setupTiles - Math.round(setupTiles);
		const secondsError = (Math.abs(frac) * subframesPerTile) / soundSubframesPerSecond;
		if (secondsError < setupErrorToleranceSeconds && Math.round(setupTiles) < 25) {
			setups.push({
				structType: setup.structType,
				usesSemisolid: setup.usesSemisolid,
				offset: -Math.round(setupTiles),
			});
		}
	});
	return setups;
}

/**
 * Returns possible scroll methods for a desired tempo.
 * @param origBpm The tempo of the song in beats per minute.
 * @param bpb The number of tiles per beat.
 * @param scrollPref The user's scroll preference.
 */
function getPossibleScrolls(
	origBpm: number,
	bpb: number,
	scrollPref: ScrollPreference,
): MM2ScrollMethod[] {
	// Want index of closest bpm to original that's reasonable (At least 0.8x speed)
	let closestBpmDiff = Infinity;
	let closestBpmIdx = -1;
	MM2ScrollMethods.forEach((scrollMethod, i) => {
		// Disregard scroll methods that the user doesn't want
		if (scrollMethod.isAuto && scrollPref === 'Non-Autoscroll Methods') return;
		if (!scrollMethod.isAuto && scrollPref === 'Autoscroll') return;

		const scrollMethodBpm = scrollMethod.tilesPerSecond * (60 / bpb);
		const thisDiff = Math.abs(origBpm - scrollMethodBpm);

		if (thisDiff < closestBpmDiff && scrollMethodBpm >= 0.8 * origBpm) {
			closestBpmDiff = thisDiff;
			closestBpmIdx = i;
		}
	});

	const possibleScrolls = [];
	for (let i = closestBpmIdx; i < MM2ScrollMethods.length; i++) {
		if (i < 0) break;
		const scrollMethod = MM2ScrollMethods[i];

		// Disregard scroll methods that the user doesn't want
		if (scrollMethod.isAuto && scrollPref === 'Non-Autoscroll Methods') continue;
		if (!scrollMethod.isAuto && scrollPref === 'Autoscroll') continue;

		// Disregard scroll speeds that are over 25% faster than the original song's
		const scrollMethodBpm = scrollMethod.tilesPerSecond * (60 / bpb);
		if (scrollMethodBpm / origBpm > 1.25) continue;

		possibleScrolls.push(scrollMethod);
	}

	return possibleScrolls;
}

/**
 * Given a set of optimization target groups and the max level width,
 * compute all possible bpbs to generate the level with.
 * @param targetGroups The target groups to compute bpbs for.
 * @param levelWidth The maximum level width.
 */
function getPossibleBpbs(
	targetGroups: TraditionalOptimizerTarget[][],
	levelWidth: number = maxLevelWidth,
): number[] {
	const availableWidth = levelWidth - marginWidth;
	const minBpb = getQuantizationLevel(targetGroups);
	console.log(`Min BPB ${minBpb}`);
	const beatDuration = getBeatDuration(targetGroups);
	const possibleBpbs: number[] = [];

	for (let i = 1; i <= Math.floor(appPPQN / minBpb); i++) {
		const thisBpb = minBpb * i;
		console.log(`${thisBpb}: ${beatDuration * thisBpb}/${availableWidth} tiles`);
		const canFit = beatDuration * thisBpb <= availableWidth;
		if (canFit) possibleBpbs.push(thisBpb);
	}

	return possibleBpbs;
}

/**
 * Returns the maximum beat number from a set of target groups.
 * @param targetGroups The target groups to search.
 */
function getBeatDuration(targetGroups: TraditionalOptimizerTarget[][]): number {
	return targetGroups.reduce((acc, targets) => Math.max(acc, targets.reduce((acc2, target) => Math.max(acc2, target.beats), 0)), 0);
}

/**
 * Analyzes all optimization targets and determines
 * the appropriate amount of divisions per beat.
 * @returns The number of divisions per beat.
 */
function getQuantizationLevel(targetGroups: TraditionalOptimizerTarget[][]): number {
	let quantizeLevel = 1;
	targetGroups.forEach((targets) => {
		targets.forEach((target) => {
			quantizeLevel = lcm(quantizeLevel, getBeatQuantizationLevel(target.beats))!;
		});
	});
	return quantizeLevel;
}

/**
 * Determines the quantization level of a single beat.
 * @param beat The beat to calculate for.
 * @returns The calculated quantization level.
 */
function getBeatQuantizationLevel(beat: number): number {
	for (let divsPerBeat = 1; divsPerBeat < appPPQN; divsPerBeat++) {
		if (Math.round(beat * divsPerBeat) / divsPerBeat === beat) return divsPerBeat;
	}
	return appPPQN;
}

// Where the magic happens
/**
 * Attempts for fix all conflicting structures. Legacy code.
 */
export function handleAllConflicts() { // TODO: Let either colliding structure move each other
	const structQueue: StructQueueEntry[] = [];
	globalThis.structures.forEach(
		(struct) => structQueue.push({ struct, blacklist: [], forceMove: false }),
	);
	while (structQueue.length > 0) {
		const structEntry = structQueue.shift()!;
		const { struct } = structEntry;
		const { blacklist } = structEntry;
		struct.checkForCollisions();
		if ((struct.conflictingStructures.length > 0
			|| structEntry.forceMove || struct.isInForbiddenTile()
			|| !struct.checkForLegality()) && struct.isNote) {
			let nodeCount = 0;
			const moveQueue: MoveQueueEntry[] = [{ struct, history: [] }];
			while (moveQueue.length > 0) {
				nodeCount++;
				const entry = moveQueue.shift()!;
				entry.history.forEach((step) => step.struct.moveBySetup(step.setup));
				const attempt = entry.struct.tryAllSetups();
				if (attempt.success) {
					if (nodeCount > 1 && showSetupLogs) {
						console.log(`success after ${nodeCount} attempts for struct ${struct.id}`);
						for (let i = 0; i < entry.history.length; i++) {
							console.log(`${i + 1}. Move ${entry.history[i].struct.id} to ${entry.history[i].setup.offset}`);
						}
						console.log(`${entry.history.length + 1}. Move ${entry.struct.id} to ${entry.struct.setup.offset}`);
					}
					break;
				}
				if (!useSolver) break;

				const availableMoves = attempt.availableMoves.filter(
					(move) => (!(isAlreadyUsed(entry.history, blacklist, move.structs[0]) || move.structs.length > 1)),
				);
				/* if (availableMoves.length === 0 && attempt.minConflicts <= 1) {
                    console.log(`queue exhausted for struct ${struct.id}`);
                } */
				for (let i = 0; i < availableMoves.length; i++) {
					const history = entry.history.slice(0);
					history.push({
						struct: entry.struct, setup: availableMoves[i].setup, origSetup: entry.struct.setup,
					});
					moveQueue.push({ struct: availableMoves[i].structs[0], history });
				}
				entry.history.forEach((step) => step.struct.moveBySetup(step.origSetup));
				if (nodeCount >= 1024) { // Quit if no solutions are found in time
					console.log(`failed to find solution in time for struct ${struct.id}`);
					break;
				}
			}
			// if (!success) console.log(`out of options for struct ${struct.id}...`);
		}
	}
	if (showSetupLogs) console.log('done');
}

/**
 * Determines if a structure has already been moved or is in the blacklist.
 * @param history The move history.
 * @param blacklist The blacklist containing a list of structure IDs to disregard.
 * @param struct The structure to check for matches.
 * @returns Whether or not the structure has already been moved or is in the blacklist.
 */
function isAlreadyUsed(
	history: MoveQueueEntryHistoryEntry[],
	blacklist: number[],
	struct: Structure,
) {
	for (let i = 0; i < history.length; i++) {
		if (struct.id === history[i].struct.id) return true;
	}
	for (let i = 0; i < blacklist.length; i++) {
		if (struct.id === blacklist[i]) return true;
	}
	return false;
}
