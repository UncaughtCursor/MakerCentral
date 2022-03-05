/* eslint-disable import/prefer-default-export */
import {
	addCoords, coordEquals, Coordinates2d, subtractCoords,
} from '../util/Coordinates2d';
import TrackMap from './TrackMap';
import {
	AirTrackTemplate, getTrackAttachmentPosition, isAirTrackTemplate,
	Track, TrackPath, TrackPathTemplate, TrackTemplate,
} from './TrackUtil';

const diagCorrectionChainLength = 6;

/**
 * Checks if a new track with the specified template can be added onto the end of a base track.
 * @param baseTrack The track to be added onto.
 * @param baseConnectionIndex The array index of the connection point in the base track's template.
 * @param newTrackTemplate The template of the track to test.
 * @param newConnectionIndex The array index of the connection point in the new track's template.
 * @param map The TrackMap to check for tracks on.
 * @param ignoreCorrections If true, allows tracks to be placed that generate corrections.
 * @returns Whether or not the addition is possible.
 */
export function canAddTrackTo(baseTrack: Track, baseConnectionIndex: 0 | 1,
	newTrackTemplate: TrackTemplate, newConnectionIndex: 0 | 1, map: TrackMap,
	ignoreCorrections: boolean) {
	const isNewAirTrack = isAirTrackTemplate(newTrackTemplate);

	// Cannot place if a correction is generated unless otherwise specified.

	if (isCorrectionGenerated(newTrackTemplate, baseTrack, baseConnectionIndex,
		newConnectionIndex) && !ignoreCorrections) return false;

	const baseAttachPoint = baseTrack.template.attachPoints[baseConnectionIndex];
	const newAttachPoint = newTrackTemplate.attachPoints[newConnectionIndex];

	// Calculate new track placements and attachment position

	const newTrackCoords = getTrackAttachmentPosition(baseTrack.pos,
		baseAttachPoint.trackOffset, newAttachPoint.trackOffset);
	const globalAttachCoords = addCoords(baseAttachPoint.trackOffset, baseTrack.pos);

	// Ensure that both tracks' attachment points will allow each others' templates to be attached

	// If the length is zero, all templates are accepted
	if (baseAttachPoint.acceptableTrackAttachments.length > 0) {
		if (baseAttachPoint.acceptableTrackAttachments.findIndex(
			(el) => el.trackTemplate.name === newTrackTemplate.name
			&& el.connectionIndex === newConnectionIndex,
		) < 0) {
			return false; /* Return false if the base attach point's acceptable templates
			do not include the new track's template */
		}
	}
	if (newAttachPoint.acceptableTrackAttachments.length > 0) {
		if (newAttachPoint.acceptableTrackAttachments.findIndex(
			(el) => el.trackTemplate.name === baseTrack.template.name
			&& el.connectionIndex === baseConnectionIndex,
		) < 0) {
			return false;
		}
	}
	// Air tracks cannot connect to other air tracks
	if (isNewAirTrack && isAirTrackTemplate(baseTrack.template)) return false;

	// Check collision between the two tracks

	if (isNewAirTrack) {
		return canPlaceAirTrackWithAttachPointsAt(<AirTrackTemplate>newTrackTemplate, newTrackCoords,
			map, [globalAttachCoords]);
	}
	return canPlaceTrackWithAttachPointsAt(newTrackTemplate, newTrackCoords,
		map, [globalAttachCoords]);
}

/**
 * Determines whether or not a new track can be legally placed on a TrackMap.
 * @param trkTemplate The track template of to be placed.
 * @param pos The position of the track to be placed.
 * @param map The TrackMap to check collision on.
 * @returns Whether or not the Track can legally be placed.
 */
export function canPlaceTrackAt(trkTemplate: TrackTemplate, pos: Coordinates2d, map: TrackMap) {
	if (!isAirTrackTemplate(trkTemplate)) {
		return canPlaceTrackWithAttachPointsAt(trkTemplate, pos, map, []);
	}
	return false; // Air tracks cannot be placed on their own.
}

/**
 * Determines whether or not a new track can be legally placed on a TrackMap
 * with attachment point tiles.
 * @param trkTemplate The track template of the track to be placed.
 * @param pos The position of the track to be placed.
 * @param map The TrackMap to check collision on.
 * @param attachTiles The list of attachment point tiles to consider.
 * @returns Whether or not the track can legally be placed.
 */
function canPlaceTrackWithAttachPointsAt(trkTemplate: TrackTemplate, pos: Coordinates2d,
	map: TrackMap, attachTiles: Coordinates2d[]) {
	// TODO: Correction unit checks
	const collisionMap = trkTemplate.collisionMap;
	for (let i = 0; i < collisionMap.length; i++) {
		const y = pos.y + i;
		for (let j = 0; j < collisionMap[i].length; j++) {
			const x = pos.x + j;
			// Tracks that touch out-of-bounds areas cannot be placed
			if (x < 0 || x >= map.width || y < 0 || y >= map.height) return false;

			// Skip tiles with no collision
			if (!collisionMap[i][j]) continue;

			// Return false when more tiles are occupied in a tile than allowed
			let maxTileOccupants = 0;
			for (let k = 0; k < attachTiles.length; k++) {
				if (coordEquals({ x, y }, attachTiles[k])) maxTileOccupants = 1;
			}
			if (map.getTracksAtTile({ x, y }).length > maxTileOccupants) return false;
		}
	}
	if (trkTemplate.name.substr(0, 4) === 'diag') {
		const trkAttachTiles: Coordinates2d[] = [];
		trkTemplate.attachPoints.forEach((attachPoint) => {
			trkAttachTiles.push(addCoords(pos, attachPoint.trackOffset));
		});
		return !hasDiagonalCornerConflict(trkTemplate, trkAttachTiles, map);
	}
	return true;
}

/**
 * Determines whether or not a new air track can be legally placed on a TrackMap
 * with attachment point tiles.
 * @param trkTemplate The air track template of the track to be placed.
 * @param pos The position of the track to be placed.
 * @param map The TrackMap to check collision on.
 * @param attachTiles A list of attachment point tiles to consider.
 * @returns Whether or not the air track can legally be placed.
 */
function canPlaceAirTrackWithAttachPointsAt(trkTemplate: AirTrackTemplate, pos: Coordinates2d,
	map: TrackMap, attachTiles: Coordinates2d[]) {
	// If the air track cannot be placed as a normal track, it can't be placed.
	if (!canPlaceTrackWithAttachPointsAt(trkTemplate, pos, map, attachTiles)) return false;
	// If the air track's spawned physical track cannot be placed, the air track can't be placed.
	if (!canPlaceTrackAt(trkTemplate.spawnedTrackAttachment.trackTemplate,
		addCoords(pos, trkTemplate.spawnedTrackOffset), map)) return false;
	return true;
}

/**
 * Determines if a diagonal track attempted to be placed will conflict with
 * another through a tile corner.
 * @param placedTemplate The template of the diagonal track to be placed.
 * @param attachTiles The attach tiles of the diagonal track attempted to be placed.
 * @param map The TrackMap to check collision on.
 */
function hasDiagonalCornerConflict(placedTemplate: TrackTemplate,
	attachTiles: Coordinates2d[], map: TrackMap) {
	/* Sample surrounding 4 tiles of each attachment tile and record
		all unique diagonals where an attachment tile is encountered */
	let hasConflict = false;
	attachTiles.forEach((attachTile, attachTileIndex) => {
		for (let i = 0; i < 4; i++) {
			// +x, -x, +y, -y
			const sign = i % 2 === 0 ? 1 : -1;
			let searchCoords: Coordinates2d;
			let localSearchCoords: Coordinates2d;
			let trks: Track[] = [];

			if (i < 2) {
				// x
				localSearchCoords = { x: sign, y: 0 };
			} else {
				// y
				localSearchCoords = { x: 0, y: sign };
			}
			// eslint-disable-next-line prefer-const
			searchCoords = addCoords(attachTile, localSearchCoords);
			trks = map.getTracksAtTile(searchCoords);

			for (let j = 0; j < trks.length; j++) {
				const trk = trks[j];
				// Only process diagonal tracks with different names
				if (trk.template.name.substr(0, 4) === 'diag' && trk.template.name !== placedTemplate.name) {
					let foundOtherAttachIndex = -1;
					// Only process connection points
					trk.template.attachPoints.forEach((tempAttachPoint, otherAttachIndex) => {
						const globalAttachCoords = addCoords(trk.pos, tempAttachPoint.trackOffset);
						if (coordEquals(globalAttachCoords, searchCoords)) {
							foundOtherAttachIndex = otherAttachIndex;
						}
					});
					/* Only process tracks whose attach point is next to the
					placed track's attach point */
					if (foundOtherAttachIndex !== -1) {
						const otherOppositeAttachCoords = addCoords(trk.pos,
							trk.template.attachPoints[1 - foundOtherAttachIndex].trackOffset);
						const oppositeDiff = subtractCoords(attachTiles[1 - attachTileIndex],
							otherOppositeAttachCoords);
						/* If the signs switch and the zeros stay zero, then the two tracks have crossed */
						const hasCrossed = (Math.sign(localSearchCoords.x) === Math.sign(oppositeDiff.x)
						&& Math.sign(localSearchCoords.y) === Math.sign(oppositeDiff.y));

						// Test for the spacing of the opposite ends required to have a conflict
						let hasCrossSpacing = false;
						if (oppositeDiff.x === 0 && Math.abs(oppositeDiff.y) === 3) hasCrossSpacing = true;
						if (oppositeDiff.y === 0 && Math.abs(oppositeDiff.x) === 3) hasCrossSpacing = true;

						// If the spacing and cross test succeed, there is a conflict
						if (hasCrossed && hasCrossSpacing) {
							hasConflict = true;
							break;
						}
					}
				}
			}
			if (hasConflict) break;
		}
	});
	return hasConflict;
}

/**
 * Checks if the current track attempted to be placed will result in the generation of a correction.
 * @param trkTemplate The track template of the track to be placed.
 * @param baseTrk The base track to be added to.
 * @param baseConnectionIndex The index of the attachment point on the base track.
 * @param newConnectionIndex The index of the attachment point in the new track's template.
 * @returns Whether or not a correction is generated.
 */
function isCorrectionGenerated(trkTemplate: TrackTemplate,
	baseTrk: Track, baseConnectionIndex: 0 | 1, newConnectionIndex: 0 | 1) {
	// No correction is generated for air tracks.
	// TODO: Corrections ARE generated past air tracks -- see short horizontal drop behavior
	if (isAirTrackTemplate(trkTemplate) || isAirTrackTemplate(baseTrk.template)) return false;

	const basePath = baseTrk.localAttachPointPaths[baseConnectionIndex].incoming[0];
	const nextPathTemp = trkTemplate.attachPoints[newConnectionIndex].localOutgoingPathTemplate!;

	// Detect diagonal corrections
	// Triggers when there are 6 diagonal tracks in the same direction in a row
	if (basePath.parentTrack!.template.name.substr(0, 4) === 'diag') {
		// Must have the same template to generate correction
		if (basePath.template !== nextPathTemp) return false;
		return prevPathsHaveTemplate(basePath, basePath.template, diagCorrectionChainLength - 2);
	}

	// Detect straight and curved corrections
	// Triggers when three tracks are "smoothly" connected in a row with the combinations:
	// Straight - Straight - Curved
	// Curved - Straight - Straight
	// Curved - Straight - Curved
	// Straight - Straight - Straight

	// Base path is the middle path for the above combinations - must be straight
	if (basePath.parentTrack!.template.name.substr(0, 8) === 'straight') {
		// The axis to check for smooth connections is dependent on the middle path's direction.
		const correctionCheckAxis = getPathTemplateAlignmentAxis(basePath.template);
		const prevPathTemp = basePath.prev!.template;

		const isPrevStraight = !isDiagonalPathTemplate(prevPathTemp);
		const isNextStraight = !isDiagonalPathTemplate(nextPathTemp);

		// FIXME: Some C-S-S strings still go through

		/* If the next or previous paths are straight and do not
		   have the same templates, then no correction is generated. */
		if (isPrevStraight && prevPathTemp !== basePath.template) return false;
		if (isNextStraight && nextPathTemp !== basePath.template) return false;

		/* If either the next or previous paths are
		   not straight or curved, then no correction is generated. */
		if (!isPrevStraight && prevPathTemp.traversalTime !== 36) return false;
		if (!isPrevStraight && nextPathTemp.traversalTime !== 36) return false;

		/* For a correction to not be generated at this point, the next curved path
		must be misaligned with the axis or the previous curved path must aligned. */
		if (!isPrevStraight && getPathTemplateAlignmentAxis(prevPathTemp)
		=== correctionCheckAxis) return false;

		if (!isNextStraight && getPathTemplateAlignmentAxis(nextPathTemp)
		!== correctionCheckAxis) return false;

		// If all of these tests pass through, then a correction is generated.
		return true;
	}

	return false;
}

/**
 * Determines whether or not the specified number of a path's previous paths are
 * of the specified template.
 * @param path The path to be checked.
 * @param temp The template to be checked for.
 * @param numPaths The number of previous paths to check.
 * @returns Whether or not the template is present.
 */
function prevPathsHaveTemplate(path: TrackPath, temp: TrackPathTemplate, numPaths: number) {
	let currentPath = path.prev!;
	for (let i = 0; i < numPaths; i++) {
		if (currentPath.template !== temp) return false;
		currentPath = currentPath.prev!;
	}
	return true;
}

/**
 * Determines whether the given path template aligns with the x-axis or the y-axis.
 * @param temp The path to check.
 * @returns The axis that the path aligns with or null if the path is not aligned.
 */
function getPathTemplateAlignmentAxis(temp: TrackPathTemplate): 'x' | 'y' | null {
	if (temp.interpolationType === 'LINEAR') {
		// Diagonal paths do not align with the axes.
		if (isDiagonalPathTemplate(temp)) return null;
		// For straight paths, alignment depends on the components of the traversal offset.
		return temp.traversalOffset.x !== 0 ? 'x' : 'y';
	}

	if (temp.interpolationType === 'CURVED') {
		/* For curved paths, alignment depends on whether or not
		   the interpolation animation is reversed. */
		return temp.interpolationData.reverseAnim ? 'x' : 'y';
	}

	return null;
}

/**
 * Returns whether or not the given path template's offset is diagonal.
 * @param path The path template to check.
 */
function isDiagonalPathTemplate(temp: TrackPathTemplate): boolean {
	return (temp.traversalOffset.x !== 0 && temp.traversalOffset.y !== 0);
}
