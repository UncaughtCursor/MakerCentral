import { EntityData, LoopingNoteRange, TraditionalNoteRange } from '@data/MakerConstants';
import { BuildInstance } from '../project/Project';

export interface LevelBuildCheck {
	label: string,
	fn: (arg0: BuildInstance) => { passed: boolean, note: string },
}

export interface LevelBuildCheckResult {
	passed: boolean,
	note: string,
}

export const TraditionalBuildChecks = [
	{
		label: 'Notes are within vertical range',
		fn: notesInRange,
	},
	{
		label: 'At most 100 objects/enemies and 100 powerups',
		fn: entityCountsInLimits,
	},
] as LevelBuildCheck[];

export const LoopingBuildChecks = [
	{
		label: 'Notes are within vertical range',
		fn: notesInRange,
	},
	{
		label: 'At most 100 objects/enemies and 100 powerups',
		fn: entityCountsInLimits,
	},
	{
		label: 'At most 2 tracks',
		fn: (buildInst: BuildInstance) => ({
			passed: buildInst.tracks.length <= 2,
			note: `${buildInst.tracks.length > 2
				? `${buildInst.tracks.length - 2} tracks too many` : ''}`,
		}),
	},
] as LevelBuildCheck[];

/**
 * Checks to see that the project's current track notes are in buildable range.
 * @param buildInst The BuildInstance to check.
 * @returns The result. Check passed if all notes are in vertical range.
 */
function notesInRange(buildInst: BuildInstance): LevelBuildCheckResult {
	const pitchRange = buildInst.buildMode === 'traditional'
		? TraditionalNoteRange : LoopingNoteRange;

	let numFails = 0;
	for (let i = 0; i < buildInst.tracks.length; i++) {
		for (let j = 0; j < buildInst.tracks[i].notes.length; j++) {
			const note = buildInst.tracks[i].notes[j];
			if (note.pitch > pitchRange.max || note.pitch < pitchRange.min) {
				numFails++;
			}
		}
	}

	return {
		passed: numFails === 0,
		note: `${numFails > 0 ? `${numFails} notes out of range` : ''}`,
	};
}

/**
 * Verifies that the entities counts are in normal limits.
 * @param buildInst The BuildInstance to process.
 * @returns A passing check if the entity counts are within their limits.
 */
function entityCountsInLimits(buildInst: BuildInstance): LevelBuildCheckResult {
	let numGeneralEntities = 0;
	let numPowerups = 0;
	for (let i = 0; i < buildInst.tracks.length; i++) {
		const track = buildInst.tracks[i];
		const numEntities = track.notes.length;
		if (EntityData[track.instrument].isPowerup && buildInst.buildMode === 'traditional') {
			numPowerups += numEntities;
		} else {
			// Counts general entities or note blocks in looping music
			numGeneralEntities += numEntities;
		}
		if (buildInst.buildMode === 'looping') {
			// Count the entity used to play loop as well as the Boo used for boss stack
			numGeneralEntities++;
			if (!EntityData[track.instrument].isPowerup) numGeneralEntities++;
			else numPowerups++;
		}
	}

	const passed = numGeneralEntities <= 100 && numPowerups <= 100;

	return {
		passed,
		note: `Have ${numGeneralEntities} objects/enemies, ${numPowerups} powerups`,
	};
}
