import ReportDialog from '@components/main/dialogs/ReportDialog';
import TextArea from '@components/pages/controls/TextArea';
import TriggerButton from '@components/pages/controls/TriggerButton';
import { db, functions } from '@scripts/site/FirebaseUtil';
import { doc, getDoc } from 'firebase/firestore/lite';
import { httpsCallable } from 'firebase/functions';
import TimeAgo from 'javascript-time-ago';
import Link from 'next/link';
import React, { ReactElement, useEffect, useState } from 'react';

export interface UserLevelMessage {
	uid: string;
	text: string;
	timestamp: number;
	points: number;
	id: string;
}

export interface UserLevelComment extends UserLevelMessage {
	replies: UserLevelMessage[];
}

interface CommentUserData {
	name: string;
	avatarUrl: string | undefined;
}

const timeAgo = new TimeAgo('en-us');

/**
 * Displays a comment.
 * @param props The props:
 * * comment: The comment data.
 * * pageId: The ID of the page.
 * * commentId: The ID of the comment.
 * * topCommentId: The ID of the thread's top-level comment.
 * * uid: The user's ID or null if logged out.
 */
function Comment(props: {
	comment: UserLevelMessage | UserLevelComment,
	pageId: string,
	commentId: string,
	topCommentId: string,
	uid: string | null,
}) {
	const isTopLevel = typeof (props.comment as any).replies !== 'undefined';

	const [userData, setUserData] = useState(null as CommentUserData | null);
	const [replyElements, setReplyElements] = useState([] as ReactElement[]);
	const [showReplyBox, setShowReplyBox] = useState(false);
	const [reply, setReply] = useState('');
	const [showReportDialog, setShowReportDialog] = useState(false);

	const isSignedIn = props.uid !== null;
	const isOwnComment = props.uid === props.comment.uid && isSignedIn;

	useEffect(() => {
		(async () => {
			// Load and set user data
			const fetchedUserData = (await getDoc(doc(db, `/users/${props.comment.uid}`))).data();
			if (fetchedUserData === undefined) {
				setUserData({
					name: 'Deleted',
					avatarUrl: '',
				});
				setReply('@Deleted ');
			} else {
				setUserData({
					name: fetchedUserData.name,
					avatarUrl: fetchedUserData.avatarUrl,
				});
				setReply(`@${fetchedUserData.name} `);
			}

			// Load replies
			if (isTopLevel) {
				setReplyElements((props.comment as UserLevelComment).replies.map((thisReply) => (
					<Comment
						comment={thisReply}
						pageId={props.pageId}
						commentId={thisReply.id}
						topCommentId={props.topCommentId}
						uid={props.uid}
					/>
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

	const commentPath = isTopLevel
		? `/levels/${props.pageId}/comments/${props.commentId}`
		: `/levels/${props.pageId}/comments/${props.topCommentId}/replies/${props.commentId}`;

	const commentContent = (
		<>
			<ReportDialog
				documentPath={commentPath}
				open={showReportDialog}
				onCloseEvent={() => { setShowReportDialog(false); }}
			/>
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
				{/*<div className="comment-controls" style={{ display: isSignedIn && !showReplyBox ? '' : 'none' }}>
					<div style={{ display: isOwnComment ? '' : 'none' }}>
						<TriggerButton text="Delete" type="flush" onClick={() => { deleteComment(); }} />
					</div>
					<div style={{ display: !isOwnComment ? '' : 'none' }}>
						<TriggerButton text="Report" type="flush" onClick={() => { setShowReportDialog(true); }} />
					</div>
					<TriggerButton text="Reply" type="flush" onClick={() => { setShowReplyBox(true); }} />
				</div>
				<div className="comment-reply-box" style={{ display: showReplyBox ? '' : 'none' }}>
					<div style={{ margin: '0 auto', width: 'fit-content', marginBottom: '5px' }}>
						<TextArea
							label="Type Your Reply"
							value={reply}
							onChange={(val) => { setReply(val); }}
							widthPx={400}
							heightPx={80}
							maxLength={400}
						/>
					</div>
					<TriggerButton text="Send" type="blue" onClick={() => { sendReply(); }} />
					<TriggerButton text="Cancel" type="flush" onClick={() => { setShowReplyBox(false); }} />
				</div>*/}
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

	/**
	 * Sends a reply to the comment.
	 */
	async function sendReply() {
		const submitCommentFn = httpsCallable(functions, 'submitComment');
		await submitCommentFn({
			location: 'levels',
			docId: props.pageId,
			commentId: props.topCommentId!,
			text: reply,
			makerUid: '',
		});
		// eslint-disable-next-line no-restricted-globals
		if (typeof location !== 'undefined') location.reload();
		setShowReplyBox(false);
	}

	/**
	 * Deletes a comment.
	 */
	async function deleteComment() {
		const deleteCommentFn = httpsCallable(functions, 'deleteComment');
		await deleteCommentFn({
			location: 'levels',
			docId: props.pageId,
			commentId: props.commentId,
		});
		// eslint-disable-next-line no-restricted-globals
		if (typeof location !== 'undefined') location.reload();
	}
}

Comment.defaultProps = {
	docIdPath: '',
	commentId: undefined,
};

export default Comment;
