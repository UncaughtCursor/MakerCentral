/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useRef, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Difficulty, MakerCentralTag } from '@scripts/browser/BrowserUtil';
import Dialog from '@components/main/Dialog';
import { getSuggestions } from '@scripts/browser/MeilisearchUtil';
import LevelSearchOptions from './LevelSearchOptions';

export const SMM2GameStyles = [
	'SMB1', 'SMB3', 'SMW', 'NSMBU', 'SM3DW',
] as const;
export type SMM2GameStyle = typeof SMM2GameStyles[number];

export const SMM2Themes = [
	'Overworld', 'Underground',
	'Castle', 'Airship',
	'Underwater', 'Ghost house',
	'Snow', 'Desert',
	'Sky', 'Forest',
] as const;
export type SMM2Theme = typeof SMM2Themes[number];

export const sortTypes = [
	'By Likes', 'By Date', 'By Clear Rate',
] as const;
type SortType = typeof sortTypes[number];

export interface SearchFilterSettings {
	sortType: SortType;
	sortOrder: 'Ascending' | 'Descending';
	difficulty: Difficulty | 'Any';
	theme: SMM2Theme | 'Any';
	gameStyle: SMM2GameStyle | 'Any';
	tag: MakerCentralTag | 'Any';
}

interface SearchBarProps {
	initialVal: string;
	onSubmit: (value: string, filterSettings: SearchFilterSettings) => void;
}

export const defaultFilterSettings: SearchFilterSettings = {
	sortType: 'By Likes',
	sortOrder: 'Descending',
	difficulty: 'Any',
	theme: 'Any',
	gameStyle: 'Any',
	tag: 'Any',
};

/**
 * A text field input.
 * @param props.label The text to display.
 * @param props.onChange The callback function to be called when the input text is changed.
 */
function LevelSearchBar(props: SearchBarProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const valueRef = useRef<string>('');
	const [value, setValue] = useState(props.initialVal);
	valueRef.current = value;

	const filterSettingsRef = useRef<SearchFilterSettings>(defaultFilterSettings);
	const [filterSettings, setFilterSettings] =	useState<SearchFilterSettings>(
		defaultFilterSettings,
	);
	filterSettingsRef.current = filterSettings;

	const [isDialogOpen, setDialogOpen] = useState(false);
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [isFocused, setIsFocused] = useState(false);

	const keyDownFn = (evt: KeyboardEvent) => {
		if (evt.key === 'Enter') {
			props.onSubmit(valueRef.current, filterSettingsRef.current);
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
		<>
			<Dialog
				title="Search Options"
				open={isDialogOpen}
				onCloseEvent={() => { setDialogOpen(false); }}
			>
				<LevelSearchOptions
					initSettings={defaultFilterSettings}
					onChange={(settings) => { setFilterSettings(settings); }}
					onClose={() => { setDialogOpen(false); }}
				/>
			</Dialog>
			<div className="search-bar-wrapper">
				<div className={`search-bar${suggestions.length > 0 && isFocused ? ' open' : ''}`}>
					<input
						type="text"
						value={value}
						onChange={handleChange}
						ref={inputRef}
						onFocus={() => { setIsFocused(true); }}
						onBlur={() => { setIsFocused(false); }}
					/>
					<FilterListIcon className="search-bar-icon" onClick={() => { setDialogOpen(true); }} />
					<SearchIcon
						className="search-bar-icon"
						onClick={() => { props.onSubmit(valueRef.current, filterSettingsRef.current); }}
					/>
				</div>
				<div
					className="search-suggestion-container"
					style={{
						display: suggestions.length > 0 && isFocused ? '' : 'none',
					}}
				>
					{suggestions.map((suggestion, i) => (
						<span
							onMouseDown={(evt) => {
								evt.preventDefault();
							}}
							onClick={() => {
								props.onSubmit(suggestion, filterSettingsRef.current);
								inputRef.current?.blur();
								setValue(suggestion);
							}}
							role="search"
							tabIndex={i}
						>{suggestion}
						</span>
					))}
				</div>
			</div>
		</>
	);

	/**
	 * Handles a change in the text field.
	 * @param evt The event object.
	 */
	function handleChange(e: any) {
		const str = e.target.value;
		setValue(str);
		if (str !== '') {
			getSuggestions(str).then((foundSuggestions) => {
				setSuggestions(foundSuggestions);
			});
		} else setSuggestions([]);
	}
}

export default LevelSearchBar;
