import useUserInfo from '@components/hooks/useUserInfo';
import React from 'react';
import LevelCollectionView from './LevelCollectionView';

/**
 * A feed for a the user's bookmarked levels.
 */
function BookmarkFeed() {
	const userInfo = useUserInfo();
	const user = userInfo !== null ? userInfo.user : null;

	if (user === null) {
		return null;
	}

	return (
		<LevelCollectionView
			collectionPath={`users/${user.uid}/bookmarks`}
			isLink
			batchSize={10}
		/>
	);
}

export default BookmarkFeed;
