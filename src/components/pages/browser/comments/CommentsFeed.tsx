import useUserInfo from '@components/hooks/useUserInfo';
import { db } from '@scripts/site/FirebaseUtil';
import {
	collection, getDocs, orderBy, query,
} from 'firebase/firestore/lite';
import React, { useEffect, useState } from 'react';
import Comment, { UserLevelComment } from './Comment';
import { CommentableDocPath } from './CommentsSection';

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
			const commentDocs = (await getDocs(query(colRef, orderBy('points', 'desc')))).docs;
			const queriedComments: UserLevelComment[] = commentDocs.map((commentDoc) => {
				const docData = commentDoc.data();
				return {
					...(docData as UserLevelComment),
				};
			});

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
		<div>
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
				isSignedIn={isLoggedIn}
			/>
		));
	}
}

export default CommentsFeed;
