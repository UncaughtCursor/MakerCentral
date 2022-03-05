import React from 'react';
import './PianoRollLine.css';

/**
 * A horizontal line that can be displayed in the piano roll.
 * @param props The properties:
 * * props.color: The color of the line.
 * * props.yPos: The y position of the line in its container.
 * * props.isVisible Whether or not the line is visible.
 */
function PianoRollLineHz(props: {color: string, yPos: number, isVisible: boolean}) {
	return (
		<div
			className="piano-roll-line"
			style={{
				width: 'calc(100% - 2px)',
				top: `${props.yPos}px`,
				borderColor: `${props.color}`,
				display: `${props.isVisible ? '' : 'none'}`,
			}}
		/>
	);
}

export default PianoRollLineHz;
