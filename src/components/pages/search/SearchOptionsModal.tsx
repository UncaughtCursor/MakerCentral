import {
	defaultFilterSettings,
	SearchFilterSettings,
	SearchMode,
	SearchOptionsTemplate,
	sortOrders,
} from '@scripts/browser/SearchUtil';
import React, { useEffect, useState } from 'react';
import SelectInput from '../controls/SelectInput';
import TriggerButton from '../controls/TriggerButton';

/**
 * Settings for the level search feature.
 * @param props The props:
 * * template The template to use that determines the options.
 * * searchMode: The current search mode to use.
 * * initSettings: The initial settings to use.
 * * onChange: The function to execute whenever the settings to change.
 * * onClose: The function to execute whenever the settings are closed.
 */
function SearchOptionsModal(props: {
	template: SearchOptionsTemplate;
	searchMode: SearchMode;
	initSettings: SearchFilterSettings,
	onChange: (settings: SearchFilterSettings) => void,
	onClose: () => void,
}) {
	const [settings, setSettings] = useState(props.initSettings);

	useEffect(reset, [props.searchMode]);

	return (
		<div className="search-settings">
			<h3>Filters</h3>
			<div className="search-settings-dropdown-container">
				{props.template.filterOptions.filter(
					(filter) => filter.userVisible === true || filter.userVisible === undefined,
				)
					.map((option) => (
						<SelectInput
							key={option.property}
							label={option.label}
							choices={option.options as string[]}
							initSelectedIndex={option.options.indexOf(props.initSettings[option.property])}
							onSelect={(index) => {
								const newSettings: SearchFilterSettings = {
									...settings,
									[option.property]: option.options[index],
								};
								setSettings(newSettings);
								props.onChange(newSettings);
							}}
							selectedIndex={option.options.indexOf(settings[option.property])}
						/>
					))}
			</div>
			<h3>Sort</h3>
			<div className="search-settings-dropdown-container">
				<SelectInput
					label="Sort Type"
					choices={props.template.sortOptions.map((option) => option.label)}
					initSelectedIndex={props.template.sortOptions.findIndex(
						(option) => option.label === props.initSettings.sortType,
					)}
					onSelect={(idx) => {
						const newSettings: SearchFilterSettings = {
							...settings,
							sortType: props.template.sortOptions[idx].label,
						};
						setSettings(newSettings);
						props.onChange(newSettings);
					}}
					selectedIndex={props.template.sortOptions.findIndex(
						(option) => option.label === settings.sortType,
					)}
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
					onClick={reset}
				/>
			</div>
		</div>
	);

	/**
	 * Resets the settings to the default values.
	 */
	function reset() {
		console.log(JSON.stringify(props.searchMode));
		setSettings(defaultFilterSettings[props.searchMode]);
		props.onChange(defaultFilterSettings[props.searchMode]);
	}
}

export default SearchOptionsModal;
