import useUserInfo from '@components/hooks/useUserInfo';
import { db } from '@scripts/site/FirebaseUtil';
import {
	collection, getDocs, orderBy, query,
} from 'firebase/firestore/lite';
import React, { useEffect, useState } from 'react';
import Comment, { UserLevelComment, UserLevelMessage } from './Comment';
import { CommentableDocPath } from './CommentsSection';

interface ReplyDocData {
	uid: string;
	text: string;
	timestamp: number;
	points: number;
}

/**
 * A feed to display comments on any document.
 * @param props The props:
 * * docId: The ID of the document with the comments in its subcollection.
 * * docPath: The path that the document exists in.
 */
function CommentsFeed(props: {
	docId: string,
	docPath: CommentableDocPath,
}) {
	const userInfo = useUserInfo();
	const isLoggedIn = userInfo !== null;

	const [loading, setLoading] = useState(true);
	const [comments, setComments] = useState([] as UserLevelComment[]);

	useEffect(() => {
		(async () => {
			const colRef = collection(db, `${props.docPath}${props.docId}/comments`);
			const commentDocs = (await getDocs(query(colRef, orderBy('timestamp', 'asc')))).docs;

			const queriedComments: UserLevelComment[] = await Promise.all(
				commentDocs.map(async (commentDoc) => {
					const repliesRef = collection(db, `${commentDoc.ref.path}/replies`);
					const replyDocs = (await getDocs(query(repliesRef, orderBy('timestamp', 'asc')))).docs;
					const replies: UserLevelMessage[] = replyDocs.map((replyDoc) => ({
						...(replyDoc.data() as ReplyDocData),
						id: replyDoc.id,
					}));

					const docData = commentDoc.data();
					return {
						...(docData as UserLevelMessage),
						id: commentDoc.id,
						replies,
					};
				}),
			);

			setLoading(false);
			setComments(queriedComments);
		})();
	}, [props.docId, props.docPath]);

	if (loading) {
		return (
			<span>Loading...</span>
		);
	}
	return (
		<div className="comment-feed">
			{getCommentComponents()}
		</div>
	);

	/**
	 * Gets the comment components for each comment.
	 * @returns The generated components.
	 */
	function getCommentComponents() {
		return comments.map((comment) => (
			<Comment
				key={comment.timestamp}
				comment={comment}
				commentId={comment.id}
				topCommentId={comment.id}
				pageId={props.docId}
				uid={userInfo?.user.uid !== undefined ? userInfo.user.uid : null}
			/>
		));
	}
}

export default CommentsFeed;
