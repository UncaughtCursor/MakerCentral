import ButtonSelect from '@components/pages/controls/ButtonSelect';
import SelectInput from '@components/pages/controls/SelectInput';
import { EntityData } from '@data/MakerConstants';
import { ScrollPreference, scrollPreferences, BuildMode } from '@scripts/builder/project/Project';
import ProjectTrack from '@scripts/builder/project/ProjectTrack';
import React, { useContext, useState } from 'react';
import ContinueButton from '../controls/ContinueButton';
import EditorContext from '../EditorContext';

interface ProjectConfigPageState {
	showContinue: boolean;
	buildMode: BuildMode;
}

/**
 * The page used for project configuration.
 */
function ProjectConfigPage() {
	const ctx = useContext(EditorContext);
	const buildInst = ctx.project.buildInstances[0];

	const [state, setState] = useState({
		showContinue: buildInst.buildMode !== 'unspecified',
		buildMode: buildInst.buildMode,
	} as ProjectConfigPageState);

	const generationModeButtonEntries = [
		{
			name: 'Traditional',
			caption: 'Music that plays once. Easier to make rich-sounding music, but restricted gameplay options.',
		},
		{
			name: 'Looping',
			caption: 'Music that repeats endlessly. More gameplay options, but harder to make rich-sounding music.',
		},
		// TODO: Enable this option through a user setting or something
		/* {
			name: 'Prototype',
			// eslint-disable-next-line max-len
			caption: 'Traditional music, but without the contraptions to make it work.
			Useful for building your own way.',
		}, */
	];

	let initSelectedIndex = -1;
	if (buildInst.buildMode === 'traditional') initSelectedIndex = 0;
	else if (buildInst.buildMode === 'looping') initSelectedIndex = 1;
	else if (buildInst.buildMode === 'prototype') initSelectedIndex = 2;

	return (
		<>
			<h1>Configure Your Project</h1>
			<div className="vertical-control-list">
				<ButtonSelect
					text="Select the type of music to generate."
					entries={generationModeButtonEntries}
					initSelectedIndex={initSelectedIndex}
					onChange={(modeIndex: number) => {
						switch (modeIndex) {
						case 0: {
							buildInst.buildMode = 'traditional';
							setState({
								...state,
								showContinue: true,
								buildMode: buildInst.buildMode,
							});
							break;
						}
						case 1: {
							buildInst.buildMode = 'looping';
							setState({
								...state,
								showContinue: true,
								buildMode: buildInst.buildMode,
							});
							break;
						}
						case 2: {
							buildInst.buildMode = 'prototype';
							setState({
								...state,
								showContinue: true,
								buildMode: buildInst.buildMode,
							});
							break;
						}
						}
						legalizeTracks();
					}}
				/>
				{/* <TileLengthChooser
					type="width"
					text="The music should be no wider than:"
					min={48}
					max={240}
					val={buildInst.maxWidth}
					onChange={(num: number) => { buildInst.maxWidth = num; }}
				/>
				<div
					className="vertical-control-list"
					style={state.buildMode === 'looping' ? {} : { display: 'none' }}
				>
					<TileLengthChooser
						type="height"
						text="The music should be no taller than:"
						min={10}
						max={27}
						val={buildInst.maxHeight}
						onChange={(num: number) => { buildInst.maxHeight = num; }}
					/>
				</div> */}
				<SelectInput
					label="Scroll in music with:"
					choices={scrollPreferences}
					initSelectedIndex={scrollPreferences.indexOf(buildInst.scrollPref)}
					onSelect={(_, val) => {
						buildInst.scrollPref = val as ScrollPreference;
					}}
				/>
				<div style={{ margin: '20px', marginTop: '-40px' }}>
					<p style={{ fontSize: '14px', margin: 0 }}>Autoscroll
						allows you to force the player to load your music correctly without contraptions.
					</p>
					<p style={{ fontSize: '14px', margin: 0 }}>Non-autoscroll methods allow the player to move freely
						after your music has scrolled in.
					</p>
				</div>
				<div style={state.showContinue ? {} : { display: 'none' }}>
					<ContinueButton />
					<br />
					<br />
				</div>
			</div>
		</>
	);

	/**
	 * Ensures that the current project tracks all use legal instruments for their build mode.
	 */
	function legalizeTracks() {
		const baseTrks = buildInst.baseTracks;
		const trks = buildInst.tracks;
		const buildMode = buildInst.buildMode;

		const legalizeTrack = (trk: ProjectTrack) => {
			// Change instrument type if not buildable in the current mode
			const insData = EntityData[trk.instrument];
			const isIllegalInstrument = (buildMode === 'traditional' && !insData.isTraditionalBuildable)
			|| (buildMode === 'looping' && !insData.isLoopingBuildable);
			// eslint-disable-next-line no-param-reassign
			if (isIllegalInstrument) trk.instrument = 'Goomba';
		};

		trks.forEach(legalizeTrack);
		baseTrks.forEach(legalizeTrack);
	}
}

export default ProjectConfigPage;
