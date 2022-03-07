import React from 'react';

/**
 * A text field input.
 * @param props.label The text to display.
 * @param props.onChange The callback function to be called when the input text is changed.
 */
function TextField(props: {label: string,
	onChange: (value: string) => void, value?: string,
	widthPx?: number, password?: boolean, maxLength?: number}) {
	return (
		<div className="text-field-container">
			<div>
				<label htmlFor={props.label}>{props.label}</label>
			</div>
			<input
				id={props.label}
				type={props.password ? 'password' : 'text'}
				value={props.value!}
				style={{ width: `${props.widthPx!}px` }}
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

TextField.defaultProps = {
	value: '',
	widthPx: 250,
	password: false,
	maxLength: Infinity,
};

export default TextField;
