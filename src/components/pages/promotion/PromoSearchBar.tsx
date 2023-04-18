/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useRef, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
	initialVal: string;
	onSubmit: (value: string) => void;
}

/**
 * A search bar for searching promoted levels.
 * @param props The props:
 * - initialVal: The initial value of the search bar.
 * - onSubmit: The callback function to be called when the user submits the search.
 * @returns The search bar.
 */
function PromoSearchBar(props: SearchBarProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const valueRef = useRef<string>('');
	const [inputText, setInputText] = useState(props.initialVal);
	valueRef.current = inputText;

	const keyDownFn = (evt: KeyboardEvent) => {
		if (evt.key === 'Enter') {
			props.onSubmit(valueRef.current);
			inputRef.current?.blur();
		}
	};

	useEffect(() => {
		const inputEl = inputRef.current!;
		inputEl.addEventListener('keydown', keyDownFn);

		return () => {
			inputEl.removeEventListener('keydown', keyDownFn);
		};
	}, []);

	return (
		<div className="search-bar-wrapper">
			<div className="search-bar">
				<input
					type="text"
					value={inputText}
					onChange={handleChange}
					ref={inputRef}
				/>
				<SearchIcon
					className="search-bar-icon"
					onClick={() => { props.onSubmit(valueRef.current); }}
				/>
			</div>
		</div>
	);

	/**
	 * Handles a change in the text field.
	 * @param evt The event object.
	 */
	function handleChange(e: any) {
		const str = e.target.value;
		setInputText(str);
	}
}

/**
 * Generates the promo level search URL based on the query.
 * @param query The search query.
 * @returns The generated URL.
 */
export function getPromoSearchUrl(query: string) {
	return `/promotion/search/${query !== '' ? encodeURIComponent(query) : '_'}`;
}

export default PromoSearchBar;
