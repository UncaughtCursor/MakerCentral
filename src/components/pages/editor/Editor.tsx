import React from 'react';
import EditorContext, { defaultState } from './EditorContext';
import EditorView from './EditorView';

/**
 * The UI used to build music level projects.
 */
function Editor() {
	return (
		<EditorContext.Provider value={defaultState}>
			<EditorView />
		</EditorContext.Provider>
	);
}

export default Editor;
