import { Coordinates2d } from '@scripts/builder/util/Coordinates2d';
import React, { useLayoutEffect, useRef } from 'react';
import './GridDisplayMessage.css';

export interface GridDisplayMessageData {
	text: string,
}

const boxMarginPx = 2;
const boxOfsXPx = 8;
const stemHeightPx = 8;

/**
 * A message box that displays a message above a grid display tile in a GridDisplay component.
 * @param props The props:
 * * messageMap: A map of coordinates to display messages at.
 * The keys are stringified Coordinates2d objects.
 * * selectedTile: The currently selected tile or null if none is selected.
 * * tileLengthPx: (Optional) The length in pixels of a tile.
 */
function GridDisplayMessage(props: {
	messageMap: Map<string, GridDisplayMessageData>,
	selectedTile: Coordinates2d | null,
	tileLengthPx?: number,
}) {
	const xPx = props.selectedTile !== null ? props.selectedTile.x * props.tileLengthPx! : 0;
	const yPx = props.selectedTile !== null ? props.selectedTile.y * props.tileLengthPx! : 0;

	const message = props.messageMap.get(JSON.stringify(props.selectedTile));

	const msgBoxRef = useRef<HTMLDivElement>(null);
	const stemRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const boxElement = msgBoxRef.current!;
		const stemElement = stemRef.current!;
		const containerElement = boxElement.parentElement!;

		// Bound message box's horizontal position
		const boxWidth = boxElement.offsetWidth;
		const areaWidth = containerElement.clientWidth;

		const minBoxX = (boxWidth / 2) - boxOfsXPx + boxMarginPx + containerElement.scrollLeft;
		const maxBoxX = areaWidth - (boxWidth / 2) - boxOfsXPx - boxMarginPx
		+ containerElement.scrollLeft;

		const curLeft = parseInt(boxElement.style.left, 10);
		const newLeft = Math.max(minBoxX, Math.min(curLeft, maxBoxX));
		boxElement.style.left = `${newLeft}px`;

		// Flip the message box if it's too close to the top of the container
		const boxHeight = boxElement.offsetHeight;

		const minTop = boxHeight + stemHeightPx + boxMarginPx;

		const curTop = parseInt(boxElement.style.top, 10);

		if (curTop < minTop) {
			boxElement.className = 'grid-display-message-box flipped';
			stemElement.className = 'grid-display-message-box-stem flipped';
			stemElement.style.top = `${yPx + stemHeightPx}px`;
		} else {
			boxElement.className = 'grid-display-message-box';
			stemElement.className = 'grid-display-message-box-stem';
			stemElement.style.top = `${yPx - stemHeightPx}px`;
		}

		// Display elements if there is a message to display
		if (message !== undefined) {
			boxElement.style.visibility = 'visible';
			stemElement.style.visibility = 'visible';
		} else {
			boxElement.style.visibility = 'hidden';
			stemElement.style.visibility = 'hidden';
		}
	});

	return (
		<>
			<div
				className="grid-display-message-tile"
				style={
					{
						display: `${props.selectedTile !== null ? '' : 'none'}`,
						top: `${yPx}px`,
						left: `${xPx}px`,
					}
				}
			/>
			<div
				className="grid-display-message-box"
				style={
					{
						visibility: 'hidden',
						top: `${yPx}px`,
						left: `${xPx}px`,
					}
				}
				ref={msgBoxRef}
			>
				<p>{`${message !== undefined ? message.text : 'This is a really cool test woah epic i very much do enjoy'}`}</p>
			</div>
			<div
				className="grid-display-message-box-stem"
				style={
					{
						visibility: 'hidden',
						top: `${yPx - stemHeightPx}px`,
						left: `${xPx + boxOfsXPx}px`,
					}
				}
				ref={stemRef}
			/>
		</>
	);
}

GridDisplayMessage.defaultProps = {
	tileLengthPx: 16,
};

export default GridDisplayMessage;
