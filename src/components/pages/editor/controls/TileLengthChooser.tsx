import React, { useState } from 'react';
import './TileLengthChooser.css';
import NumericInput from 'react-numeric-input';

// TODO: Output events, states for min and max of tiles box and values of both boxes

interface TileLengthChooserState {
	tilesVal: number,
	screensVal: number,
	tilesMin: number,
	tilesMax: number,
}

/**
 * A control used to choose a length in game tiles.
 * @param props The props:
 * * type: Whether the quantity being entered is a width or height.
 * * text: The text to prompt the user with.
 * * min: The minimum length in tiles.
 * * max: The maximum length in tiles.
 * * val: The initial value in tiles.
 * * onChange: The callback function for when the length in tiles changes.
 */
function TileLengthChooser(props: {
	type: 'width' | 'height',
	text: string,
	min: number,
	max: number,
	val: number,
	onChange: (arg0: number) => void,
}) {
	const screenLength = props.type === 'width' ? 24 : 14;

	const [state, setState] = useState({
		tilesVal: props.val % screenLength,
		screensVal: Math.floor(props.val / screenLength),
	} as TileLengthChooserState);

	const minScreens = Math.floor(props.min / screenLength);
	const maxScreens = Math.floor(props.max / screenLength);

	let minTiles = -1;
	if (state.screensVal === minScreens) minTiles = (props.min % screenLength);
	let maxTiles = screenLength;
	if (state.screensVal === maxScreens) maxTiles = (props.max % screenLength);

	if (state.tilesVal < minTiles) {
		setState({
			...state,
			tilesVal: minTiles,
		});
	}
	if (state.tilesVal > maxTiles) {
		setState({
			...state,
			tilesVal: maxTiles,
		});
	}

	updateValue();
	// Same mobile detection as numerical input
	const isMobile = 'ontouchstart' in document;

	const inputStyle = {
		input: {
			width: `${!isMobile ? '50px' : '100px'}`,
			color: 'var(--text-color)',
			backgroundColor: 'var(--bg-darker)',
		},
		'input:not(.form-control)': {
			border: 'none',
		},
		btnUp: {
			boxShadow: 'none',
			border: '1px solid var(--bg-norm)',
		},
		btnDown: {
			boxShadow: 'none',
			border: '1px solid var(--bg-norm)',
		},
		arrowUp: {
			borderColor: 'var(--text-color) transparent var(--text-color)',
		},
		arrowDown: {
			borderColor: 'var(--text-color) transparent var(--text-color)',
		},
		plus: {
			backgroundColor: 'var(--text-color)',
		},
		minus: {
			backgroundColor: 'var(--text-color)',
		},
	};

	return (
		<div>
			<p style={{ marginBottom: '0px' }}>{props.text}</p>
			<div className="tile-length-chooser">
				<p>Screens</p>
				<NumericInput
					style={inputStyle}
					min={minScreens}
					max={maxScreens}
					value={state.screensVal}
					onChange={handleNumScreensChange}
				/>
				<p>Tiles</p>
				<NumericInput
					style={inputStyle}
					className="number-input"
					min={minTiles}
					max={maxTiles}
					value={state.tilesVal}
					onChange={handleNumTilesChange}
				/>
			</div>
		</div>
	);

	/**
	 * Executes whenever the value in the screen number picker changes.
	 * @param value The value in the screen number picker.
	 */
	function handleNumScreensChange(value: number | null) {
		if (value === null) return;
		setState({
			...state,
			screensVal: value,
		});
	}

	/**
	 * Executes whenever the value in the tile number picker changes.
	 * @param value The value in the tile number picker.
	 */
	function handleNumTilesChange(value: number | null) {
		if (value === null) return;
		// Rollover the screen and tile values if the tile value hits the min or max
		// Otherwise, update the tiles value as normal
		if (state.screensVal > minScreens && value === minTiles) {
			setState({
				...state,
				screensVal: state.screensVal - 1,
				tilesVal: screenLength - 1,
			});
		} else if (state.screensVal < maxScreens && value === maxTiles) {
			setState({
				...state,
				screensVal: state.screensVal + 1,
				tilesVal: 0,
			});
		} else {
			setState({
				...state,
				tilesVal: value,
			});
		}
	}

	/**
	 * Calculates the number of tiles inputted and activates the callback function.
	 */
	function updateValue() {
		const numTiles = (state.screensVal * screenLength) + state.tilesVal;
		props.onChange(numTiles);
	}
}

export default TileLengthChooser;
