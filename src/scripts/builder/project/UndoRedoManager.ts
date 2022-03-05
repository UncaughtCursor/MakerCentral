import { EditorToolName } from '@components/pages/editor/controls/note-task-controls/track-editor/TrackEditorToolbar';

export interface EditorAction {
	tool: EditorToolName;
	data: any;
}

/**
 * Creates a system for undoing and redoing actions of editor tools.
 */
export default class UndoRedoManager {
	private history: EditorAction[];

	private historyIndex: number;

	/**
	 * Creates a new UndoRedoManager.
	 * @param history (Optional) The current history.
	 * @param historyIndex (Optional) The current history index.
	 */
	constructor(history = [], historyIndex = -1) {
		this.history = history;
		this.historyIndex = historyIndex;
	}

	/**
	 * Saves a recently-executed action in the history,
	 * deleting any actions that could have been redone.
	 * @param action The action to execute.
	 */
	do(action: EditorAction) {
		if (this.historyIndex !== -1) {
			this.history.splice(this.historyIndex + 1,
				this.history.length - this.historyIndex - 1, action);
		} else {
			// Special case for index -1
			this.history = [action];
		}
		this.historyIndex++;
	}

	/**
	 * Simulates an undo in the history, returning the action that should be executed.
	 * Throws an error if undoing is not possible.
	 * @returns The action that should be executed.
	 */
	undo() {
		if (!this.canUndo()) {
			throw new Error('Cannot undo. History index is out of range.');
		}

		const lastAction = this.history[this.historyIndex];

		this.historyIndex--;

		return lastAction;
	}

	/**
	 * Simulates an redo in the history, returning the action that should be executed.
	 * Throws an error if redoing is not possible.
	 * @returns The action that should be executed.
	 */
	redo() {
		if (!this.canRedo()) {
			throw new Error('Cannot redo. History index is out of range.');
		}

		this.historyIndex++;

		const nextAction = this.history[this.historyIndex];

		return nextAction;
	}

	/**
	 * Clears the history.
	 */
	clear() {
		this.history = [];
		this.historyIndex = -1;
	}

	/**
	 * Returns whether or not undoing is possible.
	 * @returns The result.
	 */
	canUndo() {
		return !(this.historyIndex < 0 || this.historyIndex >= this.history.length);
	}

	/**
	 * Returns whether or not redoing is possible.
	 * @returns The result.
	 */
	canRedo() {
		return !(this.historyIndex < -1 || this.historyIndex >= this.history.length - 1);
	}
}
