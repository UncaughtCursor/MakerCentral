import React, { useContext, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SelectIcon from '@mui/icons-material/SelectAll';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import NumberInput from '@components/pages/controls/NumberInput';
import TrackEditorToolButton from './TrackEditorToolButton';
import EditorContext from '../../../EditorContext';

const buttonNames = ['Add Note', 'Remove Note', 'Select', 'Undo', 'Redo', 'Zoom In', 'Zoom Out'] as const;
export type EditorToolbarButtonName = typeof buttonNames[number];

const selectableButtonNames = ['Add Note', 'Remove Note', 'Select'] as const;
export type EditorToolName = typeof selectableButtonNames[number];

interface TrackEditorToolbarState {
	bpm: number,
}

/**
 * The toolbar for the track editor.
 * @param selectedToolButton The name of the currently selected tool button.
 * @param props.onToolChange The function to call when the tool is changed.
 */
function TrackEditorToolbar(props: {
	selectedToolButton: EditorToolName,
	onButtonClick: (toolName: EditorToolbarButtonName) => void
}) {
	const ctx = useContext(EditorContext);
	const buildInst = ctx.project.buildInstances[0];

	const [state, setState] = useState({
		bpm: buildInst.bpm,
	} as TrackEditorToolbarState);

	return (
		<>
			<div className="track-editor-button-group">
				<TrackEditorToolButton
					type="select"
					image={
						<AddIcon />
					}
					isSelected={props.selectedToolButton === 'Add Note'}
					onClick={() => { props.onButtonClick('Add Note'); }}
				/>
				<TrackEditorToolButton
					type="select"
					image={
						<RemoveIcon />
					}
					isSelected={props.selectedToolButton === 'Remove Note'}
					onClick={() => { props.onButtonClick('Remove Note'); }}
				/>
				{/* <TrackEditorToolButton
					type="select"
					image={
						<SelectIcon />
					}
					isSelected={props.selectedToolButton === 'Select'}
					onClick={() => { props.onButtonClick('Select'); }}
				/> */}
			</div>
			<div className="track-editor-button-group">
				<TrackEditorToolButton
					type="click"
					image={
						<UndoIcon />
					}
					isSelected={false}
					isDisabled={!buildInst.undoRedoManager.canUndo()}
					onClick={() => { props.onButtonClick('Undo'); }}
				/>
				<TrackEditorToolButton
					type="click"
					image={
						<RedoIcon />
					}
					isSelected={false}
					isDisabled={!buildInst.undoRedoManager.canRedo()}
					onClick={() => { props.onButtonClick('Redo'); }}
				/>
			</div>
			<div className="track-editor-button-group">
				<TrackEditorToolButton
					type="click"
					image={
						<ZoomInIcon />
					}
					isSelected={false}
					onClick={() => { props.onButtonClick('Zoom In'); }}
				/>
				<TrackEditorToolButton
					type="click"
					image={
						<ZoomOutIcon />
					}
					isSelected={false}
					onClick={() => { props.onButtonClick('Zoom Out'); }}
				/>
			</div>
			<NumberInput
				label="Tempo (BPM)"
				min={1}
				max={999}
				val={state.bpm}
				fieldWidthPx={120}
				onChange={(val: number | null) => {
					const bpm = Math.round(val!);
					buildInst.bpm = bpm;
					setState({
						...state,
						bpm,
					});
				}}
			/>
		</>
	);
}

export default TrackEditorToolbar;
