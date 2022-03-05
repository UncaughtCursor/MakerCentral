import TrackMap from '@scripts/builder/tracks/TrackMap';
import { getTrackTemplate, Track, TrackTemplate } from '@scripts/builder/tracks/TrackUtil';
import { mapHeight, mapWidth } from '../DeltaOptimizer';
import * as TrackBuilder from '../../../tracks/TrackBuilder';
import * as OptBuilder from './OptimizedTrackBuilder';

export interface WaveBuilderResult {
    trkMap: TrackMap,
    width: number,
    frameDelay: number,
}

const maxFramesInWave = 554;
const maxWaveHeight = 12;

const trkWidth = 2;
const waveWidth = 2 * trkWidth;

const horzTemplate = getTrackTemplate('straightH') as TrackTemplate;

/**
 * Builds a series of square waves out of straight tracks whose timing matches
 * up most closely with the desired number of frames.
 * @param totalFrames The number of frames for the series to take.
 * @returns The result of the contruction.
 */
export function buildWaves(totalFrames: number): WaveBuilderResult {
	const trkMap = new TrackMap(mapWidth, mapHeight);

	const numFullWaves = Math.floor(totalFrames / maxFramesInWave);
	const fullWaveFrames = numFullWaves * maxFramesInWave;

	const partialWaveFrames = totalFrames % maxFramesInWave;

	const partialWave = getWaveForDelay(partialWaveFrames);

	const numWaves = partialWave.height !== 0 ? numFullWaves + 1 : numFullWaves;
	const width = numWaves * waveWidth;

	let curTrk: Track | null = null;

	// Build full waves
	for (let i = 0; i < numFullWaves; i++) {
		curTrk = buildWave(trkMap, curTrk, maxWaveHeight);
	}

	if (partialWave.height > 0) {
		curTrk = buildWave(trkMap, curTrk, partialWave.height);
	}

	return {
		trkMap,
		width,
		frameDelay: fullWaveFrames + partialWave.frames,
	};
}

/**
 * Determines the height of a wave with the desired number of frames.
 * @param frames The desired number of frames.
 * @returns An object containing the height and true number of frames of the wave.
 * A height of 0 indicates that the wave shouldn't be built.
 */
function getWaveForDelay(frames: number): { height: number, frames: number } {
	const height = Math.max(Math.floor((3 / 128) * (frames - 42)), 0);
	const waveFrames = 42 * height + 2 * Math.floor(height / 3) + 42;
	return {
		height,
		frames: height > 0 ? waveFrames : 0,
	};
}

/**
 * Builds a wave of a specified height onto the given TrackMap and base track.
 * @param trkMap The TrackMap.
 * @param baseTrk The base track to build off of.
 * @param height The height of the wave.
 * @returns The last track built to construct the loop.
 */
function buildWave(trkMap: TrackMap, baseTrk: Track | null, height: number): Track {
	let curTrk = baseTrk;

	// Create a horizontal track facing right
	if (curTrk === null) {
		curTrk = TrackBuilder.createRootTrack(horzTemplate, { x: 0, y: mapHeight - 1 });
	} else {
		curTrk = TrackBuilder.createAttachedTrack(curTrk, 1, horzTemplate, 0);
	}
	trkMap.addTrack(curTrk);

	const waveX = curTrk.pos.x + trkWidth;
	const topY = mapHeight - (trkWidth * height) - 1;

	// Build the upwards section
	OptBuilder.directBuildTowards(trkMap, curTrk,
		{ x: waveX, y: topY }, ['straightV']);
	curTrk = trkMap.getLastTrack();

	// Build the top
	OptBuilder.directBuildTowards(trkMap, curTrk, { x: waveX + trkWidth, y: topY }, ['straightH']);
	curTrk = trkMap.getLastTrack();

	// Build the downwards section
	OptBuilder.directBuildTowards(trkMap, curTrk,
		{ x: waveX + trkWidth, y: mapHeight - 1 }, ['straightV']);
	const lastTrk = trkMap.getLastTrack();

	return lastTrk;
}
