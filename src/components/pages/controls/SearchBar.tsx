import React, { useEffect, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: (value: string) => void;
}

/**
 * A text field input.
 * @param props.label The text to display.
 * @param props.onChange The callback function to be called when the input text is changed.
 */
function SearchBar(props: SearchBarProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const valueRef = useRef<string>('');
	valueRef.current = props.value;

	const keyDownFn = (evt: KeyboardEvent) => {
		if (evt.key === 'Enter') props.onSubmit(valueRef.current);
	};

	useEffect(() => {
		const inputEl = inputRef.current!;
		inputEl.addEventListener('keydown', keyDownFn);

		return () => {
			inputEl.removeEventListener('keydown', keyDownFn);
		};
	}, []);

	return (
		<div className="search-bar">
			<input
				type="text"
				value={props.value!}
				onChange={handleChange}
				ref={inputRef}
			/>
			<FilterListIcon className="search-bar-icon" />
			<SearchIcon
				className="search-bar-icon"
				onClick={() => { props.onSubmit(valueRef.current); }}
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

SearchBar.defaultProps = {
	value: '',
	widthPx: 250,
	password: false,
	maxLength: Infinity,
	type: 'Normal',
};

export default SearchBar;
