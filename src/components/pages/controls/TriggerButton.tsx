import React from 'react';
import '../Page.css';

export type TriggerButtonType = 'normal' | 'blue' | 'flush' | 'dark';

/**
 * A button to trigger a function when pressed.
 * @param props.text The text to display.
 * @param props.onClick The action to take when the button is clicked.
 */
function TriggerButton(props: {text: string, type: TriggerButtonType, onClick: () => void}) {
	return (
		<button
			className={`${props.type}-trigger-button`}
			type="button"
			onClick={props.onClick}
		>{props.text}
		</button>
	);
}

export default TriggerButton;
