/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { EntityType } from '@data/MakerConstants';
import { ProjectNote } from '@scripts/builder/project/Project';
import React from 'react';
import { NoteBounds } from '../note-task-controls/SongBoundaryChooser';
import Piano from './Piano';
import PianoRollNotes from './PianoRollNotes';

// FIXME: Grid offset and scale css

export interface PianoRollNoteGroup {
	color: string,
	notes: ProjectNote[],
	instrument: EntityType,
}

/**
 * The display for showing a series of notes
 * @param props.width The width of the piano roll.
 * @param props.height The height of the piano roll.
 * @param props.noteGroups The array of note groups to display.
 * @param props.noteBounds The NoteBounds for the notes to display.
 * @param props.quartersPerMeasure The number of quarter notes per measure.
 * @param props.focusedGroupIndex The index of the group to give full opacity to.
 * If -1, all notes will be given full opacity.
 * @param props.onClick The function to be called when the roll is clicked.
 * @param props.onHover The function to be called when the roll is hovered over.
 * @param gridTileLength The length of a grid tile in pixels.
 * @param gridTilesPerBeat The number of grid tiles for each beat to take up.
 * @param props.children The children elements to display.
 */
function PianoRoll(props: {
	noteGroups: PianoRollNoteGroup[], noteBounds: NoteBounds, quartersPerMeasure?: number,
	focusedGroupIndex?: number, gridTileLength?: number,
	gridTilesPerBeat?: number, children: React.ReactNode,
	onClick?: (evt: React.MouseEvent<HTMLElement>) => void,
	onHover?: (evt: React.MouseEvent<HTMLElement>) => void,
	onMouseOut?: (evt: React.MouseEvent<HTMLElement>) => void,
	onMouseDown?: (evt: React.MouseEvent<HTMLElement>) => void,
	onMouseUp?: (evt: React.MouseEvent<HTMLElement>) => void,
}) {
	const noteDiv = (
		<PianoRollNotes
			noteGroups={props.noteGroups}
			minNote={props.noteBounds.minPitch}
			maxNote={props.noteBounds.maxPitch}
			focusedGroupIndex={props.focusedGroupIndex!}
			gridTileLength={props.gridTileLength!}
			gridTilesPerBeat={props.gridTilesPerBeat!}
		/>
	);

	const octaveLineOffset = props.noteBounds.minPitch
	- Math.floor(props.noteBounds.minPitch / 12) * 12;

	const maxOctave = Math.floor(props.noteBounds.maxPitch / 12);
	const totalNotes = (12 * (maxOctave + 1)) - props.noteBounds.minPitch + octaveLineOffset;

	const heightPx = Math.max(totalNotes * props.gridTileLength!, 200);

	const noteSurface = createNoteSurface(
		props.quartersPerMeasure!,
		props.children,
		props.onMouseDown!,
		(evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
			props.onClick!(evt);
			props.onMouseUp!(evt);
		},
		props.onHover!,
		props.onMouseOut!,
	);

	return (
		<div
			className="piano-roll-container"
		>
			<Piano
				noteHeightPx={props.gridTileLength!}
				topOctaveNumber={maxOctave}
				minNote={props.noteBounds.minPitch}
				semitoneOffset={octaveLineOffset - 12}
				heightPx={heightPx + (2 * props.gridTileLength!) + 4}
			/>
			{noteSurface}
		</div>
	);

	/**
	 * Renders the background of the note display.
	 * @param quartersPerMeasure The number of quarter notes per measure.
	 * @param children The children elements to display.
	 * @param onMouseDown The function to be called when the roll is clicked down.
	 * @param onMouseUp The function to be called when the roll is done being clicked.
	 * @param onHover The function to be called when the roll is moused over.
	 * @param onMouseOut The function to be called when the mouse is moved out of the roll.
	 * @returns The created div element.
	 */
	function createNoteSurface(
		quartersPerMeasure: number,
		children: React.ReactNode,
		onMouseDown: (evt: React.MouseEvent<HTMLElement>) => void,
		onMouseUp: (evt: React.MouseEvent<HTMLElement>) => void,
		onHover: (evt: React.MouseEvent<HTMLElement>) => void,
		onMouseOut: (evt: React.MouseEvent<HTMLElement>) => void,
	) {
		const octaveHeight = props.gridTileLength! * 12;
		const measureWidth = props.gridTileLength! * quartersPerMeasure * props.gridTilesPerBeat!;
		return (
			<div style={{ display: 'flex', flexGrow: 1 }}>
				<div
					role="form"
					onMouseDown={(e) => { onMouseDown(e); }}
					onMouseUp={(e) => { onMouseUp(e); }}
					onMouseMove={(e) => { onHover(e); }}
					onMouseLeave={(e) => { onMouseOut(e); }}
					className="note-display-area"
					style={{
						backgroundSize: `${measureWidth}px ${measureWidth}px, ${octaveHeight}px ${octaveHeight}px, ${props.gridTileLength!}px ${props.gridTileLength!}px, ${props.gridTileLength!}px ${props.gridTileLength!}px`,
						backgroundPositionY: `${props.gridTileLength! * octaveLineOffset - 1}px`,
						height: `${heightPx}px`,
						width: `${props.noteBounds.maxBeat * props.gridTileLength! * props.gridTilesPerBeat!}px`,
					}}
				>
					<div>
						{children}
					</div>
					<div>
						{noteDiv}
					</div>

				</div>
			</div>
		);
	}
}

PianoRoll.defaultProps = {
	quartersPerMeasure: 4,
	focusedGroupIndex: -1,
	gridTileLength: 8,
	gridTilesPerBeat: 4,
	onClick: () => {},
	onHover: () => {},
	onMouseOut: () => {},
	onMouseDown: () => {},
	onMouseUp: () => {},
};

/**
 * Converts vh CSS units to pixels.
 * @param numVh The number of vh units.
 * @returns The value in pixels.
 */
function vh(numVh: number): number {
	// eslint-disable-next-line no-restricted-globals
	const screenHeight = screen.height;
	return numVh * (screenHeight / 100);
}

export default PianoRoll;
