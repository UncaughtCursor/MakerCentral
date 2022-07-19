/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useRef, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import Dialog from '@components/main/Dialog';
import { getSuggestions } from '@scripts/browser/MeilisearchUtil';
import {
	defaultFilterSettings, SearchFilterSettings, levelSearchTemplate,
	SearchModes, userSearchTemplate, worldSearchTemplate,
} from '@scripts/browser/SearchUtil';
import SearchOptionsModal from './SearchOptionsModal';
import SelectInput from '../controls/SelectInput';

interface SearchBarProps {
	initialVal: string;
	initialSettings: SearchFilterSettings;
	onSubmit: (value: string, filterSettings: SearchFilterSettings) => void;
}

/**
 * A text field input.
 * @param props.label The text to display.
 * @param props.onChange The callback function to be called when the input text is changed.
 */
function LevelSearchBar(props: SearchBarProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const valueRef = useRef<string>('');
	const [inputText, setInputText] = useState(props.initialVal);
	valueRef.current = inputText;

	const filterSettingsRef = useRef<SearchFilterSettings>(props.initialSettings);
	const [filterSettings, setFilterSettings] =	useState<SearchFilterSettings>(
		{
			...props.initialSettings,
			page: 0,
		},
	);
	filterSettingsRef.current = filterSettings;

	const numberOfNonDefaultSettings = Object.entries(filterSettings)
		.filter(([key]) => key !== 'page' && key !== 'searchMode')
		.reduce((acc, [key, value]) => {
			if (value !== defaultFilterSettings[key as keyof SearchFilterSettings]) {
				return acc + 1;
			}
			return acc;
		}, 0);

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

	const optionsTemplate = (() => {
		switch (filterSettings.searchMode) {
		case 'Level': return levelSearchTemplate;
		case 'User': return userSearchTemplate;
		case 'World': return worldSearchTemplate;
		default: return levelSearchTemplate;
		}
	})();

	return (
		<>
			<Dialog
				title="Search Options"
				open={isDialogOpen}
				onCloseEvent={() => { setDialogOpen(false); }}
			>
				<SearchOptionsModal
					template={optionsTemplate}
					initSettings={props.initialSettings}
					onChange={(settings) => {
						setFilterSettings({
							...settings,
							page: 0,
						});
						props.onSubmit(valueRef.current, settings);
					}}
					onClose={() => { setDialogOpen(false); }}
				/>
			</Dialog>
			<div className="search-bar-wrapper">
				<div className={`search-bar${suggestions.length > 0 && isFocused ? ' open' : ''}`}>
					<input
						type="text"
						value={inputText}
						onChange={handleChange}
						ref={inputRef}
						onFocus={() => { setIsFocused(true); }}
						onBlur={() => { setIsFocused(false); }}
					/>
					<SelectInput
						initSelectedIndex={0}
						choices={SearchModes}
						onSelect={(index) => {
							setFilterSettings({
								...filterSettings,
								searchMode: SearchModes[index],
							});
						}}
					/>
					<div style={{
						position: 'relative',
						height: '34px',
					}}
					>
						<div
							className="count-badge"
							style={{
								display: numberOfNonDefaultSettings > 0 ? '' : 'none',
							}}
						>
							<span>{numberOfNonDefaultSettings}</span>
						</div>
						<FilterListIcon className="search-bar-icon" onClick={() => { setDialogOpen(true); }} />
					</div>
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
								setInputText(suggestion);
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
		setInputText(str);
		if (str !== '') {
			getSuggestions(str).then((foundSuggestions) => {
				setSuggestions(foundSuggestions);
			});
		} else setSuggestions([]);
	}
}

/**
 * Generates the search URL based on the query and the filter settings.
 * @param query The search query.
 * @param filterSettings The filter settings.
 * @returns The generated URL.
 */
export function getSearchUrl(query: string, filterSettings: SearchFilterSettings) {
	const root = `/levels/search/${query !== '' ? query : '_'}`;

	const segments = Object.keys(filterSettings)
		.filter((filterName) => {
			const name = filterName as keyof typeof filterSettings;
			return filterSettings[name] !== defaultFilterSettings[name];
		})
		.map((filterName) => `${filterName}=${filterSettings[filterName as keyof typeof filterSettings]}`);

	return `${root}${segments.length > 0 ? '?' : ''}${segments.join('&')}`;
}

export default LevelSearchBar;
