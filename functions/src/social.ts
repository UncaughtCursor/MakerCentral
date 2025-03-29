import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { is } from 'typia';
import { firestore } from 'firebase-admin';
import { randomString, UserLevelDocData } from './levels';
import { getUserDoc, sendNotification } from './util';
import { db } from '.';

type VoteValue = 1 | 0 | -1;

interface VoteData {
	voteVal: VoteValue;
}

interface CommentData {
	uid: string;
	text: string;
	timestamp: number;
	points: number;
	subscriberUids: string[] | null;
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

	await db.runTransaction(async (t) => {
		const levelRef = db.doc(`levels/${data.levelId}`);
		const voteRef = db.doc(`users/${context.auth!.uid}/engagements/${data.levelId}`);

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

		const authorSocialRef = db.doc(`users/${levelData.makerUid}/priv/social`);
		t.set(authorSocialRef, {
			points: firestore.FieldValue.increment(scoreChange),
		}, { merge: true });
	});
});

// TODO: Notification function and follower list structure
// Pings everyone in the list when there is new activity

export type CommentLocation = 'levels';

export const submitComment = functions.https.onCall(async (data: {
	location: CommentLocation, docId: string, commentId?: string, text: string,
}, context) => {
	if (context.auth === undefined) throw new Error('User is not logged in.');
	if (!is<CommentLocation>(data.location)) throw new Error('Invalid comment location.');

	const isReply = data.commentId !== undefined;
	const userDoc = await getUserDoc(context.auth!.uid);
	if (userDoc === null) throw new Error('User document does not exist.');

	const docRef = !isReply
		? db.doc(`${data.location}/${data.docId}/comments/${randomString(24)}`)
		: db.doc(`${data.location}/${data.docId}/comments/${data.commentId}/replies/${randomString(24)}`);

	await db.runTransaction(async (t) => {
		// Get level data
		const levelData = (await t.get(db.doc(`${data.location}/${data.docId}`))).data() as UserLevelDocData | undefined;
		if (levelData === undefined) throw new Error('Level data does not exist.');

		// Get top-level comment data holding the subscriber UID list if this is a reply
		const topLevelCommentData = isReply ? (await t.get(db.doc(`${data.location}/${data.docId}/comments/${data.commentId!}`))).data() as CommentData : null;

		const makerUid = levelData.makerUid;
		// TODO: If a reply, download parent comment and
		// 1. Add the user to the subscriber UID list
		// 2. Send a notification to everyone except for the replier

		// If a top-level comment, initialize the subscriber UID list

		const commentData: CommentData = {
			uid: context.auth!.uid,
			text: data.text,
			timestamp: Date.now(),
			points: 0,
			subscriberUids: isReply ? null : [context.auth!.uid, makerUid],
		};

		console.log(isReply ? null : [context.auth!.uid, makerUid]);

		// Send comment
		t.set(docRef, commentData);

		// If this is a reply, notify everyone subscribed to the top-level comment
		// If this is a new top-level comment, only notify the maker
		const notifUids: string[] = (topLevelCommentData !== null
			? topLevelCommentData.subscriberUids!
			: [makerUid]).filter((uid) => uid !== context.auth!.uid);

		// Add the user's uid to the top-level comment's subscriber list if they are not
		// already subscribed and this is a reply
		if (isReply) {
			console.log(context.auth!.uid);
			t.set(db.doc(`${data.location}/${data.docId}/comments/${data.commentId!}`), {
				subscriberUids: admin.firestore.FieldValue.arrayUnion(context.auth!.uid),
			}, { merge: true });
		}

		// Update level's comment count
		t.set(db.doc(`${data.location}/${data.docId}`), {
			numComments: admin.firestore.FieldValue.increment(1),
		}, { merge: true });

		// Notify everyone of the reply
		notifUids.forEach((uid) => {
			sendNotification(uid, {
				type: 'comments',
				text: `${userDoc.name} ${isReply ? 'replied to a comment on' : 'commented on'} ${levelData.name}`,
				link: `/levels/view/${data.docId}`,
			});
		});
	});
});

export const deleteComment = functions.https.onCall(async (data: {
	location: CommentLocation, docId: string, commentId: string,
}, context) => {
	if (context.auth === undefined) throw new Error('User is not logged in.');
	if (!is<CommentLocation>(data.location)) throw new Error('Invalid comment location.');
	const docRef = db.doc(`${data.location}/${data.docId}/comments/${data.commentId}`);

	await db.runTransaction(async (t) => {
		t.delete(docRef);

		t.set(db.doc(`${data.location}/${data.docId}`), {
			numComments: admin.firestore.FieldValue.increment(-1),
		}, { merge: true });
	});
});
