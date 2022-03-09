import { orderBy, QueryConstraint, where } from 'firebase/firestore/lite';
import React, { useState } from 'react';
import AppFrame from '@components/AppFrame';
import LevelCategoryPicker, { LevelCategory } from '@components/pages/browser/LevelCategoryPicker';
import HotIcon from '@mui/icons-material/Whatshot';
import NewIcon from '@mui/icons-material/FiberNew';
import WeekTopIcon from '@mui/icons-material/Star';
import AllTimeTopIcon from '@mui/icons-material/EmojiEvents';
import ActionButton from '@components/pages/controls/ActionButton';
import WarningIcon from '@mui/icons-material/Warning';
import LevelCategoryView from '../../src/components/pages/browser/LevelCategoryView';

const levelCategories = [
	{
		name: 'Popular',
		icon: <HotIcon />,
		queryConstraints: [
			orderBy('numLikesThisHour', 'desc'), // TODO: Implement in week queue
		],
		useWeekQueue: true,
	},
	{
		name: 'New',
		icon: <NewIcon />,
		queryConstraints: [
			orderBy('uploadTime', 'desc'),
		],
		useWeekQueue: false,
	},
	{
		name: 'Top This Week',
		icon: <WeekTopIcon />,
		queryConstraints: [
			orderBy('numLikes', 'desc'),
		],
		useWeekQueue: true,
	},
	{
		name: 'Top Ever',
		icon: <AllTimeTopIcon />,
		queryConstraints: [
			orderBy('numLikes', 'desc'),
		],
		useWeekQueue: false,
	},
] as LevelCategory[];

/**
 * The user level browsing view.
 */
function LevelBrowser() {
	const [categoryIdx, setCategoryIdx] = useState(0);
	const category = levelCategories[categoryIdx];
	return (
		<AppFrame>
			<div style={{
				display: 'flex',
				flexDirection: 'column',
			}}
			>
				<div style={{ marginTop: '20px' }}>
					<ActionButton to="/levels/upload" text="Upload a Level" />
				</div>
				<LevelCategoryPicker
					categories={levelCategories}
					selectedIndex={categoryIdx}
					onChange={setCategoryIdx}
				/>
				<LevelCategoryView
					category={category}
					numEntries={10}
					doPaginate={false}
				/>
			</div>
		</AppFrame>
	);
}

export default LevelBrowser;
