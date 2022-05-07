import {
	doc,
	getDoc, orderBy, QueryConstraint, Timestamp, where,
} from 'firebase/firestore/lite';
import React, { useEffect, useState } from 'react';
import AppFrame from '@components/AppFrame';
import LevelSortPicker, { LevelSort } from '@components/pages/browser/LevelSortPicker';
import HotIcon from '@mui/icons-material/Whatshot';
import NewIcon from '@mui/icons-material/FiberNew';
import WeekTopIcon from '@mui/icons-material/Star';
import AllTimeTopIcon from '@mui/icons-material/EmojiEvents';
import ActionButton from '@components/pages/controls/ActionButton';
import WarningIcon from '@mui/icons-material/Warning';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import {
	auth, db, getUser, patreonLink,
} from '@scripts/site/FirebaseUtil';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getPatronType } from '@scripts/site/UserDataScripts';
import { getPatronStatus } from 'functions/src';
import TriggerButton from '@components/pages/controls/TriggerButton';
import LevelCategoryFeed from '@components/pages/browser/LevelCategoryFeed';
import useUserInfo from '@components/hooks/useUserInfo';
import LevelSearchBar from '@components/pages/search/LevelSearchBar';

import LevelCategoryView from '../../src/components/pages/browser/LevelCategoryView';

const normalUploadDelayHr = 4;
const patronUploadDelayHr = 2;

/**
 * The user level browsing view.
 */
function LevelBrowser() {
	const [timeUntilUpload, setTimeUntilUpload] = useState(Infinity);
	const [searchString, setSearchString] = useState('');
	const userInfo = useUserInfo();
	const user = userInfo !== null ? userInfo.user : null;

	const getLevelUploadablityStatus = () => {
		(async () => {
			if (userInfo === null || user === null) return;

			const lastUploadTime = userInfo.lastLevelUploadTime;
			const patronStatus = userInfo.patronStatus;

			const waitTimeMs = (patronStatus === 'None' ? normalUploadDelayHr
				: patronUploadDelayHr) * 60 * 60 * 1000;
			const nextAvailUploadTime = lastUploadTime + waitTimeMs;

			setTimeUntilUpload(nextAvailUploadTime - Date.now());
		})();
	};

	useEffect(() => {
		getLevelUploadablityStatus();

		document.addEventListener('userinit', getLevelUploadablityStatus);

		return () => {
			document.removeEventListener('userinit', getLevelUploadablityStatus);
		};
	}, [user]);

	const msPerHr = 1000 * 60 * 60;
	const hrsUntilNextUpload = Math.floor(timeUntilUpload / msPerHr);
	const minsUntilNextUpload = Math.floor(((timeUntilUpload / msPerHr) - hrsUntilNextUpload) * 60);

	return (
		<AppFrame
			title="Levels - MakerCentral"
			description="Browse and play levels over 26 million Mario Maker 2 levels!"
		>
			<div style={{
				display: 'flex',
				flexDirection: 'column',
				marginTop: '100px',
			}}
			>
				<div style={{
					margin: '0 auto',
				}}
				>
					<img
						src="/logo.png"
						alt="MakerCentral Search"
						style={{
							width: '90vw',
							maxWidth: '400px',
						}}
					/>
					<h4 style={{
						marginTop: '4px',
						fontSize: '20px',
					}}
					>Search
					</h4>
					<br />
					<h4 style={{
						margin: '0',
						textAlign: 'left',
						marginLeft: '20px',
						marginBottom: '2px',
					}}
					>Search over 26 million levels...
					</h4>
					<LevelSearchBar
						onChange={(val) => {
							setSearchString(val);
						}}
						onSubmit={(query, filterSettings) => { console.log(query); }}
						value={searchString}
					/>
				</div>
				{/* <LevelCategoryFeed extraQueryConstraints={[]} /> */}
			</div>
		</AppFrame>
	);
}

export default LevelBrowser;
