import AppFrame from '@components/AppFrame';
import Gate from '@components/main/Gate';
import { LevelSort } from '@components/pages/browser/LevelSortPicker';
import LevelCategoryView from '@components/pages/browser/LevelCategoryView';
import { auth, getUser } from '@scripts/site/FirebaseUtil';
import { onAuthStateChanged } from 'firebase/auth';
import { orderBy, where } from 'firebase/firestore/lite';
import React from 'react';
import useUserInfo from '@components/hooks/useUserInfo';

/**
 * Page used for displaying the user's levels.
 */
function YourLevelsPage() {
	const userInfo = useUserInfo();
	const user = userInfo !== null ? userInfo.user : null;

	const yourLevelsCategory: LevelSort = {
		name: 'Yours',
		code: 'MISC',
		// eslint-disable-next-line react/jsx-no-useless-fragment
		icon: <></>,
		queryConstraints: [
			where('makerUid', '==', user === null ? '' : user.uid),
			orderBy('uploadTime', 'desc'),
		],
		queueType: 'None',
	};

	return (
		<AppFrame title="Your Levels - Music Level Studio">
			<Gate requireEA={false} showLogout={false}>
				<h1>Your Levels</h1>
				<LevelCategoryView
					category={yourLevelsCategory}
					batchSize={10}
				/>
			</Gate>
		</AppFrame>
	);
}

export default YourLevelsPage;
