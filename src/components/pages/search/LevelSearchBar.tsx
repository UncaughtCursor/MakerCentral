import React, { useEffect, useRef, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { MakerCentralLevel, MakerCentralTag } from '@scripts/browser/BrowserUtil';
import Dialog from '@components/main/Dialog';
import { searchLevels } from '@scripts/browser/MeilisearchUtil';
import LevelSearchOptions from './LevelSearchOptions';

const SMM2GameStyles = [
	'SMB1', 'SMB3', 'SMW', 'NSMBU', 'SM3DW',
] as const;
export type SMM2GameStyle = typeof SMM2GameStyles[number];

const SMM2Themes = [
	'Overworld', 'Underground',
	'Castle', 'Airship',
	'Underwater', 'Ghost house',
	'Snow', 'Desert',
	'Sky', 'Forest',
] as const;
export type SMM2Theme = typeof SMM2Themes[number];

const SMM2Difficulties = [
	'Easy', 'Normal', 'Expert', 'Super expert',
] as const;
export type SMM2Difficulty = typeof SMM2Difficulties[number];

const sortSettings = [
	'By Likes', 'By Date', 'By Clear Rate',
] as const;
type SortSetting = typeof sortSettings[number];

export interface SearchFilterSettings {
	sortType: SortSetting;
	sortOrder: 'Ascending' | 'Descending';
	difficulty: SMM2Difficulty | null;
	theme: SMM2Theme | null;
	tags: MakerCentralTag[];
}

interface SearchBarProps {
	initialVal: string;
	onSubmit: (value: string, filterSettings: SearchFilterSettings) => void;
}

export const defaultFilterSettings: SearchFilterSettings = {
	sortType: 'By Likes',
	sortOrder: 'Descending',
	difficulty: null,
	theme: null,
	tags: [],
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

	const [open, setOpen] = useState(false);

	const keyDownFn = (evt: KeyboardEvent) => {
		if (evt.key === 'Enter') props.onSubmit(valueRef.current, filterSettingsRef.current);
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
				open={open}
				onCloseEvent={() => { setOpen(false); }}
			>
				<LevelSearchOptions onChange={(settings) => { setFilterSettings(settings); }} />
			</Dialog>
			<div className="search-bar">
				<input
					type="text"
					value={value}
					onChange={handleChange}
					ref={inputRef}
				/>
				<FilterListIcon className="search-bar-icon" onClick={() => { setOpen(true); }} />
				<SearchIcon
					className="search-bar-icon"
					onClick={() => { props.onSubmit(valueRef.current, filterSettingsRef.current); }}
				/>
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
	}
}

export default LevelSearchBar;
