import React, { SyntheticEvent } from 'react';

/**
 * A UI element that allows the user to choose from a set of options.
 * @param props The props:
 * * label: The label for the control.
 * * choices: The list of selections that the user is able to make.
 * * initSelectedIndex: The index of the choice selected by default.
 * * onSelect: The function to execute when the user makes a different selection.
 * The first argument is the selected index, and the second is the selection as a string.
 */
function SelectInput(props: {
	label: string,
	choices: readonly string[],
	initSelectedIndex: number,
	onSelect: (arg0: number, arg1: string) => void
}) {
	return (
		<div>
			<p style={{ margin: 0, marginBottom: '4px' }}>{props.label}</p>
			<select
				className="select-input"
				onChange={(e: SyntheticEvent) => {
					const el = e.nativeEvent.target as HTMLSelectElement;
					props.onSelect(el.selectedIndex, el.value);
				}}
			>
				{getOptions()}
			</select>
		</div>
	);

	/**
	 * Generates all of the option elements for the select input.
	 * @returns The created elements.
	 */
	function getOptions() {
		return props.choices.map((choice, i) => {
			const isSelected = i === props.initSelectedIndex;
			return (
				<option
					value={choice}
					selected={isSelected}
					key={choice}
				>{choice}
				</option>
			);
		});
	}
}

export default SelectInput;
