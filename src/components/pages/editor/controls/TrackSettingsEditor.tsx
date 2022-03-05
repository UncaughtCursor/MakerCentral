/* eslint-disable no-param-reassign */
import NumberInput from '@components/pages/controls/NumberInput';
import TextField from '@components/pages/controls/TextField';
import TriggerButton from '@components/pages/controls/TriggerButton';
import { EntityData, EntityType } from '@data/MakerConstants';
import React, { useContext } from 'react';
import EditorContext from '../EditorContext';
import InstrumentPicker from './note-task-controls/instrument-picker/InstrumentPicker';

/**
 * The component used to edit track settings.
 * @param props The props:
 * * selectedTrackId: The id of the selected track.
 * * onChange: Fires whenever project data is modified.
 */
function TrackSettingsEditor(props: {
	selectedTrackId: number,
	onChange: (refreshSelectedTrkIdx?: boolean) => void,
}) {
	const ctx = useContext(EditorContext);
	const buildInst = ctx.project.buildInstances[0];
	const selectedTrack = buildInst.tracks[props.selectedTrackId];

	const availableInstruments = (Object.keys(EntityData) as EntityType[]).filter(
		(entityType) => {
			const entity = EntityData[entityType];
			if (buildInst.buildMode === 'traditional') {
				return entity.isTraditionalBuildable && !entity.isPercussion;
			}
			return entity.isLoopingBuildable && !entity.isPercussion;
		},
	);

	return (
		<div>
			<h4 className="track-list-title">Track Settings</h4>
			<div className="track-settings-editor">
				<TextField
					label="Track Name"
					value={selectedTrack.name}
					maxWidthPx={150}
					onChange={(name: string) => {
						selectedTrack.name = name.length > 0 ? name : 'Untitled Track';
						props.onChange();
					}}
				/>
				<InstrumentPicker
					selectedInstrument={selectedTrack.instrument}
					availableInstrumentTypes={availableInstruments}
					onChange={(newIns: EntityType) => {
						buildInst.tracks[props.selectedTrackId].instrument = newIns;
						props.onChange();
					}}
				/>
				<NumberInput
					label="Octave Shift"
					min={-10}
					max={10}
					val={selectedTrack.octaveShift}
					onChange={(val: number | null) => {
						const octaveShift = val!;
						buildInst.tracks[props.selectedTrackId].shiftToOctave(octaveShift);
						props.onChange();
					}}
				/>
				<div style={{ display: 'flex', justifyContent: 'center' }}>
					<TriggerButton
						text="Clone"
						type="dark"
						onClick={() => {
							const thisTrk = buildInst.tracks[props.selectedTrackId];
							const newTrk = thisTrk.getCopy();
							newTrk.name += ' Copy';
							buildInst.tracks.push(newTrk);
							props.onChange();
						}}
					/>
					<div
						style={{ display: buildInst.tracks.length > 1 ? '' : 'none' }}
					>
						<TriggerButton
							text="Delete"
							type="dark"
							onClick={() => {
								buildInst.tracks.splice(props.selectedTrackId, 1);
								props.onChange(true);
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TrackSettingsEditor;
