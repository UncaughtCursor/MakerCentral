import TrackMap from '@scripts/builder/tracks/TrackMap';
import { getTrackTemplate, Track } from '@scripts/builder/tracks/TrackUtil';
import { Coordinates2d } from '@scripts/builder/util/Coordinates2d';
import TrackColumns from '@data/TrackColumns.json';
import GridEntityManager from '@scripts/builder/graphics/GridEntityManager';
import { EntityType, MM2ScrollMethod } from '@data/MakerConstants';
import buildColumns from './util/TrackColumnBuilder';
import * as TrackBuilder from '../../tracks/TrackBuilder';
import * as OptimizedTrackBuilder from './util/OptimizedTrackBuilder';
import SumCombinationGenerator from './SumCombinationGenerator';
import { buildWaves } from './util/WaveBuilder';
import { MM2GameEntity } from '../MM2GameEntity';

export interface DeltaOptimizerConfig {
	targetGroups: TrackOptimizerTargetGroup[];
	areaWidth: number;
	areaHeight: number;
	verticalOffset: number;
	loopFrameDuration: number;
	scrollMethod: MM2ScrollMethod;
}

export interface TrackOptimizerTargetGroup {
	targets: TrackOptimizerTarget[];
	subloopDivision: number;
	instrument: EntityType;
}

export interface TrackOptimizerTarget {
	y: number;
	frames: number;
	id: number;
}

export interface OptimizerMessage {
	type: 'INFO' | 'WARN' | 'ERR';
	text: string;
	targetId: number | null;
}

const errorCodes = [
	'OUTPUT_TOO_WIDE',
	'LOOP_PATHFIND_FAIL',
	'SYNC_FAIL',
	'OUT_OF_BOUNDS_HORIZONTAL',
	'OUT_OF_BOUNDS_VERTICAL',
	'SETUP_NOT_FOUND',
	'FIT_FAIL',
	'LOOP_PERIOD_NOT_FOUND',
] as const;

export type DeltaOptimizerErrorCode = typeof errorCodes[number] | null;

export interface DeltaOptimizerMessage extends OptimizerMessage {
	error: DeltaOptimizerErrorCode;
}

export interface OptimizationResult {
	succeeded: boolean,
	messages: DeltaOptimizerMessage[],
	entityGrid: GridEntityManager<MM2GameEntity>,
}

export interface TrackOptimizationResult extends OptimizationResult {
	type: 'track',
	trkMap: TrackMap,
	// entityGrid: GridEntityManager<MM2GameEntity>,
	notePlacements: {
		trk: Track,
		nextAttachPointIdx: 0 | 1
	}[],
	areaWidth: number
}

interface DeliveryBuildResult {
	optResult: TrackOptimizationResult,
	rejectedTargets: TrackOptimizerTarget[],
	acceptedTargets: TrackOptimizerTarget[],
}

interface SectionBuildResult extends DeliveryBuildResult {
	x: number,
	loadAreaWidth: number,
	loopWidth: number,
	instrument: EntityType,
}

export interface TrackColumnSolution {
	setup: number[];
	error: number;
}

export const mapHeight = 27;
const marginWidth = 27 + 10; // TODO: Account for head start
export const mapWidth = 240 - marginWidth;

export const straightTrkTime = 21;
export const diagTrkTime = 30;
export const curvedTrkTime = 36;

const straightHTemp = getTrackTemplate('straightH')!;
const straightVTemp = getTrackTemplate('straightV')!;
const diagUDTemp = getTrackTemplate('diagUD')!;

const trackComboGen = new SumCombinationGenerator([straightTrkTime, diagTrkTime, curvedTrkTime], 30 * 60);

// updated every time the track column setup data changes
const maxFramesInColumn = 554;

const emptyGEM = new GridEntityManager<MM2GameEntity>(mapWidth, mapHeight);

// FIXME: Stretch of empty delivery track for synced tracks

/**
 * Generates a set of track pieces and note block placements
 * to replicate a sequence of notes to be played.
 * @param config The configuration settings of the optimizer.
 * @returns The result of the optimization.
 */
export function buildMusic(config: DeltaOptimizerConfig): TrackOptimizationResult {
	const currentTargetGroups = config.targetGroups.slice(0);
	const trkMap = new TrackMap(mapWidth, mapHeight);

	console.log('Optimizing with');
	console.log(config.targetGroups);

	let succeeded = true;
	let messages: DeltaOptimizerMessage[] = [];
	let notePlacements: {
		trk: Track,
		nextAttachPointIdx: 0 | 1
	}[] = [];
	const sections: SectionBuildResult[] = [];

	let currentX = 0;

	while (currentTargetGroups.length > 0) {
		const targetGroup = currentTargetGroups.shift()!;
		const isBaseSection = sections.length === 0;

		const thisLoopDuration = config.loopFrameDuration / targetGroup.subloopDivision;

		const sectionRes = buildSection(
			targetGroup,
			thisLoopDuration,
			config.areaWidth,
			currentX,
			isBaseSection,
			config.scrollMethod,
		);

		/*
		 If just some of the targets are rejected, split the targets into
		 rejected and accepted groups and process them separately.
		 Otherwise, add the result to the list of processed sections.
		 */
		if (sectionRes.rejectedTargets.length > 0
			&& sectionRes.rejectedTargets.length !== targetGroup.targets.length) {
			currentTargetGroups.push({
				targets: sectionRes.acceptedTargets,
				subloopDivision: targetGroup.subloopDivision,
				instrument: targetGroup.instrument,
			});
			currentTargetGroups.push({
				targets: sectionRes.rejectedTargets,
				subloopDivision: targetGroup.subloopDivision,
				instrument: targetGroup.instrument,
			});
		} else {
			messages = [...messages, ...sectionRes.optResult.messages];
			notePlacements = [...notePlacements, ...sectionRes.optResult.notePlacements];
			succeeded = succeeded && sectionRes.optResult.succeeded;

			currentX = sectionRes.x;

			sections.push(sectionRes);
		}
	}

	const lastSection = sections[sections.length - 1];
	console.log(sections);

	const entityGrid = new GridEntityManager<MM2GameEntity>(mapWidth, mapHeight);

	sections.forEach((section) => {
		const copyX = section.x - lastSection.x + marginWidth;
		trkMap.copyOtherMapTo(
			section.optResult.trkMap,
			{ x: copyX, y: -2 },
		);
		entityGrid.addEntity({
			type: section.instrument,
			pos: { x: copyX + section.loopWidth - 5, y: 9 },
			occupiedTiles: [{ x: copyX + section.loopWidth - 5, y: 9 }],
			hasParachute: false,
			hasWings: false,
			isBig: true,
		});
	});

	// The true total width is the highest x-coordinate in
	// the final trkMap of either attach point plus 1
	const trueTotalWidth = trkMap.tracks.reduce((maxX, trk) => Math.max(maxX, trk.paths[0].pos.x, trk.paths[1].pos.x), 0) + 1;

	if (trueTotalWidth > mapWidth + marginWidth) {
		succeeded = false;
		messages.push({
			type: 'ERR',
			text: `Result is more than ${mapWidth} tiles wide.`,
			error: 'OUTPUT_TOO_WIDE',
			targetId: null,
		});
	}

	return {
		type: 'track',
		succeeded,
		messages,
		trkMap,
		notePlacements,
		areaWidth: trueTotalWidth,
		entityGrid,
	};
}

/**
 * Generates a set of track pieces and note block placements
 * for one section of music.
 * @param targetGroup The set of optimization targets to build for.
 * @param loopFrameDuration The duration of the loop in frames.
 * @param levelWidth The width of the available space in tiles.
 * @param currentX The x-coordinate of the right-hand side of the section
 * relative to the first note loaded into the level. Usually negative.
 * @param isBaseSection Whether or not this is the section with the least delay.
 * @param scrollMethod The type of scrolling to perform in the level.
 * @returns The result of the optimization.
 */
function buildSection(
	targetGroup: TrackOptimizerTargetGroup,
	loopFrameDuration: number,
	levelWidth: number,
	currentX: number,
	isBaseSection: boolean,
	scrollMethod: MM2ScrollMethod,
): SectionBuildResult {
	const loopBuildResult = buildLoopSection(loopFrameDuration);
	const loadStartX = loopBuildResult.areaWidth - 1;

	const scrollSpeed = scrollMethod.tilesPerSecond / 60;
	const minExtraTime = -currentX / scrollSpeed;

	let deliveryBuildResult!: DeliveryBuildResult;
	let deliveryWidthCheckSucceeded = false;

	let trueDeliveryWidth = -1;
	if (!isBaseSection) {
		// For non-base sections...
		// Search for a section whose width is exactly the amount of extra time it accounts for
		// Start from the min possible time and iterate by one tile until exceeding the level width
		for (let targetWidth = targetGroup.targets.length; targetWidth < mapWidth; targetWidth++) {
			const extraTime = minExtraTime + (targetWidth / scrollSpeed);
			deliveryBuildResult = buildDelivery(targetGroup, levelWidth, extraTime, scrollMethod);

			trueDeliveryWidth = targetWidth;
			if ((deliveryBuildResult.optResult.succeeded
				&& deliveryBuildResult.optResult.areaWidth <= targetWidth) || isBaseSection) {
				deliveryWidthCheckSucceeded = true;
				break;
			}
			/* if (!deliveryBuildResult.optResult.succeeded) {
				deliveryWidthCheckSucceeded = true; // Suppress message
				break;
			} */
		}
	} else {
		// For the base section, build with no extra time
		deliveryBuildResult = buildDelivery(targetGroup, levelWidth, 0, scrollMethod);
		deliveryWidthCheckSucceeded = true;
		trueDeliveryWidth = deliveryBuildResult.optResult.areaWidth;
	}

	const notePlacements = deliveryBuildResult.optResult.notePlacements;

	const trkMap = new TrackMap(mapWidth, mapHeight);
	trkMap.copyOtherMapTo(loopBuildResult.trkMap, { x: loopBuildResult.areaWidth - mapWidth, y: 0 });
	trkMap.copyOtherMapTo(deliveryBuildResult.optResult.trkMap, { x: loadStartX, y: 0 });

	const areaWidth = trueDeliveryWidth + loopBuildResult.areaWidth;

	const succeeded = deliveryBuildResult.optResult.succeeded && loopBuildResult.succeeded
	&& deliveryWidthCheckSucceeded;
	const messages = [...deliveryBuildResult.optResult.messages, ...loopBuildResult.messages];
	if (!deliveryWidthCheckSucceeded) {
		messages.push({
			type: 'ERR',
			text: 'Failed to synchronize a music track.',
			error: 'SYNC_FAIL',
			targetId: null,
		});
	}

	const optResult = {
		type: 'track' as 'track',
		succeeded,
		messages,
		trkMap,
		notePlacements,
		areaWidth,
		entityGrid: emptyGEM,
	};

	return {
		optResult,
		x: !isBaseSection ? currentX - optResult.areaWidth : currentX - loopBuildResult.areaWidth,
		loadAreaWidth: trueDeliveryWidth,
		rejectedTargets: deliveryBuildResult.rejectedTargets,
		acceptedTargets: deliveryBuildResult.acceptedTargets,
		loopWidth: loopBuildResult.areaWidth,
		instrument: targetGroup.instrument,
	};
}

/**
 * Generates the full delivery section of a loop.
 * @param targetGroup The optimizer targets to generate columns for.
 * @param areaWidth The width of the available area to generate tracks in.
 * @param extraTime The number of extra frames for the load to take.
 * @param scrollMethod The type of scrolling to perform in the level.
 * @returns The result of the delivery section construction.
 */
function buildDelivery(
	targetGroup: TrackOptimizerTargetGroup,
	areaWidth: number,
	extraTime: number,
	scrollMethod: MM2ScrollMethod,
): DeliveryBuildResult {
	const trkMap = new TrackMap(areaWidth, mapHeight);

	const baseLoadTime = 180; // 3 sec buffer; TODO: Calculate required load time

	const loadTime = Math.round(baseLoadTime + extraTime);

	const firstNoteFrame = targetGroup.targets.reduce((acc, target) => Math.min(acc, target.frames), Infinity);

	// FIXME: Stretches of empty flat delivery track

	const excessFrames = Math.max(Math.ceil(
		(loadTime + firstNoteFrame - maxFramesInColumn),
	), 0);

	const waveRes = buildWaves(excessFrames);
	if (waveRes.width > 0) trkMap.copyOtherMapTo(waveRes.trkMap, { x: 0, y: 0 });

	const columnsBuildRes = buildColumnDeliverySection(
		targetGroup,
		areaWidth,
		loadTime - waveRes.frameDelay,
		scrollMethod,
	);

	trkMap.copyOtherMapTo(columnsBuildRes.optResult.trkMap, { x: waveRes.width, y: 0 });

	return {
		...columnsBuildRes,
		optResult: {
			...columnsBuildRes.optResult,
			trkMap,
			areaWidth: columnsBuildRes.optResult.areaWidth + waveRes.width,
		},
	};
}

/**
 * Generates the column part of the delivery section of a loop.
 * @param targetGroup The optimizer targets to generate columns for.
 * @param areaWidth The width of the available area to generate tracks in.
 * @param loadTime The number of frames for the load to take.
 * @param scrollMethod The type of scrolling to perform in the level.
 * @returns The result of the delivery section construction.
 */
function buildColumnDeliverySection(
	targetGroup: TrackOptimizerTargetGroup,
	areaWidth: number,
	loadTime: number,
	scrollMethod: MM2ScrollMethod,
): DeliveryBuildResult {
	const messages: DeltaOptimizerMessage[] = [];

	const maxHeight = 20;

	const acceptableFrameError = 0;

	const scrollSpeed = scrollMethod.tilesPerSecond / 60;

	// Travel speed over tracks, accounting for correction generation
	// const travelSpeed = 3 / 32;

	const minPlaceY = 4;

	// For all targets
	// Generate the range of x-coords possible in each column

	const possibilityColumns: number[][] = [];
	for (let i = 0; i < areaWidth; i++) {
		possibilityColumns[i] = [];
	}

	const possibleColumns: number[][] = [];
	const targetColumnSolutions: TrackColumnSolution[][] = [];

	let succeeded = true;

	targetGroup.targets.forEach((target, i) => {
		possibleColumns[i] = [];
		targetColumnSolutions[i] = [];

		/* const minX = Math.max(Math.ceil(
			(loadTime + target.frames - maxFramesInColumn) * scrollSpeed,
		), 0);* */
		const minX = 0;
		const maxX = Math.floor((loadTime + target.frames) * scrollSpeed);
		for (let x = minX; x < maxX; x++) {
			// Setup time = Total Time - Scroll Time - Travel Time
			const scrollTime = x / scrollSpeed;
			const deliveryTime = calcDeliveryTime(x);
			const columnTime = Math.floor((loadTime + target.frames) - scrollTime - deliveryTime);
			const columnY = target.y - minPlaceY;

			// Break before the loop enters negative values
			if (columnTime < 0) break;

			if (columnTime >= 0 && columnY > 0
				&& columnY <= maxHeight && columnTime <= maxFramesInColumn) {
				const solution = TrackColumns[columnY - 1][columnTime];
				const frameError = (solution.error !== null) ? solution.error : Infinity;

				if (frameError <= acceptableFrameError) {
					possibilityColumns[x].push(i);
					possibleColumns[i].push(x);
					targetColumnSolutions[i][x] = {
						setup: solution.setup!,
						error: solution.error!,
					};
				}
			}
		}

		if (possibleColumns[i].length === 0) {
			if (targetGroup.targets[i].y < 2 || targetGroup.targets[i].y > 25) {
				messages.push({
					type: 'ERR',
					text: 'Note is out of vertical bounds.',
					error: 'OUT_OF_BOUNDS_VERTICAL',
					targetId: targetGroup.targets[i].id,
				});
			} else if (minX >= areaWidth) {
				messages.push({
					type: 'ERR',
					text: 'Note is out of horizontal bounds.',
					error: 'OUT_OF_BOUNDS_HORIZONTAL',
					targetId: targetGroup.targets[i].id,
				});
			} else {
				messages.push({
					type: 'ERR',
					text: 'Failed to find a setup for one or more notes.'
					+ ' Notes playing in quick succession and low-pitched notes are'
					+ ' most likely to have this issue; try mitigating instances of these.',
					error: 'SETUP_NOT_FOUND',
					targetId: targetGroup.targets[i].id,
				});
			}
			succeeded = false;
		}
	});

	const noteColPlacements = getNoteColumnPlacement(possibleColumns);

	// If there wasn't already a failure, add any error messages for the fitting process
	if (succeeded) {
		noteColPlacements.forEach((placement, i) => {
			if (placement === -1) {
				messages.push({
					type: 'ERR',
					text: 'Unable to fit one of more notes into a column. Try reducing the tempo or speed at which the notes play.',
					error: 'FIT_FAIL',
					targetId: targetGroup.targets[i].id,
				});
				succeeded = false;
			}
		});
	}

	const rejectedTargets: TrackOptimizerTarget[] = [];
	const acceptedTargets: TrackOptimizerTarget[] = [];

	noteColPlacements.forEach((placement, i) => {
		if (placement === -1) {
			rejectedTargets.push(targetGroup.targets[i]);
		} else {
			acceptedTargets.push(targetGroup.targets[i]);
		}
	});

	if (!succeeded) {
		const optResult = {
			type: 'track' as 'track',
			succeeded,
			messages,
			trkMap: new TrackMap(0, 0),
			notePlacements: [],
			areaWidth: 0,
			entityGrid: emptyGEM,
		};
		return {
			optResult,
			rejectedTargets,
			acceptedTargets,
		};
	}

	// Column setup for each note
	const noteSolutions = noteColPlacements.map((notePlacement, i) => ({
		// + 1 because notes are shifted right 1 so nothing lands on diagonal track
		x: notePlacement + 1,
		setup: targetColumnSolutions[i][notePlacement].setup,
	}));

	const buildResult = buildColumns(noteSolutions);

	return {
		optResult: buildResult,
		rejectedTargets,
		acceptedTargets,
	};
}

/**
 * Generates the looping section of a loop.
 * @param period The duration of the loop in frames.
 * @returns The result of the loop construction.
 */
function buildLoopSection(period: number): TrackOptimizationResult {
	let succeeded = true;

	// TODO: Try other loop options if one fails

	const messages: DeltaOptimizerMessage[] = [];
	let trkMap: TrackMap = new TrackMap(0, 0);

	const buildTrackPeriod = getNearestLoopPeriod((period / 2) - (2 * straightTrkTime));

	if (buildTrackPeriod < 0) {
		succeeded = false;
		messages.push({
			type: 'ERR',
			text: `Loop of period ${period} frames is too short or long to be built. (Most likely, too short.)`,
			error: 'LOOP_PERIOD_NOT_FOUND',
			targetId: null,
		});
		return {
			type: 'track',
			succeeded,
			trkMap: new TrackMap(0, 0),
			messages,
			notePlacements: [],
			areaWidth: 0,
			entityGrid: emptyGEM,
		};
	}

	// Try all build combinations until success
	const sumCombos = trackComboGen.getCombinations(buildTrackPeriod);
	console.log(`${sumCombos.length} loop combos`);
	for (let i = 0; i < sumCombos.length; i++) {
		trkMap = new TrackMap(mapWidth, mapHeight);

		// Build launch track from delivery
		trkMap.addTrack(TrackBuilder.createRootTrack(diagUDTemp, { x: mapWidth - 3, y: mapHeight - 3 }));

		// Build loop stub
		const loopRoot = TrackBuilder.createRootTrack(
			straightVTemp,
			{ x: mapWidth - 5, y: mapHeight - 6 },
		);
		trkMap.addTrack(loopRoot);
		const loopStub = TrackBuilder.createAttachedTrack(loopRoot, 1, straightHTemp, 0);
		trkMap.addTrack(loopStub);

		const loopTrackQuantities = sumCombos[i];

		const buildRes = OptimizedTrackBuilder.buildStandardTracksWithScore(trkMap, loopStub, loopTrackQuantities, loopBuildFn);

		loopRoot.hasCaps = true;
		if (buildRes.addedTracks.length > 0) {
			buildRes.addedTracks[buildRes.addedTracks.length - 1].hasCaps = true;
		}

		succeeded = buildRes.isSuccess;
		if (succeeded) console.log(`Loop build succeeded attempt #${i + 1}`);
		if (succeeded) break;
	}

	if (!succeeded) {
		messages.push({
			type: 'ERR',
			text: 'Loop construction pathfinding failed. Try changing the tempo or length of the loop.',
			error: 'LOOP_PATHFIND_FAIL',
			targetId: null,
		});
	}

	const areaWidth = mapWidth - getMinTrackX(trkMap.tracks);

	return {
		type: 'track',
		succeeded,
		trkMap,
		messages,
		notePlacements: [],
		areaWidth,
		entityGrid: emptyGEM,
	};
}

/**
 * Generates a column to place each note in. Each column has a maximum of one note.
 * @param possibleColumns A 2D array representing the possible column IDs for each note.
 * An ID of -1 is used for impossible placements.
 * @returns An array of column IDs for each note ID.
 */
function getNoteColumnPlacement(possibleColumns: number[][]) {
	const curPossibleColumns: number[][] = JSON.parse(JSON.stringify(possibleColumns));
	const columnPlacements: number[] = new Array<number>(possibleColumns.length).fill(-1);

	let isDone = false;
	while (!isDone) {
		const shortest = getShortestList(curPossibleColumns)!;
		if (shortest === null) break;
		if (shortest.list.length > 0) {
			const placeColumnId = shortest!.list[0];

			// Clear out the options for the placed note.
			curPossibleColumns[shortest!.id] = [];

			// Remove column from other notes' list of options.
			columnPlacements[shortest!.id] = placeColumnId;
			removeNumberFromLists(placeColumnId, curPossibleColumns);
		}
		isDone = shortest.list.length === 0;
	}

	return columnPlacements;
}

/**
 * Evaluates a possible position to be built at with a score.
 * @param pos The build position to be evaluated.
 * @param usedTrks The history of tracks built so far.
 * @returns The score of the position.
 * A position with a score of negative Infinity will never be considered.
 */
function loopBuildFn(pos: Coordinates2d, usedTrks: Track[]): number {
	// Bad zones; do not enter at all costs
	if (pos.x > mapWidth - 1) return -Infinity;
	if (pos.x >= mapWidth - 5 && pos.y >= mapHeight - 5) return -Infinity;
	if (pos.x >= mapWidth - 5 && pos.x <= mapWidth - 4
		&& pos.y >= mapHeight - 14) return -Infinity;
	if (pos.x === mapWidth - 3
		&& pos.y >= mapHeight - 14 && pos.y <= mapHeight - 12) return -Infinity;

	// Return zero if we have no past tracks
	if (usedTrks.length === 0) return 0;

	// Goal: try to keep build centered about the current partition
	// Note: The first x-coordinate of the partition is the gutter. Building in it is discouraged.

	const partitionSize = 4;

	let punishAmount = 0;

	// Calculate which vertical partition the position is in
	const lastTrkX = usedTrks[usedTrks.length - 1].pos.x;
	const partitionX = Math.floor((lastTrkX - 2) / partitionSize) * partitionSize + 2;

	// Punish going right to prevent getting trapped
	if (pos.x > partitionX + partitionSize - 2) {
		punishAmount++;
		if ((pos.y >= mapHeight - 3 || pos.y <= 3)) {
			// Punish even more near the top and bottom of the map
			punishAmount += 2;
		}
	}

	// Punish building in the gutter
	if (pos.x === partitionX) punishAmount += 2;

	// Try to keep build centered about the current partition by punishing builds outside
	if (!(pos.x > partitionX && pos.x <= partitionX + partitionSize - 1)) punishAmount += 2;

	const isGoingUp = ((partitionX - 2) / 4) % 2 === 0;
	// If we go up in this partition, return higher scores for lesser y positions
	if (isGoingUp) return (1 / Math.abs(pos.y + 1)) - punishAmount;
	// If we go down in this partition, return higher scores for greater y positions
	return (1 / Math.abs(pos.y - mapHeight)) - punishAmount;
}

/**
 * Returns the lowest x-coordinate found in a list of tracks' attachment points.
 * @param trks A non-empty list of tracks to search.
 * @returns The lowest x-coordinate.
 */
function getMinTrackX(trks: Track[]): number {
	let minX = Infinity;

	for (let i = 0; i < trks.length; i++) {
		minX = Math.min(minX, trks[i].localAttachPointPaths[0].incoming[0].pos.x);
		minX = Math.min(minX, trks[i].localAttachPointPaths[0].outgoing[0].pos.x);
	}

	return minX;
}

/**
 * Returns the shortest non-empty list of an array of lists.
 * @param arr The array.
 * @returns The shortest list in the array or null if the array is empty.
 */
function getShortestList<T>(arr: T[][]) {
	return arr.reduce((acc: { list: T[], id: number } | null, thisArr: T[], i: number) => {
		if (acc === null && thisArr.length > 0) {
			return {
				list: thisArr,
				id: i,
			};
		}
		const accLength = acc === null ? Infinity : acc.list.length;
		return ((thisArr.length < accLength) && thisArr.length > 0) ? {
			list: thisArr,
			id: i,
		} : acc;
	}, null);
}

/**
 * Removes a number from each list in an array of lists.
 * @param n The number to remove.
 * @param arr The array.
 */
function removeNumberFromLists(n: number, arr: number[][]) {
	arr.forEach((list: number[], i) => {
		// eslint-disable-next-line no-param-reassign, @typescript-eslint/no-unused-vars
		arr[i] = list.filter((num) => num !== n);
	});
}

/**
 * Finds the nearest available loop period to the desired period
 * that is greater than or equal to it.
 * @param desiredPeriod The desired period to find the nearest available.
 * @returns The nearest available loop period or -1 if no loop period is available.
 */
export function getNearestLoopPeriod(desiredPeriod: number): number {
	if (desiredPeriod < 0) return -1;

	const totals = trackComboGen.getAvailableTotals();
	for (let i = 0; i < totals.length; i++) {
		const num = totals[i];
		if (num >= desiredPeriod) return num;
	}
	return -1;
}

/**
 * Calculates how long a note block takes to travel the
 * specified number of units on a flat delivery track.
 * @param x The number of tiles travelled.
 */
function calcDeliveryTime(x: number) {
	// 11-11-10 pattern
	return 10 * Math.floor(x / 3) + 11 * Math.floor((x + 2) / 3) + 11 * Math.floor((x + 1) / 3);
}
