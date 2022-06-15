import { DEFAULT_SUSTAIN_TIME, KEY_C4 } from '../../../../data/PlaybackConstants';
import { midiNoteToFreq, playBufferAtPlaybackRate } from './PlaybackUtil';

// Adapted legacy code from Maestro 1

/**
 * A class responsible for playing notes and holding instrument-specific playback data.
 */
export default class PlaybackInstrument {
	buffer: AudioBuffer;

	baseNote: number;

	sustainLength: number = DEFAULT_SUSTAIN_TIME;

	/**
     * Initializes an Instrument object.
     * @param buffer An AudioBuffer object of the loaded sample.
     * @param baseNote The MIDI pitch that the buffer is tuned to.
     */
	constructor(buffer: AudioBuffer, baseNote: number = KEY_C4) {
		this.buffer = buffer;
		this.baseNote = baseNote;
	}

	/**
	 * Schedules a note to play with the specified time,
	 * note number, sustain length, duration, and audio context.
	 * @param note The MIDI note number to play.
	 * @param time The time in seconds to play the note.
	 * @param sustainLength The length of the sustain in seconds.
	 * @param duration The duration of the note in seconds.
	 * @param ctx The audio context to use.
	 */
	playNote(note: number, time: number, sustainLength: number, duration: number, ctx: AudioContext) {
		const rate = midiNoteToFreq(note) / midiNoteToFreq(this.baseNote);
		playBufferAtPlaybackRate(this.buffer, time, rate, sustainLength, duration, ctx);
	}
}
