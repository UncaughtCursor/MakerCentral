import * as admin from 'firebase-admin';
import { randomString } from './levels';

/* eslint-disable import/prefer-default-export */

interface NotificationData {
	text: string,
	type: 'likes' | 'comments' | 'ranks' | 'admin' | 'misc',
	link: string,
}

interface UserDocData {
	name: string,
	avatarUrl: string,
	bio: string,
}

/**
 * Sends a notification to a user.
 * @param uid The user to send the notification to.
 * @param data The notification data.
 */
export async function sendNotification(uid: string, data: NotificationData) {
	// TODO: Notification merging
	await admin.firestore().runTransaction(async (t) => {
		const path = `users/${uid}/notifications/${randomString(24)}`;
		const notifDocRef = admin.firestore().doc(path);

		t.set(notifDocRef, {
			...data,
			timestamp: Date.now(),
			read: false,
		});
	});
}

/**
 * Retrieves the user document data of a user.
 * @param uid The user's uid.
 * @returns The data or null if the user document does not exist.
 */
export async function getUserDoc(uid: string): Promise<UserDocData | null> {
	const userData: UserDocData | undefined = (await admin.firestore().doc(`/users/${uid}`).get()).data() as UserDocData | undefined;
	return userData !== undefined ? userData : null;
}
