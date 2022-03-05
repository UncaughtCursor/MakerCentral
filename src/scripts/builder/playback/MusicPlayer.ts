import { EntityData } from '@data/MakerConstants';
import NoteSchedule from './NoteSchedule';
import { DEFAULT_SUSTAIN_TIME, KEY_C5 } from './PlaybackConstants';

// Adapted legacy code from Maestro 1

export interface InstrumentPlayData {
	baseNote: number;
	sustainLength: number | null;
	volume: number | null;
}

/**
 * Loads all instruments into the specified NoteSchedule.
 * @param schedule The NoteSchedule to load into.
 * @returns A promise that resolves when all instruments are loaded.
 */
export async function loadBuffersInSchedule(schedule: NoteSchedule) {
	const promises: Promise<void>[] = [];
	// The below type assertion is necessary to make TypeScript recognize that the entries are keys.
	(Object.keys(EntityData) as Array<keyof typeof EntityData>)
		.forEach((instrumentName) => {
			// eslint-disable-next-line no-async-promise-executor
			promises.push(new Promise((async (resolve, reject) => {
				// const dataEntry = EntityData[instrumentName];

				// const baseNote: number = dataEntry.baseNote ? dataEntry.baseNote! : KEY_C5;
				/* const sustainLength: number = dataEntry.sustainLength
					? dataEntry.sustainLength! : DEFAULT_SUSTAIN_TIME; */
				const loadPromise = schedule.addInstrument(instrumentName,
					`${process.env.PUBLIC_URL}/sound/${instrumentName}.mp3`,
					KEY_C5, DEFAULT_SUSTAIN_TIME);
				loadPromise.then(() => { resolve(); }).catch((err) => { reject(err); });
			})));
		});
	return Promise.all(promises);
}

/**
 * Plays a short preview of an instrument.
 * @param instrumentName The name of the instrument.
 * @param noteSchedule The NoteSchedule to use for playback.
 * @param noteNumber (Optional) The note number to play.
 */
export function previewInstrument(instrumentName: string,
	noteSchedule: NoteSchedule, noteNumber: number = KEY_C5) {
	noteSchedule.stop();
	noteSchedule.clear();
	noteSchedule.setOnDone(() => {});

	noteSchedule.addNote(noteNumber, 0, instrumentName);
	noteSchedule.play();
}
