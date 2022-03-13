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
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import LevelCategoryView from '../../src/components/pages/browser/LevelCategoryView';

const levelCategories = [
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
			orderBy('uploadTime', 'desc'), // FIXME: Sort patrons
		],
		queueType: 'None',
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
					batchSize={10}
				/>
			</div>
		</AppFrame>
	);
}

export default LevelBrowser;
