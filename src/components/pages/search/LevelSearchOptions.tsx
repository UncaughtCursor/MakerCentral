import React, { useState } from 'react';
import { defaultFilterSettings, SearchFilterSettings } from './LevelSearchBar';

function LevelSearchOptions(props: {
	onChange: (settings: SearchFilterSettings) => void,
}) {
	const [settings, setSettings] = useState<SearchFilterSettings>(defaultFilterSettings);

	return (
		<div>
			<p>Settings go here</p>
		</div>
	);
}

export default LevelSearchOptions;
