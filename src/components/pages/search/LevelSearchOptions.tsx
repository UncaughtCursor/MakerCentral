import {
	MCDifficulties, MCGameStyles, MCTag, MCTags, MCThemes,
} from '@data/types/MCBrowserTypes';
import React, { useState } from 'react';
import SelectInput from '../controls/SelectInput';
import TriggerButton from '../controls/TriggerButton';
import {
	defaultFilterSettings,
	SearchFilterSettings, sortTypes,
} from './LevelSearchBar';

const MCTagOptions: MCTag[] = [
	'Auto',
	'Autoscroll',
	'Boss Fight',
	'Link',
	'Multiplayer',
	'Music',
	'One Player Only',
	'Pixel Art',
	'Puzzle',
	'Shooter',
	'Short',
	'Speedrun',
	'Standard',
	'Technical',
	'Themed',
];

/**
 * Settings for the level search feature.
 * @param props The props:
 * * initSettings: The initial settings to use.
 * * onChange: The function to execute whenever the settings to change.
 * * onClose: The function to execute whenever the settings are closed.
 */
function LevelSearchOptions(props: {
	initSettings: SearchFilterSettings,
	onChange: (settings: SearchFilterSettings) => void,
	onClose: () => void,
}) {
	const [settings, setSettings] = useState(props.initSettings);

	const sortOrders = ['Ascending', 'Descending'] as const;
	const themeOptions = ['Any', ...MCThemes] as const;
	const difficultyOptions = ['Any', ...MCDifficulties] as const;
	const gameStyleOptions = ['Any', ...MCGameStyles] as const;
	const tagOptions = ['Any', ...MCTagOptions] as const;

	return (
		<div className="search-settings">
			<h3>Filters</h3>
			<div className="search-settings-dropdown-container">
				<SelectInput
					label="Game Style"
					choices={gameStyleOptions}
					initSelectedIndex={gameStyleOptions.indexOf(props.initSettings.gameStyle)}
					onSelect={(idx) => {
						const newSettings: SearchFilterSettings = {
							...settings,
							gameStyle: gameStyleOptions[idx],
						};
						setSettings(newSettings);
						props.onChange(newSettings);
					}}
					selectedIndex={gameStyleOptions.indexOf(settings.gameStyle)}
				/>
				<SelectInput
					label="Theme"
					choices={themeOptions}
					initSelectedIndex={themeOptions.indexOf(props.initSettings.theme)}
					onSelect={(idx) => {
						const newSettings: SearchFilterSettings = {
							...settings,
							theme: themeOptions[idx],
						};
						setSettings(newSettings);
						props.onChange(newSettings);
					}}
					selectedIndex={themeOptions.indexOf(settings.theme)}
				/>
				<SelectInput
					label="Difficulty"
					choices={difficultyOptions}
					initSelectedIndex={difficultyOptions.indexOf(props.initSettings.difficulty)}
					onSelect={(idx) => {
						const newSettings: SearchFilterSettings = {
							...settings,
							difficulty: difficultyOptions[idx],
						};
						setSettings(newSettings);
						props.onChange(newSettings);
					}}
					selectedIndex={difficultyOptions.indexOf(settings.difficulty)}
				/>
				<SelectInput
					label="Tag"
					choices={tagOptions}
					initSelectedIndex={tagOptions.indexOf(props.initSettings.tag)}
					onSelect={(idx) => {
						const newSettings: SearchFilterSettings = {
							...settings,
							tag: tagOptions[idx],
						};
						setSettings(newSettings);
						props.onChange(newSettings);
					}}
					selectedIndex={tagOptions.indexOf(settings.tag)}
				/>
			</div>
			<h3>Sort</h3>
			<div className="search-settings-dropdown-container">
				<SelectInput
					label="Sort Type"
					choices={sortTypes}
					initSelectedIndex={sortTypes.indexOf(props.initSettings.sortType)}
					onSelect={(idx) => {
						const newSettings: SearchFilterSettings = {
							...settings,
							sortType: sortTypes[idx],
						};
						setSettings(newSettings);
						props.onChange(newSettings);
					}}
					selectedIndex={sortTypes.indexOf(settings.sortType)}
				/>
				<SelectInput
					label="Sort Order"
					choices={sortOrders}
					initSelectedIndex={sortOrders.indexOf(props.initSettings.sortOrder)}
					onSelect={(idx) => {
						const newSettings: SearchFilterSettings = {
							...settings,
							sortOrder: sortOrders[idx],
						};
						setSettings(newSettings);
						props.onChange(newSettings);
					}}
					selectedIndex={sortOrders.indexOf(settings.sortOrder)}
				/>
			</div>
			<div style={{ margin: '25px 0' }}>
				<TriggerButton
					text="Done"
					type="blue"
					onClick={props.onClose}
				/>
				<TriggerButton
					text="Reset"
					type="dark"
					onClick={() => {
						setSettings(defaultFilterSettings);
						props.onChange(defaultFilterSettings);
					}}
				/>
			</div>
		</div>
	);
}

export default LevelSearchOptions;
