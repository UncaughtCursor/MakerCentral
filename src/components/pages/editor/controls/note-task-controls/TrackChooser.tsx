import React, { useContext, useState } from 'react';
import TriggerButton from '@components/pages/controls/TriggerButton';
import NoteColors from '@data/NoteColors.json';
import { LoopingNoteRange, TraditionalNoteRange } from '@data/MakerConstants';
import TrackList from '../track-list/TrackList';
import EditorContext from '../../EditorContext';
import MusicPreviewer from '../note-preview/MusicPreviewer';
import { PianoRollNoteGroup } from '../note-preview/PianoRoll';
import { determineNoteBounds } from './SongBoundaryChooser';

/**
 * A tool used for choosing which tracks to keep and which to remove.
 */
function TrackChooser(props: {onInputChange: (arg0: boolean) => void}) {
	const ctx = useContext(EditorContext);
	const buildInst = ctx.project.buildInstances[0];
	console.log(buildInst);

	const categoryEntries = getEntries();

	const [selected, setSelected] = useState({
		listId: 0,
		selectedIndex: 0,
	});

	const selectedTrackSet = selected.listId === 0 ? 'base' : 'project';

	const baseListSelectedIndex = selectedTrackSet === 'base' ? selected.selectedIndex : -1;
	const projectListSelectedIndex = selectedTrackSet === 'project' ? selected.selectedIndex : -1;

	const usedTracks = selectedTrackSet === 'base' ? buildInst.baseTracks : buildInst.tracks;

	const midi = ctx.project.projectMidis[0];

	const noteGroups = getNoteGroups();
	const bounds = determineNoteBounds(noteGroups);
	const endBeat = getEndBeat(noteGroups);

	const buttonText = selectedTrackSet === 'base' ? 'Add to Project' : 'Delete';

	return (
		<div>
			<MusicPreviewer
				noteGroups={noteGroups}
				noteBounds={bounds}
				quartersPerMeasure={midi.quartersPerMeasure}
				focusedGroupIndex={selected.selectedIndex}
				startBeat={0}
				endBeat={endBeat}
				pitchBounds={buildInst.buildMode === 'traditional'
					? TraditionalNoteRange : LoopingNoteRange}
				onClick={() => {}}
				onHover={() => {}}
				onMouseOut={() => {}}
			>{}
			</MusicPreviewer>
			<br />
			<TriggerButton type="normal" text={buttonText} onClick={handleButtonClick} />
			<div className="track-choice-list-container">
				<TrackList
					title="From MIDI"
					entries={categoryEntries.baseEntries}
					selectedIndex={baseListSelectedIndex}
					onEntryClick={(selectedIndex) => {
						setSelected({
							listId: 0,
							selectedIndex,
						});
					}}
				/>
				<TrackList
					title="Project Tracks"
					entries={categoryEntries.projectEntries}
					selectedIndex={projectListSelectedIndex}
					onEntryClick={(selectedIndex) => {
						setSelected({
							listId: 1,
							selectedIndex,
						});
					}}
				/>
			</div>
		</div>
	);

	/**
	 * Generates the list of tracks display.
	 */
	function getEntries(): {
		baseEntries: {name: string, id: number}[]
		projectEntries: {name: string, id: number}[]
		} {
		const baseEntries = buildInst.baseTracks.map((trk) => ({
			name: trk.name,
			id: trk.id,
		}));
		const projectEntries = buildInst.tracks.map((trk) => ({
			name: trk.name,
			id: trk.id,
		}));

		return { baseEntries, projectEntries };
	}

	/**
	 * Generates the note groups to be displayed on the piano roll.
	 * @returns The piano roll note groups.
	 */
	function getNoteGroups(): PianoRollNoteGroup[] {
		return usedTracks.map((projectTrack) => ({
			color: NoteColors[projectTrack.id % NoteColors.length],
			notes: projectTrack.notes,
			instrument: projectTrack.instrument,
			optimizerMessages: {},
		}));
	}

	/**
	 * Triggers when the button below the preview is clicked.
	 */
	function handleButtonClick() {
		switch (selectedTrackSet) {
		case 'base': { // Copy track to project
			const track = ctx.project.buildInstances[0].baseTracks[baseListSelectedIndex];
			buildInst.tracks.push(track.getCopy(buildInst.nextProjectNoteId));
			buildInst.nextProjectNoteId += track.notes.length;

			buildInst.undoRedoManager.clear();

			refreshSelf();
			break;
		}
		case 'project': { // Delete the selected track
			buildInst.tracks.splice(projectListSelectedIndex, 1);

			buildInst.undoRedoManager.clear();

			refreshSelf();
			break;
		}
		}
	}

	/**
	 * Forces the component to refresh.
	 */
	function refreshSelf() {
		setSelected({
			listId: selected.listId,
			selectedIndex: selected.selectedIndex,
		});
		props.onInputChange(ctx.project.buildInstances[0].tracks.length > 0);
	}
}

/**
 * Gets the last beat of a set of note groups.
 */
export function getEndBeat(groups: PianoRollNoteGroup[]) {
	return groups.reduce((curMaxBeat, group) => Math.max(curMaxBeat, group.notes.reduce((curNoteMaxBeat, note) => Math.max(curNoteMaxBeat, note.beat), 0)), 0);
}

export default TrackChooser;
