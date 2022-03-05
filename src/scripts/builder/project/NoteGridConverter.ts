import { ProjectNote } from './Project';
import UnboundedGridEntityManager from '../graphics/UnboundedGridEntityManager';
import { Coordinates2d } from '../util/Coordinates2d';

export interface ProjectNoteEntity extends ProjectNote {
	occupiedTiles: Coordinates2d[],
}

// FIXME: Two notes of same track at the same time will overlap and have strange behavior

/**
 * Converts an array of ProjectNotes to a GridEntityManager holding notes.
 * @param notes The notes to convert.
 * @returns The GridEntityManager holding notes.
 */
export function notesToGrid(notes: ProjectNote[]): UnboundedGridEntityManager<ProjectNoteEntity> {
	const grid = new UnboundedGridEntityManager<ProjectNoteEntity>(Infinity, Infinity);

	notes.forEach((note) => {
		const noteEntity: ProjectNoteEntity = {
			pitch: note.pitch,
			beat: note.beat,
			occupiedTiles: [{ x: note.beat, y: note.pitch }],
		};

		grid.addEntity(noteEntity);
	});

	return grid;
}

/**
 * Converts a GridEntityManager holding notes to an array of ProjectNotes.
 * @param grid The GridEntityManager holding notes to convert.
 * @returns The array of ProjectNotes.
 */
export function gridToNotes(grid: UnboundedGridEntityManager<ProjectNoteEntity>): ProjectNote[] {
	const notes: ProjectNote[] = [];

	grid.entityList.forEach((note) => {
		notes.push({
			pitch: note.pitch,
			beat: note.beat,
		});
	});

	return notes;
}
