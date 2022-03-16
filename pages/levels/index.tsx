import {
	doc,
	getDoc, orderBy, QueryConstraint, Timestamp, where,
} from 'firebase/firestore/lite';
import React, { useEffect, useState } from 'react';
import AppFrame from '@components/AppFrame';
import LevelCategoryPicker, { LevelCategory } from '@components/pages/browser/LevelCategoryPicker';
import HotIcon from '@mui/icons-material/Whatshot';
import NewIcon from '@mui/icons-material/FiberNew';
import WeekTopIcon from '@mui/icons-material/Star';
import AllTimeTopIcon from '@mui/icons-material/EmojiEvents';
import ActionButton from '@components/pages/controls/ActionButton';
import WarningIcon from '@mui/icons-material/Warning';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import { auth, db, getUser } from '@scripts/site/FirebaseUtil';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getPatronType } from '@scripts/site/UserDataScripts';
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
			where('isByPatron', '==', true),
			orderBy('uploadTime', 'desc'),
		],
		queueType: 'None',
	},
] as LevelCategory[];

const normalUploadDelayHr = 3;
const patronUploadDelayHr = 2;

/**
 * The user level browsing view.
 */
function LevelBrowser() {
	const [categoryIdx, setCategoryIdx] = useState(0);
	const category = levelCategories[categoryIdx];

	const [timeUntilUpload, setTimeUntilUpload] = useState(Infinity);
	const [user, setUser] = useState(null as User | null);

	const getLevelUploadablityStatus = (async () => {
		if (user === null) return;

		const socialDocSnap = await getDoc(doc(db, `users/${user.uid}/priv/social`));
		const lastUploadTimestamp = socialDocSnap.data()!.lastLevelUploadTime as Timestamp;

		const lastUploadTime = lastUploadTimestamp.toDate().getTime();
		const patronStatus = getPatronType();
		const waitTimeMs = (patronStatus === 'None' || patronStatus === null
			? normalUploadDelayHr : patronUploadDelayHr) * 60 * 60 * 1000;
		const nextAvailUploadTime = lastUploadTime + waitTimeMs;

		setTimeUntilUpload(nextAvailUploadTime - Date.now());
	});

	useEffect(() => {
		getLevelUploadablityStatus();

		onAuthStateChanged(auth, (authUser) => {
			setUser(authUser);
		});

		if (typeof window !== 'undefined') {
			window.addEventListener('userinit', getLevelUploadablityStatus);
		}
		return () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('userinit', getLevelUploadablityStatus);
			}
		};
	}, [user]);

	const msPerHr = 1000 * 60 * 60;
	const hrsUntilNextUpload = Math.floor(timeUntilUpload / msPerHr);
	const minsUntilNextUpload = Math.floor(((timeUntilUpload / msPerHr) - hrsUntilNextUpload) * 60);

	return (
		<AppFrame>
			<div style={{
				display: 'flex',
				flexDirection: 'column',
			}}
			>
				<div style={{ marginTop: '20px', display: timeUntilUpload <= 0 ? '' : 'none' }}>
					<ActionButton to="/levels/upload" text="Upload a Level" />
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
