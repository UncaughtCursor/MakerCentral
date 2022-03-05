/* eslint-disable no-param-reassign */
import {
	addCoords, coordEquals, Coordinates2d, subtractCoords,
} from '../util/Coordinates2d';
import {
	AirTrackTemplate,
	getTrackAttachmentPosition,
	Track, TrackAttachPoint, TrackLocalAttachPointPaths, TrackPath, TrackTemplate,
} from './TrackUtil';

// TODO: Functionality for air track path attachment

/**
 * Creates a new track that is not attached to any other track.
 * @param template The template of the track to create.
 * @param pos The position to create the track at.
 * @returns The created track.
 */
export function createRootTrack(template: TrackTemplate, pos: Coordinates2d) {
	const rootTrack = createTrack(template);
	setTrackPosition(rootTrack, pos);
	return rootTrack;
}

/**
 * Creates a new track with the specified template on the end of a base track.
 * @param baseTrack The track to be added onto.
 * @param baseConnectionIndex The array index of the connection point in the base track's template.
 * @param newTrackTemplate The template of the track to create.
 * @param newConnectionIndex The array index of the connection point in the new track's template.
 * @returns The newly created track.
 */
export function createAttachedTrack(baseTrack: Track, baseConnectionIndex: 0 | 1,
	newTrackTemplate: TrackTemplate, newConnectionIndex: 0 | 1) {
	// Calculate new track position
	const baseAttachPoint = baseTrack.template.attachPoints[baseConnectionIndex];
	const newAttachPoint = newTrackTemplate.attachPoints[newConnectionIndex];
	const newTrackCoords = getTrackAttachmentPosition(baseTrack.pos,
		baseAttachPoint.trackOffset, newAttachPoint.trackOffset);

	// Create the new track
	const newTrack = createRootTrack(newTrackTemplate, newTrackCoords);

	// Bridge the track path connection between the two tracks
	linkTrackPaths(baseTrack.localAttachPointPaths[baseConnectionIndex],
		newTrack.localAttachPointPaths[newConnectionIndex]);

	return newTrack;
}

/**
 * Creates a new air track with the specified template on the end of a base track.
 * @param baseTrack The track to be added onto.
 * @param baseConnectionIndex The array index of the connection point in the base track's template.
 * @param newTrackTemplate The template of the track to create.
 * @param newConnectionIndex The array index of the connection point in the new track's template.
 * @returns The newly created track.
 */
export function createAttachedAirTrack(baseTrack: Track, baseConnectionIndex: 0 | 1,
	newTrackTemplate: AirTrackTemplate, newConnectionIndex: 0 | 1) {
	// Start off with a basic air track
	const airTrk = createAttachedTrack(
		baseTrack, baseConnectionIndex, newTrackTemplate, newConnectionIndex,
	);

	// Calculate connection data for the air track
	const baseAttachPoint = baseTrack.template.attachPoints[baseConnectionIndex];
	const newAttachPoint = newTrackTemplate.attachPoints[newConnectionIndex];
	const newTrackCoords = getTrackAttachmentPosition(baseTrack.pos,
		baseAttachPoint.trackOffset, newAttachPoint.trackOffset);

	// Spawn the additional setup track
	const spawnedTrack = createRootTrack(newTrackTemplate.spawnedTrackAttachment.trackTemplate,
		addCoords(newTrackCoords, newTrackTemplate.spawnedTrackOffset));

	const spawnedMergeAttachPointPaths = spawnedTrack.localAttachPointPaths[
		newTrackTemplate.spawnedTrackAttachMergeIndex];

	const airMergeAttachPointPaths = airTrk.localAttachPointPaths[1 - newConnectionIndex];

	// Bundle the air track and spawned track's incoming paths at the merged attach point
	// (The air track's merged attach point index must the the opposite of its physical connection)
	spawnedMergeAttachPointPaths.incoming = [...spawnedMergeAttachPointPaths.incoming,
		...airMergeAttachPointPaths.incoming];

	airMergeAttachPointPaths.incoming[0].next = spawnedMergeAttachPointPaths.outgoing[0];

	return [airTrk, spawnedTrack];
}

/**
 * Creates a new Track with no connections.
 * @param template The template to create the Track from.
 * @returns The created Track.
 */
function createTrack(template: TrackTemplate) {
	const paths = <TrackPath[]>[];

	// All tracks should have two default paths.
	if (template.attachPoints.length !== 2) {
		throw (new Error(`Expected two attach points, got ${template.attachPoints.length}.`));
	}

	// Create the default track paths.
	template.attachPoints.forEach((attachPoint: TrackAttachPoint) => {
		paths.push(<TrackPath>{
			template: attachPoint.localOutgoingPathTemplate,
			pos: attachPoint.trackOffset,
			attachPointPaths: [],
			parentTrack: null,
			next: null,
			prev: null,
		});
	});

	// Point the default paths to each other, creating a loop
	paths[0].next = paths[1];
	paths[1].prev = paths[0];
	paths[1].next = paths[0];
	paths[0].prev = paths[1];

	// Create the track using the created paths
	const trk = <Track>{
		template,
		pos: { x: 0, y: 0 },
		paths,
		hasCaps: false,
	};

	// Set references in the paths to the base track
	paths[0].parentTrack = trk;
	paths[1].parentTrack = trk;

	// Setup incoming and outgoing paths on attachment points
	setAttachPointPaths(trk);

	return trk;
}

/**
 * Moves a Track to the specified position, also changing the coordinates of its paths.
 * @param track The track to move.
 * @param pos The new coordinates to move the track to.
 */
function setTrackPosition(track: Track, pos: Coordinates2d) {
	const delta = subtractCoords(pos, track.pos);
	track.pos = pos;
	track.paths.forEach((path) => {
		path.pos = addCoords(path.pos, delta);
	});
}

/**
 * Properly initializes a track's incoming and outgoing paths on each attachment point.
 * @param trk
 */
function setAttachPointPaths(trk: Track) {
	// Reset track's attachment point paths
	trk.localAttachPointPaths = [];
	for (let i = 0; i < trk.template.attachPoints.length; i++) {
		trk.localAttachPointPaths[i] = {
			outgoing: [],
			incoming: [],
		};
	}
	trk.paths.forEach((path, i) => {
		// Find where this path starts and ends
		const startPos = path.pos;
		// End position is the start position plus the offset
		// For null templates, it's the position of the other path to avoid
		// unnecessary end cap detection
		const endPos = path.template !== null
			? addCoords(startPos, path.template.traversalOffset) : trk.paths[1 - i].pos;

		// See if any of these paths start or stop on this track's attachment points
		trk.template.attachPoints.forEach((attachPoint, j) => {
		// If it starts on an attachment point, it's an outgoing path on that point
			if (coordEquals(startPos, attachPoint.trackOffset)) {
				trk.localAttachPointPaths[j].outgoing.push(path);

				// If it ends on an attachment point, it's an incoming path on that point
			} else if (coordEquals(endPos, attachPoint.trackOffset)) {
				trk.localAttachPointPaths[j].incoming.push(path);
			}
		});
	});
}

/**
 * Links two tracks' attachment paths together from their paths at an attachment point.
 * @param attachPointPathsA The first track's local paths relative to the attachment point.
 * @param attachPointPathsB The second track's local paths relative to the attachment point.
 */
function linkTrackPaths(attachPointPathsA: TrackLocalAttachPointPaths,
	attachPointPathsB: TrackLocalAttachPointPaths) {
	// Connect all local incoming paths from Track A to the local outgoing paths from Track B
	attachPointPathsA.incoming.forEach((incomingPath) => {
		attachPointPathsB.outgoing.forEach((outgoingPath) => {
			incomingPath.next = outgoingPath;
			outgoingPath.prev = incomingPath;
		});
	});

	// Connect all local incoming paths from Track B to the local outgoing paths from Track A
	attachPointPathsB.incoming.forEach((incomingPath) => {
		attachPointPathsA.outgoing.forEach((outgoingPath) => {
			incomingPath.next = outgoingPath;
			outgoingPath.prev = incomingPath;
		});
	});
}
