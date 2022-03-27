import AppFrame from '@components/AppFrame';
import Gate from '@components/main/Gate';
import { LevelSort } from '@components/pages/browser/LevelSortPicker';
import LevelCategoryView from '@components/pages/browser/LevelCategoryView';
import { auth, getUser } from '@scripts/site/FirebaseUtil';
import { onAuthStateChanged } from 'firebase/auth';
import { orderBy, where } from 'firebase/firestore/lite';
import React, { useState } from 'react';
import useUserInfo from '@components/hooks/useUserInfo';

/**
 * Page used for displaying the user's levels.
 */
function BookmarksPage() {
	const userInfo = useUserInfo();
	const user = userInfo !== null ? userInfo.user : null;

	const yourLevelsCategory: LevelSort = {
		name: 'Bookmarks',
		code: 'MISC',
		// eslint-disable-next-line react/jsx-no-useless-fragment
		icon: <></>,
		queryConstraints: [
			orderBy('bookmarkedTime', 'desc'),
		],
		queueType: 'None',
	};

	return (
		<AppFrame title="Bookmarks - Music Level Studio">
			<Gate requireEA={false} showLogout={false}>
				<h1>Your Bookmarks</h1>
				<LevelCategoryView
					category={yourLevelsCategory}
					batchSize={10}
					collectionPath={`users/${user === null ? 'null' : user.uid}/bookmarks`}
					isLink
				/>
			</Gate>
		</AppFrame>
	);
}

export default BookmarksPage;
