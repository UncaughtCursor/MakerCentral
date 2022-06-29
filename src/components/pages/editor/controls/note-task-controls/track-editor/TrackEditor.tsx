import React, { useContext, useState } from 'react';
import { Coordinates2d, scaleCoords } from '@scripts/builder/util/Coordinates2d';
import { ProjectNoteEntity } from '@scripts/builder/project/NoteGridConverter';
import { EditorAction } from '@scripts/builder/project/UndoRedoManager';
import NoteColors from '@data/NoteColors.json';
import { previewInstrument } from '@scripts/builder/playback/MusicPlayer';
import assert from 'assert';
import { LevelBuildCheckResult, LoopingBuildChecks, TraditionalBuildChecks } from '@scripts/builder/optimization/LevelBuildChecks';
import { LoopingNoteRange, TraditionalNoteRange } from '@data/MakerConstants';
import { OptimizerMessage } from '@scripts/builder/optimization/looping/DeltaOptimizer';
import TrackList from '../../track-list/TrackList';
import EditorContext from '../../../EditorContext';
import MusicPreviewer from '../../note-preview/MusicPreviewer';
import { PianoRollNoteGroup } from '../../note-preview/PianoRoll';
import { determineNoteBounds } from '../SongBoundaryChooser';
import { getEndBeat } from '../TrackChooser';
import TrackEditorToolbar, { EditorToolbarButtonName, EditorToolName } from './TrackEditorToolbar';
import ContinueButton from '../../ContinueButton';
import TrackSettingsEditor from '../../TrackSettingsEditor';
import BuildChecker from './BuildChecker';

interface TrackEditorState {
	selectedTrkId: number,
	cursorPos: Coordinates2d,
	isCursorVisible: boolean,
	selectedToolbarButton: EditorToolName,
	gridTileLength: number,
}

const defaultState: TrackEditorState = {
	selectedTrkId: 0,
	cursorPos: { x: -1, y: -1 },
	isCursorVisible: false,
	selectedToolbarButton: 'Add Note',
	gridTileLength: 8,
};

/**
 * The editor used to edit music tracks.
 */
function TrackEditor() {
	// TODO: Button to trigger optimization
	// TODO: Only refresh noteGroups when necessary

	const ctx = useContext(EditorContext);
	const midi = ctx.project.projectMidis[0];
	const buildInst = ctx.project.buildInstances[0];

	const [state, setState] = useState(defaultState);
	const [hasMouseDown, setHasMouseDown] = useState(false);

	const noteGroups = getNoteGroups();
	const gridTilesPerBeat = 4; // Math.max(getQuantizationLevel(), 4);
	const bounds = determineNoteBounds(noteGroups);
	const endBeat = getEndBeat(noteGroups);

	const settings = {
		minNote: bounds.minPitch,
		maxNote: bounds.maxPitch,
		gridTilesPerBeat,
	};
	ctx.func.genNoteGrids();

	const projectTrackEntries = buildInst.tracks.map((trk) => ({
		name: trk.name,
		id: trk.id,
	}));

	const buildChecks = buildInst.buildMode === 'traditional'
		? TraditionalBuildChecks : LoopingBuildChecks;
	const checkResults = getBuildCheckResults();
	const passed = checkResults.reduce((acc, result) => acc && result.passed, true);

	return (
		<div className="track-editor-container">
			<MusicPreviewer
				noteGroups={noteGroups}
				noteBounds={bounds}
				quartersPerMeasure={midi.quartersPerMeasure}
				focusedGroupIndex={state.selectedTrkId}
				endBeat={endBeat}
				onHover={(evt) => { handleMouseMove(evt); }}
				onClick={(evt) => { handleMouseInteraction(evt); }}
				onMouseOut={() => { handleMouseExit(); }}
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				toolbarAdditions={(
					<TrackEditorToolbar
						selectedToolButton={state.selectedToolbarButton}
						onButtonClick={(buttonName: EditorToolbarButtonName) => {
							handleToolbarButtonClick(buttonName);
						}}
					/>
				)}
				pitchBounds={buildInst.buildMode === 'traditional'
					? TraditionalNoteRange : LoopingNoteRange}
				gridTileLength={state.gridTileLength}
				gridTilesPerBeat={gridTilesPerBeat}
			>
				<div
					className={`track-editor-cursor${state.isCursorVisible ? ' visible' : ''}`}
					style={{
						left: `${state.cursorPos.x}px`,
						top: `${state.cursorPos.y}px`,
						width: `${state.gridTileLength}px`,
						height: `${state.gridTileLength}px`,
					}}
				/>
			</MusicPreviewer>
			<div className="track-editor-lower-container">
				<TrackList
					title="Project Tracks"
					entries={projectTrackEntries}
					selectedIndex={state.selectedTrkId}
					onEntryClick={(trkId) => {
						setState({
							...state,
							selectedTrkId: trkId,
						});
					}}
				/>
				<TrackSettingsEditor
					selectedTrackId={state.selectedTrkId}
					onChange={(refreshSelectedTrkIdx: boolean = false) => {
						if (refreshSelectedTrkIdx) {
							// Keep selected track index in bounds if there are deletions
							setState({
								...state,
								selectedTrkId: Math.min(
									state.selectedTrkId,
									buildInst.tracks.length - 1,
								),
							});
						} else setState({ ...state });
					}}
				/>
				<BuildChecker
					checks={buildChecks}
					results={checkResults}
					passed={passed}
				/>
			</div>
			<p
				style={{
					visibility: `${!passed ? 'visible' : 'hidden'}`,
					color: 'salmon',
				}}
			>You have unmet requirements. Make adjustments to proceed.
			</p>
			<div style={{ visibility: `${passed ? 'visible' : 'hidden'}` }}>
				<br />
				<ContinueButton />
			</div>
			<br />
			<br />
		</div>
	);

	/**
	 * Generates the note groups to be displayed on the piano roll.
	 * @returns The piano roll note groups.
	 */
	function getNoteGroups(): PianoRollNoteGroup[] {
		const optimizerMessages: {[key: number]: OptimizerMessage} = {};
		if (buildInst.optResult !== null) {
			for (let i = 0; i < buildInst.optResult.messages.length; i++) {
				const msg = buildInst.optResult.messages[i];
				if (msg.targetId === null) continue;
				optimizerMessages[msg.targetId] = msg;
			}
		}

		return buildInst.tracks.map((projectTrack) => ({
			color: NoteColors[projectTrack.id % NoteColors.length],
			notes: projectTrack.notes.sort((a, b) => a.beat - b.beat),
			instrument: projectTrack.instrument,
			optimizerMessages,
		}));
	}

	/**
	 * Triggers whenever the mouse moves in the editor area.
	 * @param evt The resulting mouse event.
	 */
	function handleMouseMove(evt: React.MouseEvent<HTMLElement>) {
		const target = evt.target as HTMLElement;
		const coords = (target.className === 'note-display-area')
			? getQuantizedCoords(getPianoRollCoords(evt))
			: { x: -100, y: -100 };
		if (hasMouseDown && state.selectedToolbarButton !== 'Add Note') handleMouseInteraction(evt);
		setState({
			...state,
			cursorPos: coords,
			isCursorVisible: true,
		});
	}

	// TODO: Grid tiles per beat controls

	// TODO: Make selections work

	// TODO: Groups of actions to undo and redo at once

	// TODO: Support drag-clicking tools to repeatedly use them and create action groups

	// TODO: Adding tracks

	/**
	 * Handles when the mouse button is pressed.
	 * @param evt The SyntheticEvent from the mouse event.
	 */
	function handleMouseDown(evt: React.SyntheticEvent) {
		setHasMouseDown(true);
		if (state.selectedToolbarButton !== 'Add Note') handleMouseInteraction(evt);
	}

	/**
	 * Handles when the mouse button is released.
	 */
	function handleMouseUp() {
		setHasMouseDown(false);
	}

	/**
	 * Triggers whenever the mouse triggers a tool in the editor area.
	 * @param evt The resulting mouse event.
	 */
	function handleMouseInteraction(evt: React.SyntheticEvent) {
		const target = evt.target as HTMLElement;

		let beat;
		let pitch;

		if (target.className === 'note-display-area') {
			const coords = state.cursorPos;
			const gridCoords = scaleCoords(coords, 1 / state.gridTileLength);

			const usedMinNote = Math.floor(settings.minNote! / 12) * 12;
			const usedMaxNote = Math.ceil((settings.maxNote! + 1) / 12) * 12 - 1;
			const noteRange = usedMaxNote - usedMinNote;

			beat = gridCoords.x / gridTilesPerBeat;
			pitch = noteRange + settings.minNote - gridCoords.y;
		} else if (target.className === 'piano-roll-note') {
			const nameArr = target.id.split('-');
			assert(nameArr[0] === 'note');
			beat = parseFloat(nameArr[1]);
			pitch = parseInt(nameArr[2], 10);
		}

		let data;

		switch (state.selectedToolbarButton) {
		case 'Add Note': {
			data = {
				beat,
				pitch,
				trkId: state.selectedTrkId,
			};
			break;
		}
		case 'Remove Note': {
			data = {
				beat,
				pitch,
				trkId: state.selectedTrkId,
			};
		}
		}

		const action = {
			tool: state.selectedToolbarButton,
			data,
		};

		const success = doAction(action);
		if (success) buildInst.undoRedoManager.do(action);
	}

	// FIXME: Cloning a track, erasing notes on it, then undoing the erasure does not make
	// The notes play again in the full playback mode

	/**
	 * Executes an EditorAction.
	 * @param action The action to be executed.
	 * @returns Whether or not the operation was successful.
	 */
	function doAction(action: EditorAction): boolean {
		const { tool, data } = action;

		let success = false;

		switch (tool) {
		case 'Add Note': {
			success = addNoteAtBeatAndPitch(data.beat, data.pitch, data.trkId);
			if (success) {
				previewInstrument(
					buildInst.tracks[state.selectedTrkId].instrument,
					ctx.noteSchedule!,

					data.pitch,
				);
			}
			refreshTrack(data.trkId);
			break;
		}
		case 'Remove Note': {
			success = removeNoteAtBeatAndPitch(data.beat, data.pitch, data.trkId);
			refreshTrack(data.trkId);
			break;
		}
		}

		return success;
	}

	/**
	 * Undoes an EditorAction.
	 * @param action The action to be executed.
	 * @returns Whether or not the operation was successful.
	 */
	function undoAction(action: EditorAction): boolean {
		const { tool, data } = action;

		let success = false;

		switch (tool) {
		case 'Add Note': {
			success = removeNoteAtBeatAndPitch(data.beat, data.pitch, data.trkId);
			refreshTrack(data.trkId);
			break;
		}
		case 'Remove Note': {
			success = addNoteAtBeatAndPitch(data.beat, data.pitch, data.trkId);
			refreshTrack(data.trkId);
			break;
		}
		}

		return success;
	}

	/**
	 * Triggers whenever the mouse exits the editor area.
	 */
	function handleMouseExit() {
		setState({
			...state,
			isCursorVisible: false,
		});
	}

	/**
	 * Triggers whenever a button in the editor toolbar is clicked.
	 * @param name The name of the button.
	 */
	function handleToolbarButtonClick(name: EditorToolbarButtonName) {
		if (name === 'Add Note' || name === 'Remove Note' || name === 'Select') {
			setState({
				...state,
				selectedToolbarButton: name as EditorToolName,
			});
		}

		switch (name) {
		case 'Undo': {
			const action = buildInst.undoRedoManager.undo();
			const success = undoAction(action);
			if (!success) buildInst.undoRedoManager.redo();
			break;
		}
		case 'Redo': {
			const action = buildInst.undoRedoManager.redo();
			const success = doAction(action);
			if (!success) buildInst.undoRedoManager.undo();
			break;
		}
		case 'Zoom In': {
			setState({
				...state,
				gridTileLength: state.gridTileLength * 1.25,
			});
			break;
		}
		case 'Zoom Out': {
			setState({
				...state,
				gridTileLength: state.gridTileLength / 1.25,
			});
			break;
		}
		}
	}

	/**
	 * Adds a note at the specified beat, pitch, and track ID.
	 * @param beat The beat to add a note at.
	 * @param pitch The pitch to add a note at.
	 * @param trkId The ID of the track where the note should be added.
	 * If omitted, the currently selected track will be used.
	 * @returns Whether ot not the operation was successful.
	 */
	function addNoteAtBeatAndPitch(beat: number, pitch: number, trkId: number): boolean {
		const isNotePresent: boolean = buildInst.noteGrids[trkId].isTileOccupied({ x: beat, y: pitch });
		// const isInPitchRange = pitch >= minBuildablePitch && pitch <= maxBuildablePitch;

		if (!isNotePresent /* && isInPitchRange */) {
			const noteEntity: ProjectNoteEntity = {
				pitch,
				beat,
				occupiedTiles: [{ x: beat, y: pitch }],
				id: buildInst.nextProjectNoteId,
			};
			buildInst.nextProjectNoteId++;
			buildInst.noteGrids[trkId].addEntity(noteEntity);
		}

		return !isNotePresent;
	}

	/**
	 * Deletes a note at the specified beat, pitch, and track ID.
	 * @param beat The beat to delete a note at.
	 * @param pitch The pitch to delete a note at.
	 * @param trkId The ID of the track where the note should be deleted.
	 * If omitted, the currently selected track will be used.
	 * @returns Whether ot not the operation was successful.
	 */
	function removeNoteAtBeatAndPitch(beat: number, pitch: number, trkId: number): boolean {
	/* FIXME: Need a permanent store of tracks with true IDs and a mapping to them;
		indices will become outdated with track operations */

		const isNotePresent: boolean = buildInst.noteGrids[trkId].isTileOccupied({ x: beat, y: pitch });
		if (isNotePresent) {
			buildInst.noteGrids[trkId].deleteEntityAtCoords({ x: beat, y: pitch });
		}

		return isNotePresent;
	}

	/**
	 * Refreshes a track's list of notes with changes from its grid.
	 * @param trkId The ID of the track to refresh.
	 * If omitted, the currently selected track will be used.
	 */
	function refreshTrack(trkId: number = state.selectedTrkId) {
		const trk = buildInst.tracks[trkId];
		trk.notes = buildInst.noteGrids[trkId].entityList;
		refreshSelf();
	}

	/**
 	 * Returns the x-coordinate of a mouse event inside the piano roll.
 	 * @param evt The mouse event.
 	 */
	function getPianoRollCoords(evt: React.MouseEvent<HTMLElement>): Coordinates2d {
		const target = evt.target as HTMLElement;
		const rect = target.getBoundingClientRect();

		const nonScrollX = evt.clientX - rect.left;
		const nonScrollY = evt.clientY - rect.top;

		return { x: nonScrollX + target.scrollLeft, y: nonScrollY + target.scrollTop };
	}

	/**
	 * Returns the nearest quantized x-position from the given x-coordinate.
	 * @param coords The coordinates to quantize.
	 * @returns The quantized coordinates.
	 */
	function getQuantizedCoords(coords: Coordinates2d): Coordinates2d {
		const x = (Math.round((coords.x) / state.gridTileLength) - 1) * state.gridTileLength;
		const y = (Math.round((coords.y) / state.gridTileLength) - 1) * state.gridTileLength;
		return { x, y };
	}

	/**
	 * Forces the component to refresh.
	 */
	function refreshSelf() {
		setState({ ...state });
	}

	/**
	 * Executes and returns the results of the build checks.
	 * @returns The results.
	 */
	function getBuildCheckResults() {
		const results: LevelBuildCheckResult[] = buildChecks.map((check) => check.fn(buildInst));
		return results;
	}
}

export default TrackEditor;
