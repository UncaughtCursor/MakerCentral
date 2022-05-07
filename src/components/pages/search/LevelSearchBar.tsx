import React, { useState } from 'react';
import SearchBar from '../controls/SearchBar';

/**
 * A search bar used to conduct a level search.
 * @param props The props:
 * * onSubmit: The function to execute when a search query is submitted.
 * Takes the query string as input.
 */
function LevelSearchBar(props: {
	onSubmit: (query: string) => void,
}) {
	const [searchString, setSearchString] = useState('');
	return (
		<div style={{
			margin: '0 auto',
		}}
		>
			<h3>Search over 26 million levels...</h3>
			<SearchBar
				onChange={(val) => {
					setSearchString(val);
				}}
				onSubmit={props.onSubmit}
				value={searchString}
			/>
		</div>
	);
}

export default LevelSearchBar;
