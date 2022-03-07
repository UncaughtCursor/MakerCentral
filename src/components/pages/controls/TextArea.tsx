import React from 'react';

/**
 * A text area input.
 * @param props.label The text to display.
 * @param props.onChange The callback function to be called when the input text is changed.
 */
function TextArea(props: {label: string,
	onChange: (value: string) => void, value?: string,
	widthPx?: number, heightPx?: number, maxLength?: number}) {
	return (
		<div className="text-field-container">
			<div>
				<label htmlFor={props.label}>{props.label}</label>
			</div>
			<textarea
				id={props.label}
				value={props.value!}
				style={{
					backgroundColor: 'var(--bg-darker)',
					width: `${props.widthPx!}px`,
					height: `${props.heightPx!}px`,
					resize: 'none',
					color: 'var(--text-color)',
					fontFamily: 'sans-serif',
					fontSize: '14px',
					border: '2px solid var(--bg-norm)',
					borderRadius: '4px',
				}}
				onChange={handleChange}
				maxLength={props.maxLength!}
			/>
		</div>
	);

	/**
	 * Handles a change in the text field.
	 * @param evt The event object.
	 */
	function handleChange(e: any) {
		const str = e.target.value;
		props.onChange(str);
	}
}

TextArea.defaultProps = {
	value: '',
	widthPx: 350,
	heightPx: 250,
	maxLength: Infinity,
};

export default TextArea;
