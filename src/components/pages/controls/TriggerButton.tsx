import React from 'react';

export type TriggerButtonType = 'normal' | 'blue' | 'flush' | 'dark';

/**
 * A button to trigger a function when pressed.
 * @param props.text The text to display.
 * @param props.onClick The action to take when the button is clicked.
 */
function TriggerButton(props: {text: string,
	type: TriggerButtonType, onClick: () => void, isLoading?: boolean}) {
	return (
		<button
			className={`${props.type}-trigger-button`}
			type="button"
			style={{ cursor: !props.isLoading! ? 'pointer' : 'not-allowed' }}
			onClick={() => {
				if (!props.isLoading!) props.onClick();
			}}
		>{!props.isLoading! ? props.text : 'Loading...'}
		</button>
	);
}

TriggerButton.defaultProps = {
	isLoading: false,
};

export default TriggerButton;
