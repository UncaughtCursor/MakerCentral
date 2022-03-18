import TriggerButton from '@components/pages/controls/TriggerButton';
import { TrackOptimizerTarget } from '@scripts/builder/optimization/looping/DeltaOptimizer';
import createSubloops, { Subloop } from '@scripts/builder/project/LoopSplitter';
import * as DeltaOptimizer from '@scripts/builder/optimization/looping/DeltaOptimizer';
import { KEY_C4 } from '@scripts/builder/playback/PlaybackConstants';
import React, { useState, useContext } from 'react';
import { TraditionalOptimizerTarget } from '@scripts/builder/optimization/traditional/AlphaOptimizer';
import * as AlphaOptimizer from '@scripts/builder/optimization/traditional/AlphaOptimizer';
import { entityTypeToId } from '@scripts/builder/optimization/traditional/util';
import { beatsToSeconds } from '@scripts/builder/playback/PlaybackUtil';
import { MM2ScrollMethod, MM2ScrollMethods } from '@data/MakerConstants';
import EditorContext from '../EditorContext';
import ContinueButton from '../controls/ContinueButton';

interface BuildSettingsPageState {
    buildStatus: 'unbuilt' | 'succeeded' | 'failed';
}

const defaultState: BuildSettingsPageState = {
	buildStatus: 'unbuilt',
};

/**
 * The page that displays optimizer build settings.
 */
function BuildSettingsPage() {
	const ctx = useContext(EditorContext);
	const [state, setState] = useState(defaultState);
	const buildInst = ctx.project.buildInstances[0];
	return (
		<>
			<h1>Build Music</h1>
			<div style={{ display: state.buildStatus === 'unbuilt' ? '' : 'none' }}>
				<TriggerButton
					type="blue"
					text="Generate"
					onClick={() => {
						submitForOptimization().then(() => {
							if (buildInst.optResult!.succeeded) {
								setState({
									...state,
									buildStatus: 'succeeded',
								});
							} else {
								setState({
									...state,
									buildStatus: 'failed',
								});
							}
						});
					}}
				/>
			</div>
			{getBuildStatusInfo()}
			<div style={{ display: state.buildStatus === 'succeeded' ? '' : 'none' }}>
				<ContinueButton />
			</div>
			<br />
			<br />
		</>
	);

	/**
	 * Returns the elements used to display the music build status.
	 */
	function getBuildStatusInfo() {
		if (state.buildStatus === 'unbuilt') {
			return <></>;
		}
		if (buildInst.optResult!.succeeded) {
			return (
				<p>Build succeeded!</p>
			);
		}

		const listElements = buildInst.optResult!.messages.map((msg) => <p>{msg.text}</p>);

		return (
			<>
				<p>Build failed. See messages below:</p>
				<br />
				<div>
					{listElements}
				</div>
				<br />
				<p>Edit your music accordingly and try again.</p>
			</>
		);
	}

	/**
	 * Sends the project tracks to be optimized and built.
	 */
	async function submitForOptimization() {
		buildInst.optResultConfig = null;
		switch (buildInst.buildMode) {
		case 'looping':
			await submitForLoopingOptimization();
			break;
		case 'traditional':
			await submitForTraditionalOptimization();
			break;
		default:
			console.error('Optimizer unavailable.');
		}
	}

	/**
	 * Sends the project tracks to be optimized and built in the looping music generator.
	 */
	function submitForLoopingOptimization() {
		const useSubloops = false;

		const tracks = ctx.project.buildInstances[0].tracks;
		const optTargetGroups: DeltaOptimizer.TrackOptimizerTargetGroup[] = [];
		const origBpm = buildInst.bpm;

		const origDuration = tracks.reduce((acc, trk) => Math.max(acc, Math.ceil(
			60 * beatsToSeconds(trk.duration, origBpm),
		)), 0);

		const subloops: Subloop[] = [];

		for (let i = 0; i < tracks.length; i++) {
			const trk = tracks[i];
			if (useSubloops) {
				subloops.push(...createSubloops(
					trk.notes,
					trk.duration,

					trk.instrument,
				));
			} else {
				subloops.push({
					notes: trk.notes,
					repeatCount: 1,
					instrument: trk.instrument,
				});
			}
		}

		const mostRepeats = subloops.reduce((acc, thisSubloop) => Math.max(acc, thisSubloop.repeatCount), 1);
		const shortestBuildPeriod = DeltaOptimizer.getNearestLoopPeriod(
			((origDuration / mostRepeats) / 2) - (2 * DeltaOptimizer.straightTrkTime),
		);
		const shortestPeriod = (2 * shortestBuildPeriod) + (4 * DeltaOptimizer.straightTrkTime);
		const buildDuration = shortestPeriod * mostRepeats;

		const playbackRate = origDuration / buildDuration;
		const usedBpm = origBpm * playbackRate;

		for (let i = 0; i < subloops.length; i++) {
			const subloop = subloops[i];
			const subloopTargets: TrackOptimizerTarget[] = [];

			subloop.notes.forEach((note) => {
				const newBeat = note.beat;
				subloopTargets.push({
					y: note.pitch - KEY_C4,
					frames: Math.round(60 * beatsToSeconds(newBeat, usedBpm)),
				});
			});

			optTargetGroups.push({
				targets: subloopTargets,
				subloopDivision: subloop.repeatCount,
				instrument: subloop.instrument,
			});
		}

		// FIXME: Don't use direct indexing
		const fastAutoscrollIndex = 3;
		const fastConveyorRunningIndex = 8;
		const scrollMethod: MM2ScrollMethod = buildInst.scrollPref === 'Autoscroll'
			? MM2ScrollMethods[fastAutoscrollIndex] : MM2ScrollMethods[fastConveyorRunningIndex];

		buildInst.optResultConfig = {
			bpm: 0,
			bpb: 0,
			scrollMethod,
		};

		const buildRes = DeltaOptimizer.buildMusic({
			targetGroups: optTargetGroups,
			areaWidth: buildInst.maxWidth,
			areaHeight: buildInst.maxHeight,
			verticalOffset: 0,
			loopFrameDuration: buildDuration,
			scrollMethod,
		});
		ctx.project.buildInstances[0].optResult = buildRes;
	}

	/**
	 * Sends the project tracks to be optimized and built in the looping music generator.
	 */
	async function submitForTraditionalOptimization() {
		const tracks = ctx.project.buildInstances[0].tracks;
		const optTargetGroups: TraditionalOptimizerTarget[][] = [];
		const bpm = buildInst.bpm;

		for (let i = 0; i < tracks.length; i++) {
			const targets: TraditionalOptimizerTarget[] = [];
			for (let j = 0; j < tracks[i].notes.length; j++) {
				const note = tracks[i].notes[j];
				targets.push({
					y: note.pitch - KEY_C4,
					beats: note.beat,
					entityType: entityTypeToId(tracks[i].instrument),
				});
			}
			optTargetGroups.push(targets);
		}

		const buildRes = await AlphaOptimizer.buildMusic(
			optTargetGroups,
			bpm,
			buildInst.maxWidth,
			buildInst.scrollPref,
		);
		buildInst.optResult = buildRes.optResult;
		buildInst.optResultConfig = buildRes.config;
	}
}

export default BuildSettingsPage;
