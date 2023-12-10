import React from 'react';
import Link from 'next/link';

type ActionButtonType = 'blue' | 'normal' | 'green' | 'purple';

/**
 * A button to lead the user to a new page.
 * @param props.text The text to display.
 * @param props.to The path to lead to.
 * @param props.onClick (Optional) A function to execute when clicked.
 */
function ActionButton(props: {to: string, type?: ActionButtonType,
	text: string, onClick?: () => void}) {
	return (
		<Link
			href={props.to}
			className={props.type! === 'blue' ? 'action-button' : `action-button action-button-${props.type!}`}
			type="button"
			onClick={props.onClick!}
		>{props.text}
		</Link>
	);
}

ActionButton.defaultProps = {
	onClick: () => {},
	type: 'Blue',
};

export default ActionButton;
