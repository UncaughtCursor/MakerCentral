import React, { SyntheticEvent } from 'react';

/**
 * A UI element that allows the user to choose from a set of options.
 * @param props The props:
 * * label: The label for the control.
 * * choices: The list of selections that the user is able to make.
 * * initSelectedIndex: The index of the choice selected by default.
 * * onSelect: The function to execute when the user makes a different selection.
 * The first argument is the selected index, and the second is the selection as a string.
 * * selectedIndex (Optional): Overrides the selected index state.
 */
function SelectInput(props: {
	label: string,
	choices: readonly string[],
	initSelectedIndex: number,
	onSelect: (arg0: number, arg1: string) => void,
	selectedIndex?: number | undefined,
}) {
	const usedSelectedIndex = props.selectedIndex !== undefined
		? props.selectedIndex : props.initSelectedIndex;
	return (
		<div>
			<p style={{
				margin: 0, marginBottom: '4px', fontSize: '15px', fontWeight: 'bold',
			}}
			>{props.label}
			</p>
			<select
				className="select-input"
				onChange={(e: SyntheticEvent) => {
					const el = e.nativeEvent.target as HTMLSelectElement;
					props.onSelect(el.selectedIndex, el.value);
				}}
			>
				{getOptions(usedSelectedIndex)}
			</select>
		</div>
	);

	/**
	 * Generates all of the option elements for the select input.
	 * @param selectedIndex The index of the selected option.
	 * @returns The created elements.
	 */
	function getOptions(selectedIndex: number): JSX.Element[] {
		return props.choices.map((choice, i) => {
			const isSelected = i === selectedIndex;
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

SelectInput.defaultProps = {
	selectedIndex: undefined,
};

export default SelectInput;
