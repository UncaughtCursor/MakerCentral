import TrackMap from '@scripts/builder/tracks/TrackMap';
import { getTrackTemplate, Track, TrackTemplate } from '@scripts/builder/tracks/TrackUtil';
import GridEntityManager from '@scripts/builder/graphics/GridEntityManager';
import { mapHeight, mapWidth, TrackOptimizationResult } from '../DeltaOptimizer';
import * as TrackBuilder from '../../../tracks/TrackBuilder';
import * as OptBuilder from './OptimizedTrackBuilder';
import { MM2GameEntity } from '../../MM2GameEntity';

const horzTemplate = getTrackTemplate('straightH') as TrackTemplate;
const vertTemplate = getTrackTemplate('straightV') as TrackTemplate;

export interface TrackColumnPlacement {
	setup: number[],
	x: number
}

const emptyGEM = new GridEntityManager<MM2GameEntity>(240, 27);

/**
 * Generates a placement of tracks and note blocks for the given track column placements.
 * @param placements A list of objects containing the x-coordinates and setups to build.
 * @returns An object containing the trackMap and note block placements.
 */
export default function buildColumns(placements: TrackColumnPlacement[]): TrackOptimizationResult {
	const trkMap = new TrackMap(mapWidth, mapHeight);
	const notePlacements: {
		trk: Track,
		nextAttachPointIdx: 0 | 1
	}[] = [];

	// + 1 to prevent track edge landings, another + 1 because notes are shifted right 1 tile
	// FIXME: This value is used for width calculation, which desyncs after wave building
	const maxX = getMaxPlaceX(placements) + 2;

	// Create landing track
	buildDeliveryTrack(trkMap, maxX);

	// Build column for each note placement
	placements.forEach((placement) => {
		const trks = buildColumn(trkMap, placement);
		const placeIdx = placement.setup[1];
		/*
		 * Unless at placement index zero,
		 * the index of the track being pointed to is the placement index minus 1.
		 */
		const trkPlaceIdx = placeIdx === 0 ? 0 : placeIdx - 1;
		// Note block faces down if placement index is zero, otherwise it faces up.
		const attachIdx = placeIdx === 0 ? 1 : 0;

		notePlacements.push({
			trk: trks[trkPlaceIdx],
			nextAttachPointIdx: attachIdx,
		});
	});

	return {
		type: 'track',
		succeeded: true,
		messages: [],
		trkMap,
		notePlacements,
		areaWidth: maxX,
		entityGrid: emptyGEM,
	};
}

/**
 * Builds a column placement on the provided TrackMap.
 * @param trkMap The TrackMap.
 * @param placement The column placement to build.
 * @returns The tracks created that make up the column, from top to bottom.
 */
function buildColumn(trkMap: TrackMap, placement: TrackColumnPlacement): Track[] {
	/*
	 * Column is built from the bottom up. This means placements are and track
	 * amounts in earlier indices will be lower down.
	 */

	// const root = TrackBuilder.createRootTrack(vertTemplate, { x: placement.x, y: 23 });
	// trkMap.addTrack(root);

	let currentY = 24;
	let currentLastTrk: Track | number = placement.x;

	const numTrks = placement.setup[0];
	const airSetups = placement.setup.slice(3);
	const numSetupTrks = getNumSetupTracks(numTrks, airSetups.length);

	for (let i = 0; i < airSetups.length; i++) {
		const curDropHeight = airSetups[i] + 1;
		const numStraightTrks = numSetupTrks[i];

		currentY = addToColumn('air', curDropHeight, currentLastTrk, currentY, trkMap);

		currentY = addToColumn('track', numStraightTrks, currentLastTrk, currentY, trkMap);
		currentLastTrk = trkMap.getLastTrack();
	}

	// Track that the note block sits on
	addToColumn('track', 1, currentLastTrk, currentY, trkMap);

	const columnTrks = getLastTracks(trkMap, numTrks + 1);

	// If the top track has a closed top, add it
	// Note blocks that travel downward (placement index of 0) also have closed tops.
	const placeIdx = placement.setup[1];
	const hasClosedTop = !!placement.setup[2];
	columnTrks[0].hasCaps = hasClosedTop || (placeIdx === 0);

	// Return all of the tracks that were added
	return columnTrks;
}

/**
 * Generates how many straight tracks to have for each setup unit.
 * @param numTrks The number of straight tracks to build.
 * @param numSetups The number of setup units.
 */
function getNumSetupTracks(numTrks: number, numSetups: number) {
	const setupTrkCounts = new Array<number>(numSetups).fill(0);

	// Naive, but gets the job done
	// Evenly distributes tracks to each setup before running out.
	let i = 0;
	let remainingTrks = numTrks;
	while (remainingTrks > 0) {
		setupTrkCounts[i]++;

		i++;
		i %= numSetups;
		remainingTrks--;
	}

	return setupTrkCounts;
}

/**
 * Adds a new setup unit to the current column.
 * @param type The type of setup unit.
 * @param numExtUnits The number of extension units for the setup unit.
 * For track setups, this is the number of tracks, and for air setups,
 * it is the number of tiles tall the gap is.
 * @param baseTrk The last solid base track to add onto or the x-coordinate if there is none.
 * @param buildY The y-coordinate to build at.
 * @param trkMap The TrackMap to build on.
 * @returns The new y-coordinate to build from for the next setup unit.
 */
function addToColumn(type: 'track' | 'air', numExtUnits: number, baseTrk: Track | number, buildY: number, trkMap: TrackMap) {
	let newY = buildY;
	switch (type) {
	case 'track': {
		if (!(typeof (baseTrk) === 'number')) {
			if (buildY === baseTrk.pos.y - 2) {
				// If the coordinate we want to build the track at 2 tiles higher, attach a track
				newY = baseTrk.pos.y - (2 * numExtUnits);
				OptBuilder.directBuildTowards(trkMap, baseTrk, { x: baseTrk.pos.x, y: newY }, ['straightV']);
			} else {
				// Else, create a new track
				trkMap.addTrack(TrackBuilder.createRootTrack(
					vertTemplate, { x: baseTrk.pos.x, y: buildY },
				));
				newY = buildY - (2 * (numExtUnits - 1));
				const newBaseTrk = trkMap.getLastTrack();
				if (numExtUnits > 1) OptBuilder.directBuildTowards(trkMap, newBaseTrk, { x: baseTrk.pos.x, y: newY }, ['straightV']);
			}

			// Move the placement y up by 2 tiles to get ready to place the next track
			newY -= 2;
		} else {
			const thisRoot = TrackBuilder.createRootTrack(vertTemplate, { x: baseTrk, y: buildY });
			trkMap.addTrack(thisRoot);

			// Move the placement y up by 2 tiles to get ready to place the next track
			newY -= 2;

			if (numExtUnits > 1) newY = addToColumn('track', numExtUnits - 1, thisRoot, newY, trkMap);
		}

		break;
	}
	case 'air': {
		// Move the placement y up by the number of tiles tall the gap is
		newY -= numExtUnits;
	}
	}
	return newY;
}

/**
 * Builds a horizontal delivery track on the given TrackMap at y = 26
 * with the specified width, in tiles
 * @param width The width of the track in tiles.
 */
function buildDeliveryTrack(trkMap: TrackMap, width: number) {
	const baseTrk = TrackBuilder.createRootTrack(horzTemplate, { x: 0, y: 26 });
	trkMap.addTrack(baseTrk);
	const targetX = Math.ceil(width / 2) * 2;
	OptBuilder.directBuildTowards(trkMap, baseTrk, { x: targetX, y: 26 }, ['straightH']);
}

/**
 * Returns the TrackColumnPlacement with the highest x-coordinate.
 * @param placements The list of TrackColumnPlacements to search through.
 * @returns The highest x-coordinate.
 */
function getMaxPlaceX(placements: TrackColumnPlacement[]) {
	return placements.reduce((acc, placement) => ((placement.x > acc) ? placement.x : acc), 0);
}

/**
 * Returns an array with the last few tracks placed in a TrackMap.
 * @param trkMap The TrackMap to retrieve tracks from.
 * @param numTrks The number of tracks to retrieve.
 * @returns An array with retrieved tracks with the most recent first.
 */
function getLastTracks(trkMap: TrackMap, numTrks: number): Track[] {
	const trks = [];
	const startIndex = trkMap.getNumTracks() - 1;
	for (let i = 0; i < numTrks; i++) {
		trks.push(trkMap.getTrackAtIndex(startIndex - i));
	}
	return trks;
}
