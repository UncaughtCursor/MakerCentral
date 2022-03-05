import { EntityData, MidiInstruments } from '@data/MakerConstants';
import { ProjectMidi } from './MidiLoader';
import ProjectTrack from './ProjectTrack';
import { TrackOptimizationResult } from '../optimization/looping/DeltaOptimizer';
import UnboundedGridEntityManager from '../graphics/UnboundedGridEntityManager';
import { ProjectNoteEntity } from '../project/NoteGridConverter';
import UndoRedoManager from './UndoRedoManager';
import { ScrollBpbConfig, TraditionalOptimizationResult } from '../optimization/traditional/AlphaOptimizer';

type TrackId = number;
export type BuildMode = 'traditional' | 'looping' | 'prototype' | 'minecraft' | 'unspecified';

const currentVersion = 0;

export interface ProjectData {
	version: number;
	projectMidis: ProjectMidi[];
	buildInstances: BuildInstance[];
}

export interface BuildInstance {
	name: string,
	selections: MusicSelection[];
	baseTracks: ProjectTrack[];
	tracks: ProjectTrack[];
	trackDict: Map<TrackId, ProjectTrack>;
	optResult: TrackOptimizationResult | TraditionalOptimizationResult | null;
	optResultConfig: ScrollBpbConfig | null;
	noteGrids: UnboundedGridEntityManager<ProjectNoteEntity>[];
	undoRedoManager: UndoRedoManager;
	buildMode: BuildMode;
	maxWidth: number;
	maxHeight: number;
	bpm: number;
	scrollPref: ScrollPreference;
}

export const scrollPreferences = [
	'Any Scroll Method',
	'Autoscroll',
	'Non-Autoscroll Methods',
] as const;
export type ScrollPreference = typeof scrollPreferences[number];

export interface MusicSelection {
	startBeat: number | null;
	endBeat: number | null;
}

export interface ProjectNote {
	pitch: number;
	beat: number;
}

/**
 * A level builder project.
 */
export default class Project {
	version: number;

	projectMidis: ProjectMidi[];

	buildInstances: BuildInstance[];

	/**
	 * Creates a new project.
	 */
	constructor(data?: ProjectData) {
		if (data === undefined) {
			this.version = currentVersion;
			this.projectMidis = [];
			// TODO: Separate "instances" e.g. main world and sub world
			this.buildInstances = [];
			this.buildInstances[0] = {
				name: 'Project',
				selections: [{
					startBeat: null,
					endBeat: null,
				}],
				tracks: [],
				baseTracks: [],
				trackDict: new Map(),
				optResult: null,
				optResultConfig: null,
				noteGrids: [],
				undoRedoManager: new UndoRedoManager(),
				buildMode: 'unspecified',
				maxWidth: 240,
				maxHeight: 27,
				bpm: 120,
				scrollPref: 'Any Scroll Method',
			};
		} else {
			this.version = data.version;
			this.projectMidis = data.projectMidis;
			this.buildInstances = data.buildInstances;
		}
	}

	/**
	 * Adds a new MIDI file to the project.
	 * @param midi The processed MIDI data to add.
	 */
	addMidi(midi: ProjectMidi) {
		this.projectMidis.push(midi);
		if (this.projectMidis.length === 1) {
			if (midi.tempoChanges.length > 0) {
				this.buildInstances[0].bpm = Math.round(midi.tempoChanges[0].bpm);
			}
		}
	}

	/**
	 * Creates project tracks from a MIDI based on a selection.
	 * @param selection The selection to use.
	 * @param buildMode The build mode.
	 * @returns The created project tracks.
	 */
	createTracksFromSelection(selection: MusicSelection, buildMode: BuildMode) {
		const tracks: ProjectTrack[] = [];

		const midiTracks = this.projectMidis[0].tracks;

		for (let i = 0; i < midiTracks.length; i++) {
			const midiTrack = midiTracks[i];
			const projectNotes: ProjectNote[] = [];

			const midiInstrumentIndex = midiTracks[i].notes.length > 0
				? midiTracks[i].notes[0].instrument : 0;
			const midiInstrument = MidiInstruments[midiInstrumentIndex];

			for (let j = 0; j < midiTrack.notes.length; j++) {
				const midiNote = midiTrack.notes[j];
				if (midiNote.beat >= selection.startBeat! && midiNote.beat < selection.endBeat!) {
					projectNotes.push({
						pitch: midiNote.pitch,
						beat: midiNote.beat - selection.startBeat!,
					});
				}
			}

			if (projectNotes.length > 0) {
				let instrument = MidiInstruments[midiTrack.notes[0].instrument].mm2Instrument;

				// Change instrument type if not buildable in the current mode
				const insData = EntityData[instrument];
				const isIllegalInstrument = (buildMode === 'traditional' && !insData.isTraditionalBuildable)
				|| (buildMode === 'looping' && !insData.isLoopingBuildable);
				if (isIllegalInstrument) instrument = 'Goomba';

				const createdTrack = new ProjectTrack(
					projectNotes, instrument, selection.endBeat! - selection.startBeat!,
				);
				createdTrack.name = midiInstrument.name;
				tracks.push(createdTrack);
			}
		}

		return tracks;
	}
}
