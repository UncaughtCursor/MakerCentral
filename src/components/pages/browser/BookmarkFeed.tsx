import useUserInfo from '@components/hooks/useUserInfo';
import React from 'react';
import LevelCollectionView from './LevelCollectionView';

/**
 * A feed for a the user's bookmarked levels.
 */
function BookmarkFeed(props: {
	debugUid?: string | undefined;
}) {
	const userInfo = useUserInfo();
	const user = userInfo !== null ? userInfo.user : null;

	if (user === null) {
		return null;
	}

	return (
		<LevelCollectionView
			collectionPath={`users/${props.debugUid ? props.debugUid : user.uid}/bookmarks`}
			isLink
			batchSize={10}
		/>
	);
}

BookmarkFeed.defaultProps = {
	debugUid: undefined,
};

export default BookmarkFeed;
