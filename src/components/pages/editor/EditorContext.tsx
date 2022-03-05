import NoteSchedule from '@scripts/builder/playback/NoteSchedule';
import Project from '@scripts/builder/project/Project';
import React from 'react';

export interface EditorState {
	project: Project;
	projectId: string | null;
	projectName: string;
	isInitialized: boolean,
	noteSchedule: NoteSchedule;
	func: {
		setPage(num: number): void;
		genNoteGrids(): void;
	}
	uploadedFileName: string;
	currentPage: number,
	viewUid: string | null,
}

export const defaultState: EditorState = {
	project: new Project(),
	projectId: null,
	projectName: 'Untitled Project',
	isInitialized: false,
	noteSchedule: new NoteSchedule(),
	func: {
		setPage: () => {},
		genNoteGrids: () => {},
	},
	uploadedFileName: 'none',
	currentPage: 0,
	viewUid: null,
};

const EditorContext = React.createContext(defaultState);

export default EditorContext;
