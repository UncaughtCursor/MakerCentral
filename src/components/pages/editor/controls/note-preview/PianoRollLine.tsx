import React from 'react';
import './PianoRollLine.css';

/**
 * A vertical line that can be displayed in the piano roll.
 * @param props The properties:
 * * props.color: The color of the line.
 * * props.xPos: The x position of the line in its container.
 * * props.height: The height of the line.
 * * props.isVisible Whether or not the line is visible.
 */
function PianoRollLine(props: {color: string, xPos: number, height: number, isVisible: boolean}) {
	return (
		<div
			className="piano-roll-line"
			style={{
				height: `${props.height}px`,
				left: `${props.xPos}px`,
				borderColor: `${props.color}`,
				display: `${props.isVisible ? '' : 'none'}`,
			}}
		/>
	);
}

export default PianoRollLine;
