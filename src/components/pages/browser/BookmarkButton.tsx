import React, { ReactNode, useEffect, useState } from 'react';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { auth, db, getUser } from '@scripts/site/FirebaseUtil';
import { onAuthStateChanged } from 'firebase/auth';
import {
	deleteDoc, doc, getDoc, serverTimestamp, setDoc,
} from 'firebase/firestore/lite';
import useUserInfo from '@components/hooks/useUserInfo';
import { MCLevelDocData } from '@data/types/MCBrowserTypes';

/**
 * A button used for bookmarking levels. Must be inside a relatively-positioned element.
 * @param props The props:
 * * levelId: The level data to bookmark.
 * * left: The left CSS property.
 * * top: The top CSS property.
 * * style: The style object to pass to the button.
 */
function BookmarkButton(props: {
	level: MCLevelDocData,
	left?: string,
	top?: string,
	style?: React.CSSProperties,
}) {
	const [bookmarked, setBookmarked] = useState('Loading' as boolean | 'Loading');
	const userInfo = useUserInfo();
	const user = userInfo !== null ? userInfo.user : null;

	let icon: ReactNode;
	if (bookmarked === 'Loading') icon = <MoreHorizIcon />;
	else if (bookmarked) icon = <BookmarkIcon />;
	else icon = <BookmarkBorderIcon />;

	const bookmarkDoc = user !== null
		? doc(db, `users/${user.uid}/bookmarks/${props.level.id}`) : null;

	useEffect(() => {
		fetchBookmarkStatus();
	}, [user]);

	// eslint-disable-next-line react/jsx-no-useless-fragment
	if (user === null) return <></>;

	return (
		<div
			className="bookmark-button"
			style={{
				left: props.left,
				top: props.top,
				...props.style,
			}}
			onClick={() => {
				setBookmarkStatus(!bookmarked);
			}}
			onKeyDown={() => {
				setBookmarkStatus(!bookmarked);
			}}
			role="button"
			tabIndex={0}
			title="Bookmark Level"
		>
			{icon}
		</div>
	);

	/**
	 * Fetches the latest bookmark status.
	 */
	async function fetchBookmarkStatus() {
		if (bookmarkDoc === null) {
			setBookmarked(false);
			return;
		}

		const bookmarkSnap = await getDoc(bookmarkDoc);
		setBookmarked(bookmarkSnap.exists());
	}

	/**
	 * Sets the new bookmark state.
	 * @param status Whether or not the level is bookmarked.
	 */
	async function setBookmarkStatus(status: boolean) {
		if (status === bookmarked || bookmarkDoc === null) {
			return;
		}
		setBookmarked('Loading');

		try {
			if (status) {
				await setDoc(bookmarkDoc, {
					bookmarkedTime: serverTimestamp(),
				});
			} else {
				await deleteDoc(bookmarkDoc);
			}
			setBookmarked(status);
		} catch (e) {
			// eslint-disable-next-line no-alert
			alert('An error occurred while attempting to set the bookmark status.');
			console.error(e);
		}
	}
}

BookmarkButton.defaultProps = {
	left: '0px',
	top: '0px',
	style: {},
};

export default BookmarkButton;
