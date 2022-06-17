import {
	defaultPlaybackPPQ, END_DELAY, LOAD_DELAY, SAMPLE_RATE,
} from '../../../../data/PlaybackConstants';
import PlaybackInstrument from './PlaybackInstrument';
import { beatsToSeconds, loadSample } from './PlaybackUtil';

// Adapted legacy code from Maestro 1

export interface ScheduledNote {
	instrumentName: string;
	noteNumber: number;
	ticks: number;
	duration: number;
	sustainLength: number;
}

const beatsPerChunk = 4 * 4; // 4 measures in 4/4 time signature

/**
 * A class for playing back a sequence of scheduled notes.
 */
export default class NoteSchedule {
	schedule: ScheduledNote[] = [];

	private secondsPerBeat: number = 0.5; // Default 120 bpm

	ppq: number = defaultPlaybackPPQ;

	instruments: Map<string, PlaybackInstrument> = new Map();

	audioCtx: AudioContext;

	private timeoutIds: number[];

	private onDone = () => {};

	private endTicks: number = -1;

	private endTimeoutHandler: any = null;

	/**
     * Initializes the NoteSchedule object.
     */
	constructor() {
		this.audioCtx = new window.AudioContext({
			latencyHint: 'playback',
			sampleRate: SAMPLE_RATE,
		});
		this.timeoutIds = [];
	}

	/**
     * Sets the tempo of playback.
     * @param bpm The tempo, in beats per minute.
     */
	setTempo(bpm: number) {
		this.secondsPerBeat = beatsToSeconds(1, bpm);
	}

	/**
	 * Sets the tick to terminate playback on.
	 * @param ticks The tick number.
	 */
	setEndTicks(ticks: number) {
		this.endTicks = ticks;
	}

	/**
	 * Sets a function to be called when the NoteSchedule is finished.
	 */
	setOnDone(func: () => void) {
		this.onDone = func;
	}

	/**
     * Adds an instrument to the list of instruments.
     * @param name The name of the instrument.
     * @param url The local file location of the sound sample to be used.
     * @param baseNote The MIDI note that the input sample is pitched at.
	 * The default is 60, or Middle C.
     * @param sustainLength The number of seconds to hold a note for.
	 * @param ctx The context context to use.
     */
	async addInstrument(
		name: string,
		url: string,
		baseNote: number,
		sustainLength: number,
	) {
		const that = this;
		const inst = new PlaybackInstrument(await loadSample(url, this.audioCtx), baseNote);
		inst.sustainLength = sustainLength;
		that.instruments.set(name, inst);
	}

	/**
     * Adds a note to the list of scheduled notes.
	 * Notes need to be added in chronological order to work properly.
     * @param noteNumber The MIDI note number to play.
	 * @param ticks The number of ticks to play note at.
	 * @param instrumentName The name of the instrument to play the note with.
     */
	addNote(noteNumber: number, ticks: number, instrumentName: string) {
		// Return if the note is past the end of the playback.
		if (ticks > this.endTicks && this.endTicks >= 0) return;
		const prevNotes = this.getLastNotesOfInstrument(instrumentName, ticks);
		if (prevNotes.length > 0) {
			// prevNotes.duration = note.time - prevNotes.ticks;
			for (let i = 0; i < prevNotes.length; i++) {
				prevNotes[i].duration = ticks - prevNotes[i].ticks;
			}
		}
		this.schedule.push({
			instrumentName,
			noteNumber,
			duration: Infinity,
			ticks,
			sustainLength: this.instruments.get(instrumentName)!.sustainLength,
		});
	}

	/**
	 * Retrieves all previously played notes of an instrument.
	 * @param instrumentName The name of the instrument to retrieve notes for.
	 * @param ignoredTicks If a note is played during this tick time, it is ignored.
	 * @returns The previously played notes.
	 */
	getLastNotesOfInstrument(instrumentName: string, ignoredTicks: number = -1) {
		/* Get the last note played by the specified instruments whose ticks are
		not equal to disallowedTicks */
		const foundNotes = [];
		let foundTicks = -1;
		for (let i = this.schedule.length - 1; i >= 0; i--) {
			const thisNote = this.schedule[i];
			if (thisNote.instrumentName === instrumentName
				&& thisNote.ticks !== ignoredTicks && foundTicks === -1) {
				// Begin capturing all other notes that play at the same time as the found note
				foundTicks = thisNote.ticks;
			}
			if (thisNote.ticks === foundTicks) foundNotes.push(thisNote);
			// Break when no other notes at the found time were detected
			else if (foundTicks !== -1) break;
		}
		return foundNotes;
	}

	/**
     * Stops playback and cancels all scheduled notes.
     */
	stop() {
		if (this.endTimeoutHandler !== null) {
			clearTimeout(this.endTimeoutHandler);
			this.onDone();
		}

		this.timeoutIds.forEach((timeoutId) => { window.clearTimeout(timeoutId); });
		this.timeoutIds = [];

		this.audioCtx.close();
		this.audioCtx = new window.AudioContext();
	}

	// FIXME: Playback breaks on large amounts of notes (probably performance)

	/**
	 * Plays the scheduled notes.
	 */
	play() {
		const noteChunks = this.getNoteChunks();
		const startTime = this.audioCtx.currentTime;

		noteChunks.forEach((chunk, i) => {
			// Load each chunk 1 second in advance
			const loadTimeMs = 1000 * Math.max((beatsToSeconds(i * beatsPerChunk, 60 / this.secondsPerBeat)) - 1, 0);
			if (chunk.length > 0) {
				const timeoutId = window.setTimeout(() => {
					chunk.forEach((thisNote) => {
						const time = this.ticksToSeconds(thisNote.ticks) + startTime + LOAD_DELAY;
						const duration = this.ticksToSeconds(thisNote.duration);
						const instName = thisNote.instrumentName;
						this.instruments.get(instName)!.playNote(thisNote.noteNumber, time, thisNote.sustainLength, duration, this.audioCtx);
					});
				}, loadTimeMs);
				this.timeoutIds.push(timeoutId);
			}
		});

		if (this.endTicks >= 0) {
			const endTime = 1000 * (this.ticksToSeconds(this.endTicks) + LOAD_DELAY + END_DELAY);
			this.endTimeoutHandler = setTimeout(() => { this.stop(); }, Math.ceil(endTime));
		}
	}

	/**
     * Clears the schedule of all notes.
     */
	clear() {
		this.schedule = [];
	}

	/**
     * Converts a duration in playback ticks to seconds.
     * @param ticks The number of playback ticks.
     * @returns The equivalent number of seconds.
     */
	ticksToSeconds(ticks: number): number {
		return (ticks / this.ppq) * this.secondsPerBeat;
	}

	/**
	 * Generates a series of chunks for playback, to be loaded periodically
	 */
	getNoteChunks() {
		const chunks: ScheduledNote[][] = [];
		const numChunks = this.schedule.reduce((acc, note) => Math.max(acc, Math.floor(
			(note.ticks / this.ppq) / beatsPerChunk,
		)), 0) + 1;

		for (let i = 0; i < numChunks; i++) chunks[i] = [];

		this.schedule.forEach((note) => {
			const chunkId = Math.floor((note.ticks / this.ppq) / beatsPerChunk);
			chunks[chunkId].push(note);
		});

		return chunks;
	}
}
