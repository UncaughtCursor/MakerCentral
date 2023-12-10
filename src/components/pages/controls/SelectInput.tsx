import React, { SyntheticEvent } from 'react';

/**
 * A UI element that allows the user to choose from a set of options.
 * @param props The props:
 * * label: (Optional) The label for the control.
 * * choices: The list of selections that the user is able to make.
 * * initSelectedIndex: The index of the choice selected by default.
 * * onSelect: The function to execute when the user makes a different selection.
 * The first argument is the selected index, and the second is the selection as a string.
 * * selectedIndex (Optional): Overrides the selected index state.
 * * className (Optional): The class name to add to the control to provide custom styling.
 */
function SelectInput(props: {
	label?: string,
	choices: readonly string[],
	initSelectedIndex: number,
	onSelect: (arg0: number, arg1: string) => void,
	selectedIndex?: number | undefined,
	className?: string,
}) {
	const usedSelectedIndex = props.selectedIndex !== undefined
		? props.selectedIndex : props.initSelectedIndex;
	return (
		<div>
			{props.label !== '' && (
				<p style={{
					margin: 0, marginBottom: '4px', fontSize: '15px', fontWeight: 'bold',
				}}
				>{props.label}
				</p>
			)}
			<select
				className={props.className === '' ? 'select-input' : `select-input ${props.className}`}
				onChange={(e: SyntheticEvent) => {
					const el = e.nativeEvent.target as HTMLSelectElement;
					props.onSelect(el.selectedIndex, el.value);
				}}
				defaultValue={props.choices[usedSelectedIndex]}
			>
				{getOptions()}
			</select>
		</div>
	);

	/**
	 * Generates all of the option elements for the select input.
	 * @param selectedIndex The index of the selected option.
	 * @returns The created elements.
	 */
	function getOptions() {
		return props.choices.map((choice, i) => (
			<option
				value={choice}
				key={choice}
			>{choice}
			</option>
		));
	}
}

SelectInput.defaultProps = {
	label: '',
	selectedIndex: undefined,
	className: '',
};

export default SelectInput;
