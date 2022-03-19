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
		<AppFrame
			title="Music Editor - Music Level Studio"
			description="Automatically generate music levels, even global looping music!"
		>
			<EditorContext.Provider value={defaultState}>
				<EditorView />
			</EditorContext.Provider>
		</AppFrame>
	);
}

export default Editor;
