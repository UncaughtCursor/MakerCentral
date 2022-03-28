import { db } from '@scripts/site/FirebaseUtil';
import { doc, getDoc } from 'firebase/firestore/lite';
import TimeAgo from 'javascript-time-ago';
import Link from 'next/link';
import React, { ReactElement, useEffect, useState } from 'react';

export interface UserLevelMessage {
	uid: string;
	text: string;
	timestamp: number;
	points: number;
}

export interface UserLevelComment extends UserLevelMessage {
	replies: UserLevelMessage[];
}

interface CommentUserData {
	name: string,
	avatarUrl: string | undefined,
}

const timeAgo = new TimeAgo('en-us');

/**
 * Displays a comment.
 * @param props The props:
 * * comment: The comment data.
 * * isSignedIn: Whether or not the user is signed in.
 */
function Comment(props: {
	comment: UserLevelMessage | UserLevelComment,
	isSignedIn: boolean,
}) {
	const isTopLevel = typeof (props.comment as any).replies !== 'undefined';

	const [userData, setUserData] = useState(null as CommentUserData | null);
	const [replyElements, setReplyElements] = useState([] as ReactElement[]);

	useEffect(() => {
		(async () => {
			// Load and set user data
			const fetchedUserData = (await getDoc(doc(db, `/users/${props.comment.uid}`))).data();
			if (fetchedUserData === undefined) {
				setUserData({
					name: 'Deleted',
					avatarUrl: '',
				});
			} else {
				setUserData({
					name: fetchedUserData.name,
					avatarUrl: fetchedUserData.avatarUrl,
				});
			}

			// Load replies
			if (isTopLevel) {
				setReplyElements((props.comment as UserLevelComment).replies.map((reply) => (
					<Comment comment={reply} isSignedIn={props.isSignedIn} />
				)));
			}
		})();
	}, [props.comment]);

	if (userData === null) {
		return (
			<div>
				<span>Loading...</span>
			</div>
		);
	}

	const commentContent = (
		<>
			<div className="comment-container">
				<div className="comment-head">
					<Link href={`/users/${props.comment.uid}`}>
						<img
							src={userData.avatarUrl}
							alt={userData.name}
							style={{
								display: userData.avatarUrl !== '' && userData.avatarUrl !== undefined ? '' : 'none',
							}}
						/>
					</Link>
					<div className="comment-name-container">
						<span>
							<Link href={`/users/${props.comment.uid}`}>{userData.name}</Link>
						</span>
						<span>{timeAgo.format(new Date(props.comment.timestamp))}</span>
					</div>
				</div>
				<div className="comment-content">
					<p>{props.comment.text}</p>
				</div>
				<div className="comment-controls">
					{/* Buttons */}
				</div>
			</div>
			{replyElements}
		</>
	);

	if (isTopLevel) {
		return (
			<div className="comment-thread">
				{commentContent}
			</div>
		);
	}

	return (
		<div className="comment-reply-container">
			{commentContent}
		</div>
	);
}

Comment.defaultProps = {
	docIdPath: '',
};

export default Comment;
