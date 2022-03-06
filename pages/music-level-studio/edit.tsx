import AppFrame from '@components/AppFrame';
import Gate from '@components/main/Gate';
import React from 'react';
import EditorContext, { defaultState } from '../../src/components/pages/editor/EditorContext';
import EditorView from '../../src/components/pages/editor/EditorView';

/**
 * The UI used to build music level projects.
 */
function Editor() {
	return (
		<AppFrame>
			<Gate requireEA showLogout={false}>
				<EditorContext.Provider value={defaultState}>
					<EditorView />
				</EditorContext.Provider>
			</Gate>
		</AppFrame>
	);
}

export default Editor;
