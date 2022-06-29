import AppFrame from '@components/AppFrame';
import Gate from '@components/main/Gate';
import { LevelSort } from '@components/pages/browser/LevelSortPicker';
import LevelCollectionView from '@components/pages/browser/LevelCollectionView';
import { auth, getUser } from '@scripts/site/FirebaseUtil';
import { onAuthStateChanged } from 'firebase/auth';
import { orderBy, where } from 'firebase/firestore/lite';
import React, { useState } from 'react';
import useUserInfo from '@components/hooks/useUserInfo';
import BookmarkFeed from '@components/pages/browser/BookmarkFeed';

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
		<AppFrame title="Bookmarks - MakerCentral">
			<Gate requireEA={false} showLogout={false}>
				<h1>Your Bookmarks</h1>
				<BookmarkFeed />
			</Gate>
		</AppFrame>
	);
}

export default BookmarksPage;
