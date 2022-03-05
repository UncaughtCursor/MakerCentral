import React from 'react';

/**
 * A group of settings with a topic name. Holds the setting controls as children.
 * @param props The props:
 * props.name: The name of the settings group.
 */
function SettingsGroup(props: {
	name: string,
	children: React.ReactNode
}) {
	return (
		<div className="settings-group">
			<h3>{props.name}</h3>
			{props.children}
		</div>
	);
}

export default SettingsGroup;
