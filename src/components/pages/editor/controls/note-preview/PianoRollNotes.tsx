import Color from 'color';
import React from 'react';
import { PianoRollNoteGroup } from './PianoRoll';

/**
 * Retrieves all of the div elements representing the notes.
 * @param noteGroups The array of note groups to display.
 * @param minNote The lowest note number to display.
 * @param maxNote The highest note number to display.
 * @param focusedGroupIndex The index of the focused note group.
 * @param gridTileLength The length of a grid tile in pixels.
 * @param gridTilesPerBeat The number of grid tiles to display per beat.
 * @returns The created div elements.
 */
const PianoRollNotes = React.memo((props: {
	noteGroups: PianoRollNoteGroup[], minNote: number, maxNote: number,
	focusedGroupIndex: number, gridTileLength: number, gridTilesPerBeat: number,
}) => {
	// Stretch to octave bounds
	const usedMinNote = Math.floor(props.minNote! / 12) * 12;
	const usedMaxNote = Math.ceil((props.maxNote! + 1) / 12) * 12 - 1;

	const noteRange = usedMaxNote - usedMinNote;

	const noteDivs = [];

	for (let i = 0; i < props.noteGroups.length; i++) {
		const noteGroup = props.noteGroups[i];
		const isFocused = (i === props.focusedGroupIndex || props.focusedGroupIndex === -1);
		for (let j = 0; j < noteGroup.notes.length; j++) {
			const note = noteGroup.notes[j];

			const hasMessage = noteGroup.optimizerMessages[note.id] !== undefined;

			const x = note.beat * props.gridTilesPerBeat! * props.gridTileLength;
			const y = (noteRange - (note.pitch - props.minNote)) * props.gridTileLength;

			const baseColor = new Color(noteGroup.color);
			const fillColor = isFocused ? baseColor.string() : baseColor.fade(0.8).string();
			const borderColor = new Color(fillColor).darken(0.3).string();

			// Can't push for some reason
			noteDivs[noteDivs.length] = (
				<div
					className="piano-roll-note"
					id={`note-${note.beat}-${note.pitch}`}
					style={{
						top: `${y - 1}px`,
						left: `${x - 1}px`,
						width: `${props.gridTileLength}px`,
						height: `${props.gridTileLength}px`,
						backgroundColor: !hasMessage ? fillColor : 'red',
						borderColor,
						animation: !hasMessage ? '' : 'error-flash 2s infinite',
					}}
					key={`${i}-${j}`}
				/>
			);
		}
	}

	return (
		<div>{noteDivs}</div>
	);
});

export default PianoRollNotes;
