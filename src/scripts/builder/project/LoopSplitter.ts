import { EntityType } from '@data/MakerConstants';
import { appPPQN } from './MidiLoader';
import { ProjectNote } from './Project';

export interface Subloop {
    notes: ProjectNote[],
    repeatCount: number,
	instrument: EntityType,
}

/**
 * Obtains multiple subloops from one large loop.
 * @param notes The notes in the large loop.
 * @param beatDuration The duration of the large loop.
 * @param instrument The instrument used to play the notes.
 * @returns The created subloops.
 */
export default function createSubloops(notes: ProjectNote[],
	beatDuration: number, instrument: EntityType) {
	const repeatCounts = getNontrivialFactors(beatDuration * appPPQN).reverse();
	const subloops: Subloop[] = [];

	let workingNotes = notes.slice(0);

	repeatCounts.forEach((repeatCount) => {
		const columns = genNoteTimingColumns(workingNotes, beatDuration);
		const repeatedNotes = getRepeatedNotesInColumns(columns, repeatCount);

		if (repeatedNotes.length > 0) {
			subloops.push({
				notes: repeatedNotes,
				repeatCount,
				instrument,
			});

			workingNotes = getCulledNoteList(workingNotes, repeatedNotes, beatDuration, repeatCount);
		}
	});

	if (workingNotes.length > 0) {
		subloops.push({
			notes: workingNotes,
			repeatCount: 1,
			instrument,
		});
	}

	return subloops;
}

/**
 * Finds all notes that are repeated a certain number of times in a column.
 * @param columns The columns to scan through.
 * @param numRepeats The number of times for the note to repeat.
 */
function getRepeatedNotesInColumns(columns: ProjectNote[][],
	numRepeats: number): ProjectNote[] {
	const beatDuration = columns.length;

	const repeatedNotes: ProjectNote[] = [];

	for (let i = 0; i < beatDuration / numRepeats; i++) {
		const comparedColumns = [];
		for (let j = 0; j < numRepeats; j++) {
			const idx = ((j * beatDuration) / numRepeats) + i;
			comparedColumns.push(columns[idx]);
		}
		repeatedNotes.push(...getNoteColumnIntersection(comparedColumns));
	}

	return repeatedNotes;
}

/**
 * Generates timing columns for a set of notes.
 * @param notes The notes to generate columns for.
 * @param beatDuration The total duration.
 * @returns The generated columns.
 */
function genNoteTimingColumns(notes: ProjectNote[],
	beatDuration: number): ProjectNote[][] {
	const columns: ProjectNote[][] = [];
	const numColumns = beatDuration * appPPQN;

	for (let i = 0; i < numColumns; i++) {
		columns[i] = [];
	}

	notes.forEach((note) => {
		const x = Math.round(note.beat * appPPQN);
		columns[x].push(note);
	});

	return columns;
}

/**
 * Generates a list of all nontrivial factors of n.
 * @param n The number to generate factors for.
 * @returns The list of nontrival factors.
 */
function getNontrivialFactors(n: number): number[] {
	const factors = [];

	for (let i = 2; i <= n / 2; i++) {
		if (n % i === 0) {
			factors.push(i);
		}
	}

	return factors;
}

/**
 * Given a list of note columns, return the notes whose pitches are present in each column.
 * @param noteColumns The list of note columns.
 * @returns The common notes.
 */
function getNoteColumnIntersection(noteColumns: ProjectNote[][]) {
	let result: ProjectNote[] = noteColumns[0].slice(0);

	noteColumns.forEach((notes, i) => {
		if (i === 0) return;
		result = getNotesIntersection(result, notes);
	});

	return result;
}

/**
 * Given two lists of notes, return the notes with pitches present in both.
 * @param listA The first list.
 * @param listB The second list.
 * @returns The list of notes common between both lists.
 */
function getNotesIntersection(listA: ProjectNote[], listB: ProjectNote[]): ProjectNote[] {
	const result: ProjectNote[] = [];

	listA.forEach((note) => {
		if (listB.some((otherNote) => note.pitch === otherNote.pitch)) {
			result.push(note);
		}
	});

	return result;
}

/**
 * Given a set of notes in a loop, a detected base set of repeated notes,
 * the number of repetitions in the loop, and the duration of the loop,
 * removes all of the repeated notes.
 * @param notes The notes to remove repeated notes from.
 * @param repeatedNotes The repeated notes to remove.
 * The number of beats must be relative to the start of the subloop.
 * @param beatDuration The duration of the loop.
 * @param repeatCount The number of times the repeated notes repeat in the loop.
 */
function getCulledNoteList(notes: ProjectNote[], repeatedNotes: ProjectNote[],
	beatDuration: number, repeatCount: number) {
	let workingNotes = notes.slice(0);

	repeatedNotes.forEach((repeatedNote) => {
		workingNotes = workingNotes.filter((note) => (note.pitch !== repeatedNote.pitch)
		|| (note.beat % Math.round(beatDuration / repeatCount) !== repeatedNote.beat));
	});

	return workingNotes;
}
