import {
	doc,
	getDoc, orderBy, QueryConstraint, Timestamp, where,
} from 'firebase/firestore/lite';
import React, { useEffect, useState } from 'react';
import LevelSortPicker, { LevelSort, SortCode } from '@components/pages/browser/LevelSortPicker';
import HotIcon from '@mui/icons-material/Whatshot';
import NewIcon from '@mui/icons-material/FiberNew';
import WeekTopIcon from '@mui/icons-material/Star';
import AllTimeTopIcon from '@mui/icons-material/EmojiEvents';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import { patreonLink } from '@scripts/site/FirebaseUtil';
import { getPatronType } from '@scripts/site/UserDataScripts';
import LevelCategoryView from './LevelCategoryView';

const levelSorts: LevelSort[] = [
	{
		name: 'Popular',
		code: 'POPULAR',
		icon: <HotIcon />,
		queryConstraints: [
			orderBy('score', 'desc'),
		],
		queueType: 'Popular',
	},
	{
		name: 'New',
		code: 'NEW',
		icon: <NewIcon />,
		queryConstraints: [
			orderBy('uploadTime', 'desc'),
		],
		queueType: 'None',
	},
	{
		name: 'Top This Month',
		code: 'TOP_THIS_MONTH',
		icon: <WeekTopIcon />,
		queryConstraints: [
			orderBy('score', 'desc'),
		],
		queueType: 'Month',
	},
	{
		name: 'Top Ever',
		code: 'TOP_EVER',
		icon: <AllTimeTopIcon />,
		queryConstraints: [
			orderBy('score', 'desc'),
		],
		queueType: 'None',
	},
	{
		name: 'By Patrons',
		code: 'BY_PATRONS',
		icon: <LoyaltyIcon />,
		queryConstraints: [
			where('isByPatron', '==', true),
			orderBy('uploadTime', 'desc'),
		],
		queueType: 'None',
	},
];

/**
 * A feed for a specific category of level.
 * @param props The props:
 * * extraQueryConstraints: The query constraints to add to
 * the level queue in addition to the usual ones.
 */
function LevelCategoryFeed(props: {
	extraQueryConstraints: QueryConstraint[],
	excludedSortCodes?: SortCode[],
	usesArrayContains?: boolean,
}) {
	const [categoryIdx, setCategoryIdx] = useState(0);

	const usedLevelSorts = levelSorts.filter((sort) => {
		const sortUsesArrayContains = sort.queueType === 'Month' || sort.queueType === 'Popular';
		if (sortUsesArrayContains && props.usesArrayContains!) return false;

		if (props.excludedSortCodes!.includes(sort.code)) return false;

		return true;
	});

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

LevelCategoryFeed.defaultProps = {
	excludedSortCodes: [],
	usesArrayContains: false,
};

export default LevelCategoryFeed;
