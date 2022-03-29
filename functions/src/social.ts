import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { is } from 'typescript-is';
import { firestore } from 'firebase-admin';
import { randomString, UserLevelDocData } from './levels';

type VoteValue = 1 | 0 | -1;

interface VoteData {
	voteVal: VoteValue,
}

/* interface VotableDocument {
	numLikes: number,
	numDislikes: number,
	score: number,
} */

export const voteOnLevel = functions.https.onCall(async (data: {
	levelId: string, voteVal: VoteValue,
}, context) => {
	if (context.auth === undefined) throw new Error('User is not logged in.');
	if (!is<VoteValue>(data.voteVal)) throw new Error('Invalid vote value.');

	await admin.firestore().runTransaction(async (t) => {
		const levelRef = admin.firestore().doc(`levels/${data.levelId}`);
		const voteRef = admin.firestore().doc(`users/${context.auth!.uid}/engagements/${data.levelId}`);

		let currentVoteVal = 0;
		const preVoteSnap = await t.get(voteRef);
		if (preVoteSnap.exists) currentVoteVal = (preVoteSnap.data() as VoteData).voteVal;

		const likesChange = (data.voteVal === 1 ? 1 : 0)
		+ (currentVoteVal === 1 ? -1 : 0);
		const dislikesChange = (data.voteVal === -1 ? 1 : 0)
		+ (currentVoteVal === -1 ? -1 : 0);
		const scoreChange = likesChange - dislikesChange;

		const levelSnap = await t.get(levelRef);
		if (!levelSnap.exists) throw new Error('Level does not exist.');
		const levelData = levelSnap.data() as UserLevelDocData;

		const curLikes = levelData.numLikes;
		const curDislikes = levelData.numDislikes;
		const curScore = levelData.score;

		t.set(levelRef, {
			numLikes: curLikes + likesChange,
			numDislikes: curDislikes + dislikesChange,
			score: curScore + scoreChange,
		}, { merge: true });

		t.set(voteRef, {
			voteVal: data.voteVal,
		});

		const authorSocialRef = admin.firestore().doc(`users/${levelData.makerUid}/priv/social`);
		t.set(authorSocialRef, {
			points: firestore.FieldValue.increment(scoreChange),
		}, { merge: true });
	});
});

export type CommentLocation = 'levels';

export const submitComment = functions.https.onCall(async (data: {
	location: CommentLocation, docId: string, commentId?: string, text: string,
}, context) => {
	if (context.auth === undefined) throw new Error('User is not logged in.');
	if (!is<CommentLocation>(data.location)) throw new Error('Invalid comment location.');
	const docRef = data.commentId === undefined
		? admin.firestore().doc(`${data.location}/${data.docId}/comments/${randomString(24)}`)
		: admin.firestore().doc(`${data.location}/${data.docId}/comments/${data.commentId}/replies/${randomString(24)}`);

	await admin.firestore().runTransaction(async (t) => {
		t.set(docRef, {
			uid: context.auth!.uid,
			text: data.text,
			timestamp: Date.now(),
			points: 0,
		});

		t.set(admin.firestore().doc(`${data.location}/${data.docId}`), {
			numComments: admin.firestore.FieldValue.increment(1),
		}, { merge: true });
	});
});

export const deleteComment = functions.https.onCall(async (data: {
	location: CommentLocation, docId: string, commentId: string,
}, context) => {
	if (context.auth === undefined) throw new Error('User is not logged in.');
	if (!is<CommentLocation>(data.location)) throw new Error('Invalid comment location.');
	const docRef = admin.firestore().doc(`${data.location}/${data.docId}/comments/${data.commentId}`);

	await admin.firestore().runTransaction(async (t) => {
		t.delete(docRef);

		t.set(admin.firestore().doc(`${data.location}/${data.docId}`), {
			numComments: admin.firestore.FieldValue.increment(-1),
		}, { merge: true });
	});
});
