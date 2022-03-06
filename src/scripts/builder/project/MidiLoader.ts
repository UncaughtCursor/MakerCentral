import MIDIFile from 'midifile';
import loadBinaryFile from '../util/loadBinaryFile';
import loadBinaryFileObj from '../util/loadBinaryFileObj';

export interface ProjectMidi {
	tracks: ProjectMidiTrack[],
	tempoChanges: ProjectMidiTempo[],
	quartersPerMeasure: number,
	totalBeatDuration: number,
}

export interface ProjectMidiTrack {
	notes: ProjectMidiNote[],
	beatDuration: number,
	instrument: number,
}

// TODO: Use track instrument field instead of notes

export interface ProjectMidiNote {
	beat: number,
	pitch: number,
	instrument: number,
}

export interface ProjectMidiTempo {
	bpm: number,
	beat: number,
}

interface MidiEvent {
	delta: number,
	subtype: number,
	type: number
	channel: number,
	param1?: number,
	param2?: number,
	tempoBPM?: number,
}

interface RawMidiNote {
	beat: number,
	pitch: number,
	instrument: number,
	channel: number,
}

const numMidiChannels = 16;
const minNoteVelocity = 1; // Set to 20 for "It's me, Mario" sound midi
export const appPPQN = 24; // Rounds everything to the nearest 24th of a beat

/**
 * Async function that loads and processes the MIDI file at the specified path server-side.
 * @param src The path to the MIDI file.
 * @returns The processed MIDI data.
 */
export async function loadPublicMidi(src: string) {
	const data = await loadBinaryFile(src);
	const midiFile = new MIDIFile(data);
	return processMidi(midiFile);
}

/**
 * Async function that loads and processes the MIDI file at the specified path server-side.
 * @param src The path to the MIDI file.
 * @returns The processed MIDI data.
 */
export default async function loadUserMidi(file: File) {
	const data = await loadBinaryFileObj(file);
	const midiFile = new MIDIFile(data);
	return processMidi(midiFile);
}

/**
 * Converts the MIDI data to the project-readable format.
 * @param midiFile The MIDI data to convert.
 * @returns The project-readable data.
 */
function processMidi(midiFile: any): ProjectMidi {
	const numTrks = <number>midiFile.header.getTracksCount();
	const events: {midiEvent: MidiEvent, ticks: number}[][] = [];

	const rawNotes: RawMidiNote[][] = [];
	const tempoChanges: ProjectMidiTempo[] = [];

	for (let i = 0; i < numTrks; i++) {
		events[i] = [];
		const midiEvents = <MidiEvent[]>midiFile.getTrackEvents(i);

		let absTime = 0;
		midiEvents.forEach(((midiEvent) => {
			absTime += midiEvent.delta;
			events[i].push({
				midiEvent,
				ticks: absTime,
			});
		}));
	}

	const currentInstrument: number[] = Array<number>(numMidiChannels).fill(0);
	// FIXME: Will crash on the other time division type
	const ticksPerQuarterNote = midiFile.header.getTicksPerBeat();
	let quartersPerMeasure = 4; // Assumed 4/4 time signature

	events.forEach((trkEvents, i) => {
		rawNotes[i] = [];
		trkEvents.forEach((event) => {
			const midiEvent = event.midiEvent;
			switch (midiEvent.type) {
			// MIDI Event
			case 0x08: {
				switch (midiEvent.subtype) {
				case 0x9: { // Note On
					// Break if the note is too quiet
					if (midiEvent.param2! < minNoteVelocity) break;
					rawNotes[i].push({
						beat: getQuantizedBeat(event.ticks / ticksPerQuarterNote),
						pitch: midiEvent.param1!,
						instrument: currentInstrument[midiEvent.channel],
						channel: midiEvent.channel,
					});
					break;
				}
				case 0xC: { // Instrument Change
					currentInstrument[midiEvent.channel] = midiEvent.param1!;
				}
				}
				break;
			}

			// Meta Event
			case 0xFF: {
				switch (midiEvent.subtype) {
				case 0x51: { // Change Tempo
					tempoChanges.push({
						beat: getQuantizedBeat(event.ticks / ticksPerQuarterNote),
						bpm: midiEvent.tempoBPM!,
					});
					break;
				}
				case 0x58: { // Time signature
					const noteValue = 2 ** midiEvent.param2!;
					quartersPerMeasure = (4 / noteValue) * midiEvent.param1!;
					break;
				}
				}
			}
			}
		});
	});

	const tracks = processRawNotes(rawNotes);

	const totalBeatDuration = tracks.reduce((max: number, track: ProjectMidiTrack) => Math.max(max, track.beatDuration), 0);

	// Set default tempo if none is found
	if (tempoChanges.length === 0) {
		tempoChanges.push({
			beat: 0,
			bpm: 120,
		});
	}

	return {
		quartersPerMeasure,
		tracks,
		tempoChanges,
		totalBeatDuration,
	};
}

/**
 * Processes a 2D array of RawMidiNotes into an array of ProjectMidiTracks.
 * @param rawNotes The 2D array of RawMidiNotes to process.
 * @returns The array of ProjectMidiTracks.
 */
function processRawNotes(rawNotes: RawMidiNote[][]): ProjectMidiTrack[] {
	const instrumentSeparatedTracks: RawMidiNote[][] = [];

	for (let i = 0; i < rawNotes.length; i++) {
		const instrumentNoteMap: Map<number, RawMidiNote[]> = new Map();

		// Find all instruments in a track
		for (let j = 0; j < rawNotes[i].length; j++) {
			const thisNote = rawNotes[i][j];
			const thisInstrument = thisNote.instrument;

			if (!instrumentNoteMap.has(thisInstrument)) {
				instrumentNoteMap.set(thisInstrument, []);
			}

			instrumentNoteMap.get(thisInstrument)!.push(thisNote);
		}

		// Add all found groups of notes into the list
		const usedInstruments = Array.from(instrumentNoteMap.values());
		instrumentSeparatedTracks.push(...usedInstruments);
	}

	const instrumentChannelSeparatedTracks: RawMidiNote[][] = [];

	for (let i = 0; i < instrumentSeparatedTracks.length; i++) {
		const instrumentChannelNoteMap: Map<number, RawMidiNote[]> = new Map();

		// Find all channels in a track
		// TODO: Split off percussion by instrument here
		// E.g. POW -> Kick Drum, P-Switch -> Snare Drum
		for (let j = 0; j < instrumentSeparatedTracks[i].length; j++) {
			const thisNote = instrumentSeparatedTracks[i][j];
			const thisChannel = thisNote.channel;

			if (!instrumentChannelNoteMap.has(thisChannel) && thisChannel !== 9) {
				instrumentChannelNoteMap.set(thisChannel, []);
			}

			// Exclude percussion notes for now
			if (thisChannel !== 9) {
				instrumentChannelNoteMap.get(thisChannel)!.push(thisNote);
			}
		}

		// Add all found groups of notes into the list
		const usedChannels = Array.from(instrumentChannelNoteMap.values());
		instrumentChannelSeparatedTracks.push(...usedChannels);
	}

	const tracks: ProjectMidiTrack[] = instrumentChannelSeparatedTracks.map((trackNotes) => ({
		notes: trackNotes,
		beatDuration: (trackNotes.length > 0) ? trackNotes[trackNotes.length - 1].beat : 0,
		instrument: trackNotes[0].instrument,
	}));

	return tracks;
}

/**
 * Quantizes the given beat to the application PPQN.
 * @param beat The beat number to quantize.
 * @returns The quantized beat number.
 */
function getQuantizedBeat(beat: number) {
	return Math.round(beat * appPPQN) / appPPQN;
}
