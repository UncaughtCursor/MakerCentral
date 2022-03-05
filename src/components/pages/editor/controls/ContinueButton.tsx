import TriggerButton from '@components/pages/controls/TriggerButton';
import React, { useContext } from 'react';
import EditorContext from '../EditorContext';

/**
 * A button that moves to the next builder page when clicked.
 */
function ContinueButton() {
	const ctx = useContext(EditorContext);
	return (
		<TriggerButton
			type="blue"
			text="Continue"
			onClick={() => {
				ctx.func.setPage(ctx.currentPage + 1);
			}}
		/>
	);
}

export default ContinueButton;
