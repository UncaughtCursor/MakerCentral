import { orderBy, QueryConstraint, where } from 'firebase/firestore/lite';
import React, { useState } from 'react';
import AppFrame from '@components/AppFrame';
import SelectInput from '../../src/components/pages/controls/SelectInput';
import LevelCategoryView from '../../src/components/pages/browser/LevelCategoryView';

const millisPerWeek = 604800000;
const weekAgo = new Date(Date.now() - millisPerWeek);

const levelBrowserSorts: {[x: string]: QueryConstraint[]} = {
	// FIXME: This query won't work; client-side workaround or cloud function
	'Most Popular This Week': [
		// where('timestamp', '>=', weekAgo),
		orderBy('numLikes', 'desc'),
	],
	Newest: [
		orderBy('timestamp', 'desc'),
	],
	'Most Popular of All Time': [
		orderBy('numLikes', 'desc'),
	],
};
const defaultSortName = Object.keys(levelBrowserSorts)[0];

/**
 * The user level browsing view.
 */
function LevelBrowser() {
	const [sort, setSort] = useState(levelBrowserSorts[defaultSortName]);
	const [sortName, setSortName] = useState(defaultSortName);
	return (
		<AppFrame>
			<h1>Level Gallery</h1>
			{/* FIXME: Timestamp query filter */}
			<SelectInput
				label="What kind of levels do you want to see?"
				choices={Object.keys(levelBrowserSorts)}
				initSelectedIndex={0}
				onSelect={(_, selectedSortName) => {
					setSort(levelBrowserSorts[selectedSortName]);
					setSortName(selectedSortName);
				}}
			/>
			<LevelCategoryView
				title={sortName}
				queryConstraints={sort}
				numEntries={10}
				doPaginate={false}
			/>
		</AppFrame>
	);
}

export default LevelBrowser;
