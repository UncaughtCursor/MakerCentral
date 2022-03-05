import { EntityType } from '@data/MakerConstants';
import { ProjectNote } from './Project';

// TODO: Adding and removing notes, refreshing properties

let globalTrackIdCounter = 0;

export interface ProjectTrackData {
	notes: ProjectNote[];
	name: string;
	duration: number;
	instrument: EntityType;
	octaveShift: number;
	id: number;
}

/**
 * A class for storing a group of project notes.
 */
export default class ProjectTrack {
	notes: ProjectNote[];

	name: string = 'Untitled Track';

	duration: number = 0;

	instrument: EntityType;

	octaveShift: number;

	// FIXME: Resets when refreshed
	id: number = globalTrackIdCounter;

	/**
	 * Creates a new instance of a project track.
	 * @param notes The project notes to create a track from.
	 * @param instrument The instrument used to play the notes.
	 * @param duration The duration of the track in beats.
	 */
	constructor(notes: ProjectNote[], instrument: EntityType, duration: number) {
		globalTrackIdCounter++;
		this.notes = notes;
		this.instrument = instrument;
		this.duration = duration;
		this.octaveShift = 0;
	}

	/**
	 * Creates a ProjectTrack based on deserialized data.
	 * @param data The data to create the ProjectTrack from.
	 * @returns The created ProjectTrack.
	 */
	static fromData(data: ProjectTrackData): ProjectTrack {
		const trk = new ProjectTrack(data.notes, data.instrument, data.duration);
		trk.octaveShift = data.octaveShift;
		trk.id = data.id;
		trk.name = data.name;

		return trk;
	}

	/**
	 * Creates a copy of this track.
	 * @returns The copy of this track.
	 */
	getCopy(): ProjectTrack {
		const notes = JSON.parse(JSON.stringify(this.notes)) as ProjectNote[];
		const newTrack = new ProjectTrack(notes, this.instrument, this.duration);

		newTrack.name = this.name;
		newTrack.octaveShift = this.octaveShift;

		return newTrack;
	}

	/**
	 * Shifts all notes up or down by whole octave increments.
	 * @param octave The relative octave to shift to.
	 */
	shiftToOctave(octave: number) {
		const octaveDiff = octave - this.octaveShift;
		this.notes.forEach((note) => {
			// eslint-disable-next-line no-param-reassign
			note.pitch += 12 * octaveDiff;
		});
		this.octaveShift += octaveDiff;
	}
}
