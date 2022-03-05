/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { useEffect, useRef } from 'react';
import '../Page.css';

export type SelectButtonType = '' | 'selected';

/**
 * A button to trigger a function when pressed.
 * @param props.text The text to display.
 * @param props.onClick The action to take when the button is clicked.
 * @param props.animDelayPerPx (Optional) The number of ms to delay animation as a
 * function of distance to the upper right corner of the container. (x + y)
 */
function SelectButton(props: {
	text: string, type: SelectButtonType, animDelayPerPx?: number,
	onClick: () => void, onMouseOver?: () => void, onMouseOut?: () => void}) {
	const ref = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const btn = ref.current!;

		const btnX = btn.offsetLeft;
		const btnY = btn.offsetTop;

		const pxDist = btnX + btnY;

		btn.style.animationDelay = `${pxDist * props.animDelayPerPx!}ms`;
	});

	return (
		<button
			className={props.type !== '' ? `select-button ${props.type}` : 'select-button'}
			type="button"
			ref={ref}
			onClick={props.onClick}
			onMouseOver={props.onMouseOver}
			onMouseOut={props.onMouseOut}
		>{props.text}
		</button>
	);
}

SelectButton.defaultProps = {
	animDelayPerPx: 0,
	onMouseOver: () => {},
	onMouseOut: () => {},
};

export default SelectButton;
