import TriggerButton from '@components/pages/controls/TriggerButton';
import { KEY_C4 } from '@data/PlaybackConstants';
import React, { useContext, useEffect, useState } from 'react';
import NoteColors from '@data/NoteColors.json';
import { MidiInstruments } from '@data/MakerConstants';
import EditorContext from '../../EditorContext';
import MusicPreviewer from '../note-preview/MusicPreviewer';
import { PianoRollNoteGroup } from '../note-preview/PianoRoll';
import PianoRollLine from '../note-preview/PianoRollLine';

type SongBoundaryChooserPage = 'start' | 'end' | 'confirm';

interface SongBoundaryChooserState {
	startBound: number | null;
	endBound: number | null;
	page: SongBoundaryChooserPage;
	mouseX: number;
	mouseLineColor: string;
	noteGroups: PianoRollNoteGroup[];
}

export interface NoteBounds {
	minPitch: number;
	maxPitch: number;
	minBeat: number;
	maxBeat: number;
}

// TODO: Prop or something to allow these to be adjusted
const gridTileLength = 8;
const gridTilesPerBeat = 4;

/**
 * A tool used for choosing the boundaries of the music to use.
 */
function SongBoundaryChooser() {
	const ctx = useContext(EditorContext);
	const midi = ctx.project.projectMidis[0];
	const buildInstance = ctx.project.buildInstances[0];

	const defaultStartBound = getXFromBeat(buildInstance.selections[0].startBeat);
	const defaultEndBound = getXFromBeat(buildInstance.selections[0].endBeat);

	const defaultState: SongBoundaryChooserState = {
		startBound: defaultStartBound,
		endBound: defaultEndBound,
		page: getEarliestUnfinishedPage(defaultStartBound, defaultEndBound),
		mouseX: 0,
		mouseLineColor: 'rgba(255,255,255,0)',
		noteGroups: [],
	};

	const [state, setState] = useState(defaultState);

	useEffect(() => {
		const noteGroups = midi.tracks.map((track, i) => ({
			color: NoteColors[i % NoteColors.length],
			notes: track.notes.map((midiNote) => {
				const id = buildInstance.nextProjectNoteId;
				buildInstance.nextProjectNoteId++;
				return {
					beat: midiNote.beat,
					pitch: midiNote.pitch,
					id,
				};
			}),
			instrument: MidiInstruments[track.notes[0].instrument].mm2Instrument,
			optimizerMessages: {},
		}));
		setState({
			...state,
			noteGroups,
		});
	}, []);

	const bounds = determineNoteBounds(state.noteGroups);

	const usedMinNote = Math.floor(bounds.minPitch / 12) * 12;
	const usedMaxNote = Math.ceil((bounds.maxPitch + 1) / 12) * 12 - 1;
	const lineHeight = Math.max((usedMaxNote - usedMinNote) * gridTileLength + 6, 382);

	const mouseLine = (
		<PianoRollLine
			color={state.mouseLineColor}
			xPos={state.mouseX}
			height={lineHeight}
			isVisible
		/>
	);
	const startBoundLine = (
		<PianoRollLine
			color={state.startBound !== null ? 'rgba(135,206,235,1)' : 'rgba(255,255,255,0)'}
			xPos={state.startBound as number}
			height={lineHeight}
			isVisible
		/>
	);
	const endBoundLine = (
		<PianoRollLine
			color={state.endBound !== null ? 'rgba(250,181,127,1)' : 'rgba(255,255,255,0)'}
			xPos={state.endBound as number}
			height={lineHeight}
			isVisible
		/>
	);

	const doneButton = (
		<TriggerButton
			text={state.page !== 'confirm' ? 'Next' : 'Done'}
			type={state.page !== 'confirm' ? 'normal' : 'blue'}
			onClick={handleDoneButtonClick}
			key="done"
		/>
	);

	return (
		<div className="song-boundary-chooser">
			<MusicPreviewer
				noteGroups={state.noteGroups}
				noteBounds={bounds}
				quartersPerMeasure={midi.quartersPerMeasure}
				startBeat={state.startBound !== null ? getBeatFromX(state.startBound)! : 0}
				endBeat={state.endBound !== null ? getBeatFromX(state.endBound)! : midi.totalBeatDuration}
				onClick={(evt) => { handlePianoRollClick(evt); }}
				onHover={(evt) => { handlePianoRollHover(evt); }}
				onMouseOut={() => { handlePianoRollOut(); }}
			>
				{mouseLine}
				{startBoundLine}
				{endBoundLine}
			</MusicPreviewer>
			<p className="imperative-text">{getDisplayText()}</p>
			{getButtons()}
		</div>
	);

	/**
	 * Retrieves the list of available button controls.
	 */
	function getButtons(): React.ReactNode {
		const elements = [];
		switch (state.page) {
		case 'start': {
			if (state.startBound !== null) elements.push(doneButton);
			break;
		}
		case 'end': {
			if (state.endBound !== null) elements.push(doneButton);
			break;
		}
		case 'confirm': {
			elements.push(
				<TriggerButton
					text="Change Starting Bound"
					type="normal"
					onClick={() => { setPage('start'); }}
					key="Change Starting Bound"
				/>,
			);
			elements.push(
				<TriggerButton
					text="Change Ending Bound"
					type="normal"
					onClick={() => { setPage('end'); }}
					key="Change Ending Bound"
				/>,
			);
			elements.push(doneButton);
		}
		}
		return elements;
	}

	/**
	 * Returns the text to display depending on which page is selected.
	 * @param page The current page.
	 */
	function getDisplayText() {
		switch (state.page) {
		case 'start': {
			return 'Click where your music should begin.';
		}
		case 'end': {
			return 'Click where your music should end.';
		}
		case 'confirm': {
			return 'Review your selection.';
		}
		default: {
			return 'Error';
		}
		}
	}

	/**
	 * Changes the displayed page on the song boundary chooser.
	 * @param page The page to display.
	 */
	function setPage(page: SongBoundaryChooserPage) {
		setState({
			...state,
			page,
		});
	}

	/**
	 * Executes whenever the user clicks on the done button.
	 */
	function handleDoneButtonClick() {
		if (state.page === 'confirm') {
			ctx.func.setPage(ctx.currentPage + 1);
		}
		setPage(getEarliestUnfinishedPage(state.startBound, state.endBound));
	}

	/**
	 * Submits the current selection to be used in other pages.
	 */
	function submitSelection() {
		const buildInst = ctx.project.buildInstances[0];
		const selection = buildInst.selections[0];

		// Generate tracks to be used from the selection
		buildInst.baseTracks = ctx.project.createTracksFromSelection(selection, buildInst.buildMode);
		buildInst.tracks = [];

		buildInst.baseTracks.forEach((track) => {
			// Calculate best octave shift
			const avgNotePitch = track.notes.length > 0 ? track.notes.reduce((acc, note) => acc + note.pitch, 0) / track.notes.length : 0;
			const octaveShift = -Math.round((avgNotePitch - KEY_C4 - 12) / 12);

			// Shift each track into the best octave possible
			track.shiftToOctave(octaveShift);
		});
	}

	/**
	 * Executes whenever the mouse position changes over the piano roll.
	 * @param evt The mouse event.
	 */
	function handlePianoRollHover(evt: React.MouseEvent<HTMLElement>) {
		const x = getQuantizedX(getPianoRollX(evt));
		setState({
			...state,
			mouseX: x,
			mouseLineColor: isValidX(x) ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255,255,255,0)',
		});
	}

	/**
	 * Executes whenever the mouse clicks on the piano roll.
	 * @param evt The mouse event.
	 */
	function handlePianoRollClick(evt: React.MouseEvent<HTMLElement>) {
		const x = getQuantizedX(getPianoRollX(evt));
		if (!isValidX(x)) return;

		// Set new start and end bounds if updated.
		const newStartBound = state.page === 'start' ? x : state.startBound;
		const newEndBound = state.page === 'end' ? x : state.endBound;
		buildInstance.selections[0].startBeat = getBeatFromX(newStartBound);
		buildInstance.selections[0].endBeat = getBeatFromX(newEndBound);
		setState({
			...state,
			startBound: newStartBound,
			endBound: newEndBound,
			mouseX: x,
		});
		if (getEarliestUnfinishedPage(newStartBound, newEndBound) === 'confirm') {
			submitSelection();
		}
	}

	/**
	 * Executes whenever the mouse leaves the piano roll.
	 */
	function handlePianoRollOut() {
		setState({
			...state,
			mouseLineColor: 'rgba(255, 255, 255, 0)',
		});
	}

	/**
 	 * Returns the x-coordinate of a mouse event inside the piano roll.
 	 * @param evt The mouse event.
 	 */
	function getPianoRollX(evt: React.MouseEvent<HTMLElement>): number {
		const target = evt.target as HTMLElement;

		const rect = target.getBoundingClientRect();
		const nonScrollX = evt.clientX - rect.left;

		return nonScrollX + target.scrollLeft;
	}

	/**
	 * Returns if the given x-position can have a boundary placed.
	 * @param x The x-coordinate to check.
	 * @returns Whether or not the x-position can have a boundary placed.
	 */
	function isValidX(x: number): boolean {
		switch (state.page) {
		case 'start': {
			if (state.endBound !== null) return x < state.endBound!;
			return true;
		}
		case 'end': {
			return x > state.startBound!;
		}
		case 'confirm': {
			return false;
		}
		default: {
			return false;
		}
		}
	}
}

/**
 * Determines what the minimum and maximum notes of a set of
 * rendered note groups should be.
 * @param noteGroups The note groups to find the bounds of.
 */
export function determineNoteBounds(noteGroups: PianoRollNoteGroup[]): NoteBounds {
	let minNote = 127;
	let maxNote = 0;
	let minBeat = Infinity;
	let maxBeat = 0;
	for (let i = 0; i < noteGroups.length; i++) {
		for (let j = 0; j < noteGroups[i].notes.length; j++) {
			const thisNote = noteGroups[i].notes[j];
			minNote = Math.min(minNote, thisNote.pitch);
			maxNote = Math.max(maxNote, thisNote.pitch);
			minBeat = Math.min(minBeat, thisNote.beat);
			maxBeat = Math.max(maxBeat, thisNote.beat);
		}
	}
	return {
		minPitch: minNote,
		maxPitch: maxNote,
		minBeat,
		maxBeat,
	};
}

/**
 * Returns the nearest quantized x-position from the given x-coordinate.
 * @param x The x-coordinate to quantize.
 * @returns The quantized x-coordinate.
 */
function getQuantizedX(x: number) {
	return Math.max((Math.round(x / gridTileLength) - 1) * gridTileLength, 0);
}

/**
 * Returns the nearest quantized beat from the given x-coordinate.
 * @param x The x-coordinate to quantize.
 * @returns The beat number or null if x is null.
 */
function getBeatFromX(x: number | null) {
	if (x === null) return null;
	return Math.round(x / gridTileLength) / gridTilesPerBeat;
}

/**
 * Returns the displayed x-coordinate from the given beat number.
 * @param beat The number.
 * @returns The equivalent x-coordinate or null if the beat is null.
 */
function getXFromBeat(beat: number | null) {
	if (beat === null) return null;
	return beat * gridTileLength * gridTilesPerBeat;
}

/**
 * Given the completed boundary selections, return which page should jumped to.
 * @param startBound The starting boundary location.
 * @param endBound The ending boundary location.
 * @returns Which page to jump to.
 */
function getEarliestUnfinishedPage(
	startBound: number | null,
	endBound: number | null,
): SongBoundaryChooserPage {
	if (startBound === null) return 'start';
	if (endBound === null) return 'end';
	return 'confirm';
}

export default SongBoundaryChooser;
