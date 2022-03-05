import React from 'react';
import './MarginDisplay.css';

/**
 * An overlay for the beginning section of a level that shouldn't have music in it.
 * @param props The props:
 * * width: (Optional) The width of the region in tiles.
 * * tileLengthPx (Optional) The width of a tile in pixels.
 */
function MarginDisplay(props: {
	width?: number,
	tileLengthPx?: number
}) {
	return (
		<div
			className="margin-overlay"
			style={{
				width: `${props.width! * props.tileLengthPx!}px`,
				height: `${27 * props.tileLengthPx!}px`,
			}}
		>
			<p>Start Zone</p>
		</div>
	);
}

MarginDisplay.defaultProps = {
	width: 27,
	tileLengthPx: 16,
};

export default MarginDisplay;
