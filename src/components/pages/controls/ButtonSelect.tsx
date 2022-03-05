import React, { useState } from 'react';
import SelectButton from './SelectButton';

export interface ButtonSelectEntry {
	name: string;
	caption?: string;
}

interface ButtonSelectState {
	selectedIndex: number,
	hoveredIndex: number,
}

/**
 * Displays a row of buttons representing a selection to be made.
 * @param props The props:
 * * text: The text to display to prompt the user.
 * * entries: An array of names and optional captions for each of the option names.
 * * initSelectedIndex: The initial selected index of the buttons. An out-of-bounds number
 * will select none.
 * * onChange: The function to execute when a button is clicked. The argument is the index.
 */
function ButtonSelect(props: {
	text: string,
	entries: ButtonSelectEntry[],
	initSelectedIndex: number,
	onChange: (arg0: number) => void,
}) {
	const [state, setState] = useState({
		selectedIndex: props.initSelectedIndex,
		hoveredIndex: props.initSelectedIndex,
	} as ButtonSelectState);
	let captionText = '​';
	if (state.hoveredIndex !== -1) {
		if (props.entries[state.hoveredIndex].caption !== undefined) {
			captionText = props.entries[state.hoveredIndex].caption!;
		}
	}
	return (
		<div>
			<p>{props.text}</p>
			<div className="button-select-container">
				{getButtonSelectButtons(props.entries)}
			</div>
			<p className="caption-text">{captionText}</p>
		</div>
	);

	/**
	 * Obtains the set of select button elements from the button select entries.
	 * @param entries The button select entries to make buttons from.
	 * @returns The created elements.
	 */
	function getButtonSelectButtons(entries: ButtonSelectEntry[]) {
		return entries.map((buttonEntry, i) => (
			<SelectButton
				type={state.selectedIndex === i ? 'selected' : ''}
				text={buttonEntry.name}
				onClick={() => { activateButton(i); }}
				onMouseOver={() => { hoverButton(i); }}
				onMouseOut={() => { hoverButton(state.selectedIndex); }}
				key={buttonEntry.name}
			/>
		));
	}

	/**
	 * Triggers when a button is clicked.
	 * @param index The index of the clicked button.
	 */
	function activateButton(index: number) {
		setState({
			...state,
			hoveredIndex: index,
			selectedIndex: index,
		});
		props.onChange(index);
	}

	/**
	 * Triggers when a button is hovered over.
	 * @param index The index of the hovered button.
	 */
	function hoverButton(index: number) {
		setState({
			...state,
			hoveredIndex: index,
		});
	}
}

export default ButtonSelect;
