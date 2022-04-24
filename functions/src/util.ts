import * as admin from 'firebase-admin';
import { randomString } from './levels';

/* eslint-disable import/prefer-default-export */

interface NotificationData {
	text: string,
	type: 'likes' | 'comments' | 'ranks' | 'admin' | 'misc',
	link: string,
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
