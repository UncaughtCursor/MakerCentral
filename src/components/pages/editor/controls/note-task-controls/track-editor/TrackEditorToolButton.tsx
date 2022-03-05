import React from 'react';

type ButtonType = 'click' | 'select';

/**
 * A track editor button.
 * @param props.type The type of button.
 * @param props.image The element to display as an image for the button.
 * @param props.isSelected Whether or not the button is highlighted.
 * @param props.isDisabled Whether or not the button is disabled. (Optional)
 * @param props.onClick The function to be called when the button is clicked.
 */
function TrackEditorToolButton(props: {
	// eslint-disable-next-line no-undef
	type: ButtonType, image: JSX.Element, isSelected: boolean,
	isDisabled?: boolean, onClick: () => void,
}) {
	let buttonSubclass = '';
	if (props.isSelected) buttonSubclass = ' selected';
	if (props.isDisabled) buttonSubclass = ' disabled';
	const buttonClass = `tool-button ${props.type}${buttonSubclass}`;

	return (
		// eslint-disable-next-line max-len
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
		<div className={buttonClass} onClick={handleClick}>
			{props.image}
		</div>
	);

	/**
	 * Triggers when the button is clicked.
	 */
	function handleClick() {
		if (!props.isDisabled) props.onClick();
	}
}

TrackEditorToolButton.defaultProps = {
	isDisabled: false,
};

export default TrackEditorToolButton;
