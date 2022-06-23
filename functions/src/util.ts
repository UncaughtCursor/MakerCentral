import { db } from '.';
import { randomString } from './levels';
import axios from 'axios';

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
	await db.runTransaction(async (t) => {
		const path = `users/${uid}/notifications/${randomString(24)}`;
		const notifDocRef = db.doc(path);

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
	const userData: UserDocData | undefined = (await db.doc(`/users/${uid}`).get()).data() as UserDocData | undefined;
	return userData !== undefined ? userData : null;
}


/**
 * Obtains the binary data of a file at a URL.
 * @param url The url of the file.
 * @returns The binary data of the file.
 */
export async function fetchBuffer(url: string): Promise<Buffer> {
	return Buffer.from((await axios.get(url, {
		responseType: 'arraybuffer',
	})).data);
}