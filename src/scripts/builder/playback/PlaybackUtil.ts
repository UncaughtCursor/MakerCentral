// Adapted legacy code from Maestro 1

import { KEY_A4, MASTER_VOLUME, RELEASE_DURATION } from './PlaybackConstants';

/**
 * Loads the data from an audio file into an AudioBuffer object.
 * @param url The local file location of the audio data to load.
 * @param ctx The audio context to use to load the audio data.
 * @returns A Promise containing the loaded audio data as an AudioBuffer object.
 */
export function loadSample(url: string, ctx: AudioContext): Promise<AudioBuffer> {
	return new Promise(((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		request.onload = () => {
			ctx.decodeAudioData(request.response, (buffer) => {
				resolve(buffer);
			}, () => {
				reject(new Error(`Failed to decode ${url}.`));
			});
		};
		request.send();
	}));
}

/**
 * Plays a buffer at the specified time,
 * playback rate, sustain time, and duration on the specified audio context.
 * @param buffer The audio buffer to play.
 * @param time The time in seconds to play the buffer at.
 * @param rate The rate to play the buffer at. For example, 1.5 will play at 150% speed.
 * @param sustainTime The time in seconds to sustain the audio before fading out.
 * @param duration The time in seconds to play the buffer.
 * @param ctx The audio context to play the buffer on.
 * @returns The created AudioBufferSourceNode.
 */
export function playBufferAtPlaybackRate(buffer: AudioBuffer, time: number = 0,
	rate: number, sustainTime: number, duration: number, ctx: AudioContext) {
	// Release note at the end of the duration or at the normal time, whichever is sooner
	const releaseTime = Math.min(time + duration, time + sustainTime);
	const endTime = releaseTime + (RELEASE_DURATION / 44100);

	const source = ctx.createBufferSource();
	source.buffer = buffer;
	source.playbackRate.value = rate;

	const gainNode = ctx.createGain();
	gainNode.gain.value = MASTER_VOLUME;
	gainNode.gain.linearRampToValueAtTime(MASTER_VOLUME, releaseTime);
	gainNode.gain.linearRampToValueAtTime(0, endTime);

	source.connect(gainNode);
	gainNode.connect(ctx.destination);

	source.start(time, 0);
	return source;
}

/**
 * Converts a MIDI note to a frequency in Hertz.
 * @param note The MIDI note number.
 * @returns The equivalent frequency of the note.
 */
export function midiNoteToFreq(note: number): number {
	return (2 ** ((note - KEY_A4) / 12)) * 440;
}

/**
 * Converts an amount of beats to the equivalent duration in seconds.
 * @param beats The number of beats.
 * @param bpm The tempo in beats per minute.
 * @returns The amount of time in seconds.
 */
export function beatsToSeconds(beats: number, bpm: number): number {
	return (60 / bpm) * beats;
}

/**
 * Modifies the audio samples in an AudioBuffer to have a linear release envelope.
 * @param bufferData A Float32 array of raw audio samples obtained from an AudioBuffer.
 * @param sustainLength How long to apply the sustain in seconds.
 */
export function applyReleaseEnvelope(bufferData: number[], sustainLength: number) {
	const releasePos = sustainLength;
	for (let i = releasePos; i < bufferData.length; i++) {
		const multiplier = 1.0 - ((i - releasePos) / RELEASE_DURATION);
		// eslint-disable-next-line no-param-reassign
		bufferData[i] *= Math.max(multiplier, 0);
	}
}
