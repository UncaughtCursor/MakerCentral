import AppFrame from '@components/AppFrame';
import Gate from '@components/main/Gate';
import { LevelCategory } from '@components/pages/browser/LevelCategoryPicker';
import LevelCategoryView from '@components/pages/browser/LevelCategoryView';
import { auth, getUser } from '@scripts/site/FirebaseUtil';
import { onAuthStateChanged } from 'firebase/auth';
import { orderBy, where } from 'firebase/firestore/lite';
import React, { useState } from 'react';

/**
 * Page used for displaying the user's levels.
 */
function YourLevelsPage() {
	const [user, setUser] = useState(getUser());

	onAuthStateChanged(auth, (authUser) => {
		setUser(authUser);
	});

	const yourLevelsCategory: LevelCategory = {
		name: 'Yours',
		// eslint-disable-next-line react/jsx-no-useless-fragment
		icon: <></>,
		queryConstraints: [
			where('makerUid', '==', user === null ? '' : user.uid),
			orderBy('uploadTime', 'desc'),
		],
		queueType: 'None',
	};

	return (
		<AppFrame>
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
