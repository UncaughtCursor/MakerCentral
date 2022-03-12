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
function BookmarksPage() {
	const [user, setUser] = useState(getUser());

	onAuthStateChanged(auth, (authUser) => {
		setUser(authUser);
	});

	const yourLevelsCategory: LevelCategory = {
		name: 'Bookmarks',
		// eslint-disable-next-line react/jsx-no-useless-fragment
		icon: <></>,
		queryConstraints: [
			orderBy('bookmarkedTime', 'desc'),
		],
		queueType: 'None',
	};

	return (
		<AppFrame>
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
