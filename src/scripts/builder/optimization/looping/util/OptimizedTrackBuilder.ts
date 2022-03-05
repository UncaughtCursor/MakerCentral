import TrackMap from '../../../tracks/TrackMap';
import {
	Track, TrackTemplate, getTrackTemplate, getTrackAttachmentPosition,
} from '../../../tracks/TrackUtil';
import {
	addCoords, coordDistSqr, Coordinates2d,
} from '../../../util/Coordinates2d';
import * as TrackChecker from '../../../tracks/TrackChecker';
import * as TrackBuilder from '../../../tracks/TrackBuilder';

export interface TrackAddition {
	baseAttachIndex: 0 | 1,
	newAttachIndex: 0 | 1,
	newTrackTemplate: TrackTemplate,
}

export const straightTemps = ['straightH', 'straightV'];
export const diagTemps = ['diagDU', 'diagUD'];
export const curveTemps = ['curve03', 'curve36',
	'curve69', 'curve90'];
export const stdTemps = [...straightTemps, ...diagTemps, ...curveTemps];

/**
 * Builds tracks according to a given scoring function from the provided base track
 * with limited numbers of standard tracks. Higher scores will be pursued.
 * Exits once the tracks run out or the score evaluates to negative Infinity as a failure.
 * @param trkMap The TrackMap to build the tracks on.
 * @param baseTrk The track to build off of.
 * @param trkAmounts An array containing the number of straight, diagonal,
 * and curved track segments to build, respectively.
 * @param scoreFunction The function to use to score available moves. Takes position
 * and the list of all added tracks as parameters.
 */
export function buildStandardTracksWithScore(trkMap: TrackMap, baseTrk: Track,
	trkAmounts: number[], scoreFunction: (pos: Coordinates2d, usedTrks: Track[]) => number):
	{isSuccess: boolean, addedTracks: Track[]} {
	let numStraights = trkAmounts[0];
	let numDiags = trkAmounts[1];
	let numCurves = trkAmounts[2];

	let curTrk: Track = baseTrk;
	const addedTracks: Track[] = [];

	while (numStraights > 0 || numDiags > 0 || numCurves > 0) {
		const availableTemplates = [];
		if (numStraights > 0) availableTemplates.push(...straightTemps);
		if (numDiags > 0) availableTemplates.push(...diagTemps);
		if (numCurves > 0) availableTemplates.push(...curveTemps);

		const curBuildRes = buildWithScore(trkMap, curTrk, scoreFunction, availableTemplates, 1, false);
		if (!curBuildRes.isSuccess) return { isSuccess: false, addedTracks };

		const addedTrk = curBuildRes.addedTracks[0];
		addedTracks.push(addedTrk);

		if (addedTrk.template.name.substr(0, 8) === 'straight') numStraights--;
		if (addedTrk.template.name.substr(0, 4) === 'diag') numDiags--;
		if (addedTrk.template.name.substr(0, 5) === 'curve') numCurves--;

		curTrk = addedTrk;
	}

	return { isSuccess: true, addedTracks };
}

/**
 * Builds tracks according to a given scoring function from the provided base track
 * with unlimited numbers of tracks. Higher scores will be pursued.
 * Exits once the score is +/- Infinity or when all building options are expired.
 * +Infinity = success, -Infinity = failure
 * @param trkMap The TrackMap to build the tracks on.
 * @param baseTrk The track to build off of.
 * @param scoreFunction The function to use to score available moves. Takes position
 * and the list of all added tracks as parameters.
 * @param availableTemplates The list of strings for available track templates.
 * If unspecified, all templates of physical tracks are available.
 * @param numTracks The number of tracks to build. Infinity by default.
 * @param ignoreCorrections If true, allows tracks to be placed that generate corrections.
 * @returns Whether or not the build was successful and the tracks used.
 */
export function buildWithScore(trkMap: TrackMap, baseTrk: Track,
	scoreFunction: (pos: Coordinates2d, usedTrks: Track[]) => number,
	availableTemplates: string[] = stdTemps, numTracks: number = Infinity,
	ignoreCorrections: boolean):
	{isSuccess: boolean, addedTracks: Track[]} {
	let currentTrack = baseTrk;
	let additions = getLegalMoves(trkMap, currentTrack, availableTemplates, ignoreCorrections);
	let curScore = 0;
	const addedTracks = [];

	while (Math.abs(curScore) !== Infinity
	&& additions.length > 0 && addedTracks.length < numTracks) {
	// Calculate distances to the target tile for each available move.
		const additionScores: {addition: TrackAddition, score: number}[] = [];
		for (let i = 0; i < additions.length; i++) {
			const addition = additions[i];
			const pos = getTrackAdditionPosition(currentTrack, addition);
			additionScores.push({
				addition,
				score: scoreFunction(pos, [...addedTracks, currentTrack]),
			});
		}

		// Sort available additions by score, highest to lowest.
		additionScores.sort((a, b) => b.score - a.score);

		// Choose the closest addition to the target tile.
		const chosenAdd = additionScores[0].addition;
		curScore = additionScores[0].score;
		if (curScore !== -Infinity) {
			currentTrack = TrackBuilder.createAttachedTrack(
				currentTrack, chosenAdd.baseAttachIndex,
				chosenAdd.newTrackTemplate, chosenAdd.newAttachIndex,
			);
			trkMap.addTrack(currentTrack);
			addedTracks.push(currentTrack);
		} else {
			break;
		}

		// Refresh legal moves
		additions = getLegalMoves(trkMap, currentTrack, availableTemplates, ignoreCorrections);
	}
	let isSuccess = true;
	if ((curScore !== Infinity && addedTracks.length < numTracks)) {
		isSuccess = false;
	}
	return {
		isSuccess,
		addedTracks,
	};
}

/**
* Builds tracks straight towards the specified target tile from the provided base track
* with unlimited numbers of tracks. Exits once the target is reached
* or when all building options are expired. Ignores correction generation.
* @param trkMap The TrackMap to build the tracks on.
* @param baseTrk The track to build off of.
* @param targetTile The coordinates of the tile to target.
* @param availableTemplateNames The list of strings of available track templates.
* If unspecified, all templates of physical tracks are available.
*/
export function directBuildTowards(trkMap: TrackMap, baseTrk: Track, targetTile: Coordinates2d,
	availableTemplateNames: string[] = stdTemps) {
	/* If r is the distance, then the score evaluates to 1 / r^2.
	This is effective because no sqrt is calculated and the asymptotic
	value at distance zero automatically terminates the building. */
	const scoreFunction = (pos: Coordinates2d) => 1 / coordDistSqr(pos, targetTile);
	return buildWithScore(trkMap, baseTrk, scoreFunction, availableTemplateNames, Infinity, true);
}

/**
* Returns the position of the attachment point of a
* new track placement's attach point away from the point of connection.
* @param trk The base track being added onto.
* @param addition A TrackAddition describing the template and attachment indices of the new track.
* @returns The position of the new attachment point away from the connection.
*/
function getTrackAdditionPosition(trk: Track, addition: TrackAddition): Coordinates2d {
	const baseAttachPoint = trk.template.attachPoints[addition.baseAttachIndex];
	const newAttachPoint = addition.newTrackTemplate.attachPoints[addition.newAttachIndex];

	// Calculate new track placements and attachment position
	const newTrackCoords = getTrackAttachmentPosition(trk.pos,
		baseAttachPoint.trackOffset, newAttachPoint.trackOffset);
	// Relative coordinates of the far attachment point to return the position of.
	const relFarAttachCoords = addition.newTrackTemplate
		.attachPoints[1 - addition.newAttachIndex].trackOffset;
	return addCoords(relFarAttachCoords, newTrackCoords);
}

/**
* Gets a list of possible additions onto the specified track.
* @param trkMap The TrackMap to build the tracks on.
* @param trk The track to check for additions.
* @param availableTemplates The list of strings of the available track templates.
* If unspecified, all templates of physical tracks are available.
* @param ignoreCorrections If true, allows tracks to be placed that generate corrections.
* @returns The list of legal additions to the specified track.
*/
function getLegalMoves(trkMap: TrackMap, trk: Track,
	availableTemplates: string[] = stdTemps, ignoreCorrections: boolean): TrackAddition[] {
	const legalMoves = [];
	for (let i = 0; i < 2; i++) {
		for (let j = 0; j < 2; j++) {
			for (let k = 0; k < availableTemplates.length; k++) {
				const idx1 = <0 | 1>i;
				const idx2 = <0 | 1>j;
				const temp = getTrackTemplate(availableTemplates[k])!;
				if (TrackChecker.canAddTrackTo(trk, idx1, temp, idx2, trkMap, ignoreCorrections)) {
					legalMoves.push(<TrackAddition>{
						baseAttachIndex: idx1,
						newAttachIndex: idx2,
						newTrackTemplate: temp,
					});
				}
			}
		}
	}
	return legalMoves;
}
