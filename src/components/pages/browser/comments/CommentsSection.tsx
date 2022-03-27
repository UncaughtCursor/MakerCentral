import useUserInfo from '@components/hooks/useUserInfo';
import { auth, getUser } from '@scripts/site/FirebaseUtil';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useState } from 'react';

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
}) {
	const userInfo = useUserInfo();

	return (
		<p />
	);
}

export default CommentsSection;
