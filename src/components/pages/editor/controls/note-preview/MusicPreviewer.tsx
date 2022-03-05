import React, { useContext, useState } from 'react';
import { defaultPlaybackPPQ, LOAD_DELAY } from '@scripts/builder/playback/PlaybackConstants';
import * as AnimationController from '@scripts/builder/playback/AnimationController';
import { beatsToSeconds } from '@scripts/builder/playback/PlaybackUtil';
import { EntityData } from '@data/MakerConstants';
import PianoRoll, { PianoRollNoteGroup } from './PianoRoll';
import PlaybackControls from './PlaybackControls';
import EditorContext from '../../EditorContext';
import './MusicPreviewer.css';
import PianoRollLine from './PianoRollLine';
import PianoRollLineHz from './PianoRollLineHz';
import { NoteBounds } from '../note-task-controls/SongBoundaryChooser';

interface MusicPreviewerProps {
	noteGroups: PianoRollNoteGroup[],
	endBeat: number,
	noteBounds: NoteBounds,
	quartersPerMeasure?: number,
	focusedGroupIndex?: number,
	startBeat?: number,
	pitchBounds?: {
		min: number | null,
		max: number | null
	},
	onClick?: (evt: React.MouseEvent<HTMLElement>) => void,
	onHover?: (evt: React.MouseEvent<HTMLElement>) => void,
	onMouseOut?: (evt: React.MouseEvent<HTMLElement>) => void,
	toolbarAdditions?: React.ReactNode,
	children: React.ReactNode,
	gridTileLength?: number,
	gridTilesPerBeat?: number,
}

const defaultPreviewState = {
	playLinePos: 0,
	isLineVisible: false,
	isSoloPlayback: true,
};

/**
 * A component used for previewing music and viewing notes.
 * @param props.noteGroups The array of note groups to display.
 * @param props.minNote The lowest note number to display.
 * @param props.maxNote The highest note number to display.
 * @param props.quartersPerMeasure The number of quarter notes per measure.
 * @param props.focusedGroupIndex The index of the group to give full opacity to.
 * If -1, all notes will be given full opacity.
 * @param props.endBeat The beat number to stop playing from.
 * @param props.pitchBounds The minimum and maximum pitch bounds to display boundary lines for.
 * @param props.onClick The function to be called when the piano roll is clicked.
 * @param props.onHover The function to be called when the piano roll is hovered over.
 * @param props.onMouseOut The function to be called when the mouse exits the piano roll.
 * @param props.toolbarAdditions The elements to display in the toolbar.
 * @param props.gridTileLength The length of the grid tile in pixels.
 * @param props.gridTilesPerBeat The number of grid tiles to display per beat.
 * @param props.children The elements to display in the piano roll.
 */
function MusicPreviewer(props: MusicPreviewerProps) {
	const ctx = useContext(EditorContext);
	const [previewState, setPreviewState] = useState(defaultPreviewState);

	// Compute line height for the playback line.
	const usedMinNote = Math.floor(props.noteBounds.minPitch / 12) * 12;
	const usedMaxNote = Math.ceil((props.noteBounds.maxPitch + 1) / 12) * 12 - 1;
	const lineHeight = Math.max(((usedMaxNote - usedMinNote) * props.gridTileLength!) + 6, 382);

	const minPlaceY = (props.pitchBounds!.min !== null) ? pitchToY(props.pitchBounds!.min - 1) : -1;
	const maxPlaceY = (props.pitchBounds!.max !== null) ? pitchToY(props.pitchBounds!.max) : -1;

	return (
		<div className="music-previewer-container">
			<div className="music-previewer-toolbar">
				<PlaybackControls
					isPlaying={previewState.isLineVisible}
					onPlay={beginPlayback}
					onStop={stopPlayback}
					isSoloToggleVisible={props.focusedGroupIndex !== -1}
					onSoloToggle={(arg0: boolean) => { handleSoloToggle(arg0); }}
				/>
				{props.toolbarAdditions}
			</div>
			<PianoRoll
				noteGroups={props.noteGroups}
				noteBounds={props.noteBounds}
				quartersPerMeasure={props.quartersPerMeasure!}
				focusedGroupIndex={props.focusedGroupIndex}
				onClick={handleClick}
				onHover={props.onHover!}
				onMouseOut={props.onMouseOut!}
				gridTileLength={props.gridTileLength!}
				gridTilesPerBeat={props.gridTilesPerBeat!}
			>
				{props.children}
				<PianoRollLineHz color="#252" yPos={minPlaceY} isVisible={minPlaceY !== -1} />
				<PianoRollLineHz color="#252" yPos={maxPlaceY} isVisible={maxPlaceY !== -1} />
				<PianoRollLine color="lime" xPos={previewState.playLinePos} height={lineHeight} isVisible={previewState.isLineVisible} />
			</PianoRoll>
		</div>
	);

	/**
	 * Begins playing back the displayed notes.
	 * @param doTranspose Whether or not to transpose the instruments to correct for their octave.
	 */
	function beginPlayback(doTranspose: boolean) {
		ctx.noteSchedule.clear();
		ctx.noteSchedule.setEndTicks((props.endBeat - props.startBeat!) * defaultPlaybackPPQ);
		ctx.noteSchedule.setOnDone(() => {
			AnimationController.stopAnimation();
			resetPlaybackState();
		});
		const tempo = ctx.project.buildInstances[0].bpm;
		ctx.noteSchedule.setTempo(tempo);

		// Compute line step size for the playback line
		const scrollPxPerFrame = (tempo * props.gridTileLength! * props.gridTilesPerBeat!) / 3600;

		const durationSec = beatsToSeconds(props.endBeat - props.startBeat!, tempo);

		const isSoloEnforced = previewState.isSoloPlayback && props.focusedGroupIndex! !== -1;

		for (let i = 0; i < props.noteGroups.length; i++) {
			if (isSoloEnforced && i !== props.focusedGroupIndex!) continue;
			for (let j = 0; j < props.noteGroups[i].notes.length; j++) {
				const note = props.noteGroups[i].notes[j];
				const relativeBeat = note.beat - props.startBeat!;
				if (relativeBeat < 0) continue;

				const instrument = props.noteGroups[i].instrument;
				const pitch = doTranspose ? note.pitch - (12 * EntityData[instrument].octave) : note.pitch;
				ctx.noteSchedule.addNote(pitch, relativeBeat * defaultPlaybackPPQ, instrument);
			}
		}
		ctx.noteSchedule.stop();
		ctx.noteSchedule.play();

		AnimationController.startAnimation((frame: number) => {
			// Don't move the line until the load delay is reached.
			// FIXME: Desyncs with note schedule
			const animFrame = Math.min(Math.max(frame - (LOAD_DELAY * 60), 0), 60 * durationSec);
			const ofs = props.startBeat! * props.gridTilesPerBeat! * props.gridTileLength!;
			setPreviewState({
				playLinePos: (animFrame * scrollPxPerFrame) + ofs,
				isLineVisible: true,
				isSoloPlayback: previewState.isSoloPlayback,
			});
		});
	}

	/**
	 * Stops playback of the displayed notes.
	 */
	function stopPlayback() {
		ctx.noteSchedule.stop();
		AnimationController.stopAnimation();
		resetPlaybackState();
	}

	/**
	 * Changes whether or not only the focused track is played.
	 */
	function handleSoloToggle(isUnchecked: boolean) {
		stopPlayback();
		setPreviewState({
			playLinePos: previewState.playLinePos,
			isLineVisible: previewState.isLineVisible,
			isSoloPlayback: !isUnchecked,
		});
	}

	/**
	 * Resets the preview state after playback ends.
	 */
	function resetPlaybackState() {
		setPreviewState({
			playLinePos: 0,
			isLineVisible: false,
			isSoloPlayback: previewState.isSoloPlayback,
		});
	}

	/**
	 * Converts a MIDI note number to the corresponding y-coordinate on the piano roll.
	 * @param pitch The MIDI note number.
	 * @returns The corresponding y-coordinate on the piano roll.
	 */
	function pitchToY(pitch: number) {
		const noteRange = usedMaxNote - usedMinNote;
		return (noteRange - (pitch - props.noteBounds.minPitch)) * props.gridTileLength!;
	}

	/**
	 * Fires when the display is clicked.
	 * @param e The SyntheticEvent produced from the click.
	 */
	function handleClick(e: React.MouseEvent<HTMLElement, MouseEvent>) {
		const target = e.target as HTMLElement;
		const x = e.pageX - target.offsetLeft;
		const y = e.pageY - target.offsetTop;
		const inBounds = x < target.clientWidth && y < target.clientHeight;
		if (inBounds || target.className === 'piano-roll-note') props.onClick!(e);
	}
}

MusicPreviewer.defaultProps = {
	quartersPerMeasure: 4,
	focusedGroupIndex: -1,
	startBeat: 0,
	pitchBounds: {
		min: null,
		max: null,
	},
	onClick: () => {},
	onHover: () => {},
	onMouseOut: () => {},
	toolbarAdditions: <></>,
	gridTileLength: 8,
	gridTilesPerBeat: 4,
};

export default MusicPreviewer;
