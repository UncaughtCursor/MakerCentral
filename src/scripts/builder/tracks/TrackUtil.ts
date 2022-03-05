import {
	addCoords, coordEquals, Coordinates2d, scaleCoords, subtractCoords,
} from '../util/Coordinates2d';
import hasProperty from '../util/hasProperty';

export interface TrackTemplate {
	attachPoints: TrackAttachPoint[],
	collisionMap: boolean[][],
	name: string
}

export interface TrackAttachPoint {
	trackOffset: Coordinates2d,
	localOutgoingPathTemplate: TrackPathTemplate | null,
	acceptableTrackAttachments: TrackAttachmentTemplate[] // If length is zero, any template works
}

export interface Track {
	template: TrackTemplate,
	pos: Coordinates2d,
	paths: TrackPath[],
	localAttachPointPaths: TrackLocalAttachPointPaths[],
	hasCaps: boolean,
}

export interface AirTrackTemplate {
	attachPoints: TrackAttachPoint[],
	collisionMap: boolean[][],
	spawnedTrackAttachment: TrackAttachmentTemplate,
	spawnedTrackOffset: Coordinates2d,
	spawnedTrackAttachMergeIndex: 0 | 1,
	name: string
}

export interface TrackLocalAttachPointPaths {
	outgoing: TrackPath[],
	incoming: TrackPath[]
}

export interface TrackAttachmentTemplate {
	trackTemplate: TrackTemplate,
	connectionIndex: 0 | 1
}

export interface TrackPathTemplate {
	traversalOffset: Coordinates2d,
	traversalTime: number,
	interpolationType: 'LINEAR' | 'CURVED' | 'HFALL',
	interpolationData: any
	name: string
}

export interface TrackPath {
	template: TrackPathTemplate,
	pos: Coordinates2d,
	parentTrack: Track | null,
	next: TrackPath | null,
	prev: TrackPath | null
}

const pathTemplates: Map<string, TrackPathTemplate> = new Map();

// Horizontal Paths
pathTemplates.set('right', {
	traversalOffset: { x: 2, y: 0 },
	traversalTime: 21,
	interpolationType: 'LINEAR',
	interpolationData: null,
	name: 'right',
});
pathTemplates.set('left', {
	traversalOffset: { x: -2, y: 0 },
	traversalTime: 21,
	interpolationType: 'LINEAR',
	interpolationData: null,
	name: 'left',
});

// Vertical Paths
pathTemplates.set('up', {
	traversalOffset: { x: 0, y: -2 },
	traversalTime: 21,
	interpolationType: 'LINEAR',
	interpolationData: null,
	name: 'up',
});
pathTemplates.set('down', {
	traversalOffset: { x: 0, y: 2 },
	traversalTime: 21,
	interpolationType: 'LINEAR',
	interpolationData: null,
	name: 'down',
});

// [/] Paths
pathTemplates.set('upRight', {
	traversalOffset: { x: 2, y: -2 },
	traversalTime: 30,
	interpolationType: 'LINEAR',
	interpolationData: null,
	name: 'upRight',
});
pathTemplates.set('downLeft', {
	traversalOffset: { x: -2, y: 2 },
	traversalTime: 30,
	interpolationType: 'LINEAR',
	interpolationData: null,
	name: 'downLeft',
});

// [\] Paths
pathTemplates.set('downRight', {
	traversalOffset: { x: 2, y: 2 },
	traversalTime: 30,
	interpolationType: 'LINEAR',
	interpolationData: null,
	name: 'downRight',
});
pathTemplates.set('upLeft', {
	traversalOffset: { x: -2, y: -2 },
	traversalTime: 30,
	interpolationType: 'LINEAR',
	interpolationData: null,
	name: 'upLeft',
});

// Curved Paths - CW
pathTemplates.set('upRightCw', {
	traversalOffset: { x: 2, y: -2 },
	traversalTime: 36,
	interpolationType: 'CURVED',
	interpolationData: {
		xSign: -1,
		ySign: 1,
		reverseAnim: false,
	},
	name: 'upRightCw',
});
pathTemplates.set('downLeftCw', {
	traversalOffset: { x: -2, y: 2 },
	traversalTime: 36,
	interpolationType: 'CURVED',
	interpolationData: {
		xSign: 1,
		ySign: -1,
		reverseAnim: false,
	},
	name: 'downLeftCw',
});
pathTemplates.set('downRightCw', {
	traversalOffset: { x: 2, y: 2 },
	traversalTime: 36,
	interpolationType: 'CURVED',
	interpolationData: {
		xSign: 1,
		ySign: 1,
		reverseAnim: true,
	},
	name: 'downRightCw',
});
pathTemplates.set('upLeftCw', {
	traversalOffset: { x: -2, y: -2 },
	traversalTime: 36,
	interpolationType: 'CURVED',
	interpolationData: {
		xSign: -1,
		ySign: -1,
		reverseAnim: true,
	},
	name: 'upLeftCw',
});

// Curved Paths - CCW
pathTemplates.set('upRightCcw', {
	traversalOffset: { x: 2, y: -2 },
	traversalTime: 36,
	interpolationType: 'CURVED',
	interpolationData: {
		xSign: 1,
		ySign: -1,
		reverseAnim: true,
	},
	name: 'upRightCcw',
});
pathTemplates.set('downLeftCcw', {
	traversalOffset: { x: -2, y: 2 },
	traversalTime: 36,
	interpolationType: 'CURVED',
	interpolationData: {
		xSign: -1,
		ySign: 1,
		reverseAnim: true,
	},
	name: 'downLeftCcw',
});
pathTemplates.set('downRightCcw', {
	traversalOffset: { x: 2, y: 2 },
	traversalTime: 36,
	interpolationType: 'CURVED',
	interpolationData: {
		xSign: -1,
		ySign: -1,
		reverseAnim: false,
	},
	name: 'downRightCcw',
});
pathTemplates.set('upLeftCcw', {
	traversalOffset: { x: -2, y: -2 },
	traversalTime: 36,
	interpolationType: 'CURVED',
	interpolationData: {
		xSign: 1,
		ySign: 1,
		reverseAnim: false,
	},
	name: 'upLeftCcw',
});

// AirHv Paths
pathTemplates.set('airHvL1', {
	traversalOffset: { x: -1, y: 2 },
	traversalTime: 29,
	interpolationType: 'HFALL',
	interpolationData: {
		xSign: -1,
		fallLength: 16,
		numVerticalTracks: 1,
	},
	name: 'airHvL1',
});
pathTemplates.set('airHvR1', {
	traversalOffset: { x: 1, y: 2 },
	traversalTime: 28,
	interpolationType: 'HFALL',
	interpolationData: {
		xSign: 1,
		fallLength: 16,
		numVerticalTracks: 1,
	},
	name: 'airHvR1',
});
pathTemplates.set('airHvL2', {
	traversalOffset: { x: -1, y: 1 },
	traversalTime: 18,
	interpolationType: 'HFALL',
	interpolationData: {
		xSign: -1,
		fallLength: 16,
		numVerticalTracks: 0.5,
	},
	name: 'airHvL2',
});
pathTemplates.set('airHvR2', {
	traversalOffset: { x: 1, y: 1 },
	traversalTime: 19,
	interpolationType: 'HFALL',
	interpolationData: {
		xSign: 1,
		fallLength: 16,
		numVerticalTracks: 0.5,
	},
	name: 'airHvR2',
});

const trackTemplates: Map<string, TrackTemplate | AirTrackTemplate> = new Map();
trackTemplates.set('straightH', {
	collisionMap: [
		[true, true, true],
	],
	attachPoints: [
		{
			trackOffset: { x: 0, y: 0 },
			localOutgoingPathTemplate: getTrackPathTemplate('right')!,
			acceptableTrackAttachments: [],
		},
		{
			trackOffset: { x: 2, y: 0 },
			localOutgoingPathTemplate: getTrackPathTemplate('left')!,
			acceptableTrackAttachments: [],
		},
	],
	name: 'straightH',
});
trackTemplates.set('straightV', {
	collisionMap: [
		[true],
		[true],
		[true],
	],
	attachPoints: [
		{
			trackOffset: { x: 0, y: 0 },
			localOutgoingPathTemplate: getTrackPathTemplate('down')!,
			acceptableTrackAttachments: [],
		},
		{
			trackOffset: { x: 0, y: 2 },
			localOutgoingPathTemplate: getTrackPathTemplate('up')!,
			acceptableTrackAttachments: [],
		},
	],
	name: 'straightV',
});
trackTemplates.set('diagDU', {
	collisionMap: [
		[false, false, true],
		[false, true, false],
		[true, false, false],
	],
	attachPoints: [
		{
			trackOffset: { x: 0, y: 2 },
			localOutgoingPathTemplate: getTrackPathTemplate('upRight')!,
			acceptableTrackAttachments: [],
		},
		{
			trackOffset: { x: 2, y: 0 },
			localOutgoingPathTemplate: getTrackPathTemplate('downLeft')!,
			acceptableTrackAttachments: [],
		},
	],
	name: 'diagDU',
});
trackTemplates.set('diagUD', {
	collisionMap: [
		[true, false, false],
		[false, true, false],
		[false, false, true],
	],
	attachPoints: [
		{
			trackOffset: { x: 0, y: 0 },
			localOutgoingPathTemplate: getTrackPathTemplate('downRight')!,
			acceptableTrackAttachments: [],
		},
		{
			trackOffset: { x: 2, y: 2 },
			localOutgoingPathTemplate: getTrackPathTemplate('upLeft')!,
			acceptableTrackAttachments: [],
		},
	],
	name: 'diagUD',
});
trackTemplates.set('diagDU', {
	collisionMap: [
		[false, false, true],
		[false, true, false],
		[true, false, false],
	],
	attachPoints: [
		{
			trackOffset: { x: 0, y: 2 },
			localOutgoingPathTemplate: getTrackPathTemplate('upRight')!,
			acceptableTrackAttachments: [],
		},
		{
			trackOffset: { x: 2, y: 0 },
			localOutgoingPathTemplate: getTrackPathTemplate('downLeft')!,
			acceptableTrackAttachments: [],
		},
	],
	name: 'diagDU',
});
trackTemplates.set('curve03', {
	collisionMap: [
		[true, true, true],
		[false, true, true],
		[false, false, true],
	],
	attachPoints: [
		{
			trackOffset: { x: 0, y: 0 },
			localOutgoingPathTemplate: getTrackPathTemplate('downRightCw')!,
			acceptableTrackAttachments: [],
		},
		{
			trackOffset: { x: 2, y: 2 },
			localOutgoingPathTemplate: getTrackPathTemplate('upLeftCcw')!,
			acceptableTrackAttachments: [],
		},
	],
	name: 'curve03',
});
trackTemplates.set('curve36', {
	collisionMap: [
		[false, false, true],
		[false, true, true],
		[true, true, true],
	],
	attachPoints: [
		{
			trackOffset: { x: 2, y: 0 },
			localOutgoingPathTemplate: getTrackPathTemplate('downLeftCw')!,
			acceptableTrackAttachments: [],
		},
		{
			trackOffset: { x: 0, y: 2 },
			localOutgoingPathTemplate: getTrackPathTemplate('upRightCcw')!,
			acceptableTrackAttachments: [],
		},
	],
	name: 'curve36',
});
trackTemplates.set('curve69', {
	collisionMap: [
		[true, false, false],
		[true, true, false],
		[true, true, true],
	],
	attachPoints: [
		{
			trackOffset: { x: 0, y: 0 },
			localOutgoingPathTemplate: getTrackPathTemplate('downRightCcw')!,
			acceptableTrackAttachments: [],
		},
		{
			trackOffset: { x: 2, y: 2 },
			localOutgoingPathTemplate: getTrackPathTemplate('upLeftCw')!,
			acceptableTrackAttachments: [],
		},
	],
	name: 'curve69',
});
trackTemplates.set('curve90', {
	collisionMap: [
		[true, true, true],
		[true, true, false],
		[true, false, false],
	],
	attachPoints: [
		{
			trackOffset: { x: 2, y: 0 },
			localOutgoingPathTemplate: getTrackPathTemplate('downLeftCcw')!,
			acceptableTrackAttachments: [],
		},
		{
			trackOffset: { x: 0, y: 2 },
			localOutgoingPathTemplate: getTrackPathTemplate('upRightCw')!,
			acceptableTrackAttachments: [],
		},
	],
	name: 'curve90',
});
trackTemplates.set('airHvL1', {
	attachPoints: [
		{
			trackOffset: { x: 1, y: 0 },
			localOutgoingPathTemplate: getTrackPathTemplate('airHvL1')!,
			acceptableTrackAttachments: [
				{
					trackTemplate: getTrackTemplate('straightH')!,
					connectionIndex: 0,
				},
			],
		},
		{
			trackOffset: { x: 0, y: 2 },
			localOutgoingPathTemplate: null,
			acceptableTrackAttachments: [],
		},
	],
	collisionMap: [
		[true, true],
		[false, true],
		[false, false],
	],
	spawnedTrackAttachment: {
		trackTemplate: getTrackTemplate('straightV')!,
		connectionIndex: 0,
	},
	spawnedTrackOffset: { x: 0, y: 0 },
	spawnedTrackAttachMergeIndex: 1,
	name: 'airHvL1',
});
trackTemplates.set('airHvR1', {
	attachPoints: [
		{
			trackOffset: { x: 0, y: 0 },
			localOutgoingPathTemplate: getTrackPathTemplate('airHvR1')!,
			acceptableTrackAttachments: [
				{
					trackTemplate: getTrackTemplate('straightH')!,
					connectionIndex: 1,
				},
			],
		},
		{
			trackOffset: { x: 1, y: 2 },
			localOutgoingPathTemplate: null,
			acceptableTrackAttachments: [],
		},
	],
	collisionMap: [
		[true, true],
		[true, false],
		[false, false],
	],
	spawnedTrackAttachment: {
		trackTemplate: getTrackTemplate('straightV')!,
		connectionIndex: 0, // TODO: unnecessary?
	},
	spawnedTrackOffset: { x: 1, y: 0 },
	spawnedTrackAttachMergeIndex: 1,
	name: 'airHvR1',
});
trackTemplates.set('airHvL2', {
	attachPoints: [
		{
			trackOffset: { x: 1, y: 0 },
			localOutgoingPathTemplate: getTrackPathTemplate('airHvL2')!,
			acceptableTrackAttachments: [
				{
					trackTemplate: getTrackTemplate('straightH')!,
					connectionIndex: 0,
				},
			],
		},
		{
			trackOffset: { x: 0, y: 1 },
			localOutgoingPathTemplate: null,
			acceptableTrackAttachments: [],
		},
	],
	collisionMap: [
		[false, true],
		[false, true],
	],
	spawnedTrackAttachment: {
		trackTemplate: getTrackTemplate('straightV')!,
		connectionIndex: 0,
	},
	spawnedTrackOffset: { x: 0, y: -1 },
	spawnedTrackAttachMergeIndex: 1,
	name: 'airHvL2',
});
trackTemplates.set('airHvR2', {
	attachPoints: [
		{
			trackOffset: { x: 0, y: 0 },
			localOutgoingPathTemplate: getTrackPathTemplate('airHvR2')!,
			acceptableTrackAttachments: [
				{
					trackTemplate: getTrackTemplate('straightH')!,
					connectionIndex: 1,
				},
			],
		},
		{
			trackOffset: { x: 1, y: 1 },
			localOutgoingPathTemplate: null,
			acceptableTrackAttachments: [],
		},
	],
	collisionMap: [ // For air tracks, there is only collision on the starting part of the fall
		[true, false],
		[true, false],
	],
	spawnedTrackAttachment: {
		trackTemplate: getTrackTemplate('straightV')!,
		connectionIndex: 0,
	},
	spawnedTrackOffset: { x: 1, y: -1 },
	spawnedTrackAttachMergeIndex: 1,
	name: 'airHvL2',
});

/**
 * Returns a track template from the given name.
 * @param name The name of the track template.
 * @returns The retrieved track template.
 */
export function getTrackTemplate(name: string) {
	return trackTemplates.get(name);
}

/**
 * Returns a track path template from the given name.
 * @param name The name of the track path template.
 * @returns The retrieved track path template.
 */
export function getTrackPathTemplate(name: string) {
	return pathTemplates.get(name);
}

/**
 * Calculates the position of a track to be attached to another.
 * @param baseTrackPos The xy position of the base track.
 * @param baseAttachOfs The xy offset of the base track's point of attachment.
 * @param newAttachOfs The xy offset of the new track's point of attachment.
 * @returns The xy coordinates for the new track to be placed.
 */
export function getTrackAttachmentPosition(baseTrackPos: Coordinates2d,
	baseAttachOfs: Coordinates2d, newAttachOfs: Coordinates2d) {
	// Base Track Pos + Base Attach Offset - New Attach Offset
	return subtractCoords(addCoords(baseTrackPos, baseAttachOfs), newAttachOfs);
}

/**
 * Determines if a track path's connection reflects on itself (i.e. it has a closed end)
 */
export function isReflectedPath(path: TrackPath) {
	/* The path is reflected if its next and previous paths have
	the same coordinates and the direction of the previous path is opposite
	the direction of the current path. */
	return coordEquals(path.prev!.pos, path.next!.pos)
		&& (coordEquals(path.template.traversalOffset,
			scaleCoords(path.prev!.template.traversalOffset, -1)));
}

/**
 * Returns whether or not the track template provided is an air track template.
 * @param temp The track template to check.
 * @returns Whether or not the template is an air track template.
 */
export function isAirTrackTemplate(temp: TrackTemplate | AirTrackTemplate) {
	return hasProperty('spawnedTrackAttachment', temp);
}
