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
import LevelCategoryView from '../../src/components/pages/browser/LevelCategoryView';

const normalUploadDelayHr = 4;
const patronUploadDelayHr = 2;

/**
 * The user level browsing view.
 */
function LevelBrowser() {
	const [timeUntilUpload, setTimeUntilUpload] = useState(Infinity);
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
			<h1>Browse Levels</h1>
			<div style={{
				display: 'flex',
				flexDirection: 'column',
			}}
			>
				<div style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '15px',
					flexWrap: 'wrap',
				}}
				>
					<ActionButton
						text="Categories"
						to="/levels/categories"
						type="green"
					/>
					<ActionButton
						text="Leaderboard"
						to="/levels/leaderboards"
						type="purple"
					/>
					{/*<div style={{ display: timeUntilUpload <= 0 ? '' : 'none' }}>
						<ActionButton to="/levels/upload" text="Upload a Level" />
					</div>*/}
				</div>
				<div style={{
					display: timeUntilUpload <= 0
					|| timeUntilUpload === Infinity ? 'none' : '',
				}}
				>
					<p>You can upload your next level in&nbsp;
						<b>{hrsUntilNextUpload} hr {minsUntilNextUpload} min</b>.
					</p>
				</div>
				<div style={{ display: user === null ? '' : 'none' }}>
					<p>Want to add your own level? Log in or create an account in the upper right.</p>
				</div>
				<LevelCategoryFeed extraQueryConstraints={[]} />
			</div>
		</AppFrame>
	);
}

export default LevelBrowser;
