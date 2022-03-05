import React from 'react';
import NumericInput from 'react-numeric-input';

/**
 * A numerical input.
 * @param props The props:
 * * label: The text to display alongside the input.
 * * min: The minimum value possible to input.
 * * max: The maximum value possible to input.
 * * val: The starting value.
 * * fieldWidth (Optional): The width of the input field in pixels.
 */
function NumberInput(props: {
	label: string,
	min: number,
	max: number,
	val: number,
	onChange: (arg0: number | null) => void,
	fieldWidthPx?: number,
}) {
	// Same mobile detection as numerical input
	const isMobile = 'ontouchstart' in document;

	const inputStyle = {
		input: {
			width: `${!isMobile ? `${props.fieldWidthPx! / 2}px` : `${props.fieldWidthPx!}px`}`,
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
		<div className="number-input-container">
			<p>{props.label}</p>
			<NumericInput
				style={inputStyle}
				min={props.min}
				max={props.max}
				value={props.val}
				onChange={props.onChange}
			/>
		</div>
	);
}

NumberInput.defaultProps = {
	fieldWidthPx: 100,
};

export default NumberInput;
