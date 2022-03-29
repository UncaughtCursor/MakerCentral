import useUserInfo from '@components/hooks/useUserInfo';
import TextArea from '@components/pages/controls/TextArea';
import TriggerButton from '@components/pages/controls/TriggerButton';
import { auth, functions, getUser } from '@scripts/site/FirebaseUtil';
import { onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import React, { useState } from 'react';
import CommentsFeed from './CommentsFeed';

const batchSize = 10;

const commentableDocPaths = [
	'/levels/',
] as const;

export type CommentableDocPath = typeof commentableDocPaths[number];

/**
 * A comments section for a level or post.
 * @param props The props:
 * * The document ID of the document to comment on.
 * * The database path of the collection containing the document.
 */
function CommentsSection(props: {
	docId: string,
	docPath: CommentableDocPath,
	numComments: number,
}) {
	const userInfo = useUserInfo();
	const [userComment, setUserComment] = useState('');
	const [isSendingComment, setIsSendingComment] = useState(false);

	return (
		<div>
			<div style={{
				display: userInfo !== null ? '' : 'none',
				margin: '30px 0',
			}}
			>
				<h2>Comments ({props.numComments})</h2>
				<div style={{ margin: '0 auto', width: 'fit-content', marginBottom: '10px' }}>
					<TextArea
						label="Leave a Comment"
						value={userComment}
						onChange={(val) => { setUserComment(val); }}
						widthPx={400}
						heightPx={80}
						maxLength={400}
					/>
				</div>
				<TriggerButton
					text="Submit"
					type="blue"
					isLoading={isSendingComment}
					onClick={() => { sendComment(); }}
				/>
			</div>
			<CommentsFeed docId={props.docId} docPath={props.docPath} />
		</div>
	);

	/**
	 * Submits the comment typed by the user.
	 */
	async function sendComment() {
		setIsSendingComment(true);
		try {
			const submitCommentFn = httpsCallable(functions, 'submitComment');
			await submitCommentFn({
				location: 'levels',
				docId: props.docId,
				text: userComment,
			});
			// eslint-disable-next-line no-restricted-globals
			if (typeof location !== 'undefined') location.reload();
			setIsSendingComment(false);
		} catch (e) {
			// eslint-disable-next-line no-alert
			alert('An error occurred while attempting to submit the comment.');
			console.error(e);
			setIsSendingComment(false);
		}
	}
}

export default CommentsSection;
