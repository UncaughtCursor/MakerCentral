import { addCoords, scaleCoords } from '../util/Coordinates2d';
import { Track, TrackPath, TrackPathTemplate } from './TrackUtil';

// TODO: Specify the starting track and direction,
// which will start the block at the halfway point of the track and control direction

// TODO: Support looping in later parts of a crawl as a result of air tracks

export interface TrackPathCrawl {
	paths: TrackPath[],
	loopIndex: number
}

/**
 * Extracts a closed loop of track paths from an initial starting track
 * and the index of the attach point it will travel towards.
 * @param initTrk The initial starting track.
 * @param connectionIndex The index of the track's attachment point that will be traveled towards.
 * @returns The list of track paths in the closed loop.
 */
export function getTrackPathCrawl(initTrk: Track, connectionIndex: 0 | 1) {
	// Connection index is inverted to select the path traveling towards the specified attach point.
	const clonePath = initTrk.paths[1 - connectionIndex];
	// TODO: Fix curved track animations
	const halfTemp = createHalfPathTemplate(clonePath.template);

	const initPath = <TrackPath>{
		template: halfTemp,
		// Position must be offset by the half template's offset for straight paths.
		pos: addCoords(clonePath.pos, halfTemp.traversalOffset),
		parentTrack: clonePath.parentTrack,
		next: clonePath.next,
		prev: clonePath.prev,
	};

	let currentPath = initPath;
	const crawl: TrackPathCrawl = {
		paths: [],
		loopIndex: -1,
	};
	do {
		crawl.paths.push(currentPath);
		currentPath = currentPath.next!;
		if (currentPath.template === null) throw new Error(`Empty path template; prev = ${currentPath.prev}`);
		crawl.loopIndex = getLoopIndex(currentPath, crawl.paths);
	} while (crawl.loopIndex === -1);
	return crawl;
}

/**
 * Returns the index of a looping track path system or -1 if a loop does not exist.
 * @param currentPath The current track path during a trace.
 * @param paths All paths to search for a loop in.
 * @returns The array index where the loop was found.
 */
function getLoopIndex(currentPath: TrackPath, paths: TrackPath[]) {
	for (let i = 0; i < paths.length; i++) {
		if (paths[i] === currentPath) return i;
	}
	return -1;
}

/**
 * Creates a half-path template for a crawl from a given path template.
 * @param temp The path template to create a half-path from.
 */
function createHalfPathTemplate(temp: TrackPathTemplate) {
	// TODO: Adjust curved path animation params
	return <TrackPathTemplate>{
		traversalOffset: scaleCoords(temp.traversalOffset, 0.5),
		traversalTime: Math.ceil(temp.traversalTime / 2),
		interpolationType: temp.interpolationType,
		interpolationData: temp.interpolationData,
		name: `${temp.name}Half`,
	};
}
