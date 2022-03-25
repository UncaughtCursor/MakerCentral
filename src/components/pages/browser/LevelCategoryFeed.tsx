import {
	doc,
	getDoc, orderBy, QueryConstraint, Timestamp, where,
} from 'firebase/firestore/lite';
import React, { useEffect, useState } from 'react';
import LevelSortPicker, { LevelSort } from '@components/pages/browser/LevelSortPicker';
import HotIcon from '@mui/icons-material/Whatshot';
import NewIcon from '@mui/icons-material/FiberNew';
import WeekTopIcon from '@mui/icons-material/Star';
import AllTimeTopIcon from '@mui/icons-material/EmojiEvents';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import { patreonLink } from '@scripts/site/FirebaseUtil';
import { getPatronType } from '@scripts/site/UserDataScripts';
import LevelCategoryView from './LevelCategoryView';

const levelSorts = [
	{
		name: 'Popular',
		icon: <HotIcon />,
		queryConstraints: [
			orderBy('score', 'desc'),
		],
		queueType: 'Popular',
	},
	{
		name: 'New',
		icon: <NewIcon />,
		queryConstraints: [
			orderBy('uploadTime', 'desc'),
		],
		queueType: 'None',
	},
	{
		name: 'Top This Month',
		icon: <WeekTopIcon />,
		queryConstraints: [
			orderBy('score', 'desc'),
		],
		queueType: 'Month',
	},
	{
		name: 'Top Ever',
		icon: <AllTimeTopIcon />,
		queryConstraints: [
			orderBy('score', 'desc'),
		],
		queueType: 'None',
	},
	{
		name: 'By Patrons',
		icon: <LoyaltyIcon />,
		queryConstraints: [
			where('isByPatron', '==', true),
			orderBy('uploadTime', 'desc'),
		],
		queueType: 'None',
	},
] as LevelSort[];

/**
 * A feed for a specific category of level.
 * @param props The props:
 * * extraQueryConstraints: The query constraints to add to
 * the level queue in addition to the usual ones.
 */
function LevelCategoryFeed(props: {
	extraQueryConstraints: QueryConstraint[],
}) {
	const [categoryIdx, setCategoryIdx] = useState(0);
	const usedLevelSorts = props.extraQueryConstraints.length === 0 ? levelSorts : levelSorts.filter((sort) => sort.queueType === 'None');

	const category: LevelSort = {
		...usedLevelSorts[categoryIdx],
		queryConstraints: [
			...usedLevelSorts[categoryIdx].queryConstraints,
			...props.extraQueryConstraints,
		],
	};
	return (
		<div>
			<LevelSortPicker
				categories={usedLevelSorts}
				selectedIndex={categoryIdx}
				onChange={setCategoryIdx}
			/>
			<div>
				<p style={{ display: (category.name === 'By Patrons' && getPatronType() !== 'Super Star') ? '' : 'none' }}>
					You can have your level showcased here if you support me on <a href={patreonLink}>Patreon</a>!
					New levels by Super Star tier patrons will show up here.
				</p>
			</div>
			<LevelCategoryView
				category={category}
				batchSize={10}
			/>
		</div>
	);
}

export default LevelCategoryFeed;
