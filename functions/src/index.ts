import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import next from 'next';

// Exports from other source files
export * from './levels';
export * from './social';
export * from './rewards';

// IMPORTANT: RUN 'npx ttsc -w' after changes are made!! (ttsc isn't a typo!)

admin.initializeApp();

const isDev = process.env.NODE_ENV !== 'production';

const server = next({
	dev: isDev,
	conf: { distDir: '.next' },
});

const nextjsHandle = server.getRequestHandler();
export const nextServer = functions.https.onRequest(
	(req: any, res: any) => server.prepare().then(() => nextjsHandle(req, res)),
);

export const initUser = functions.https.onCall(async (_data, context) => {
	if (context.auth === undefined) return { success: false, msg: 'User is not logged in.' };
	const userDocRef = admin.firestore().doc(`users/${context.auth.uid}`);
	const userDocSnap = await userDocRef.get();
	const userAccessDocRef = admin.firestore().doc(`users/${context.auth.uid}/priv/access`);
	const userAccessDocSnap = await userAccessDocRef.get();
	const userSocialDocRef = admin.firestore().doc(`users/${context.auth.uid}/priv/social`);
	const userSocialDocSnap = await userSocialDocRef.get();

	// FIXME: Initialize fields if they don't exist

	if (!userDocSnap.exists) {
		await userDocRef.set({
			name: `User ${context.auth.uid.substring(0, 5)}...`,
		});
	}
	if (!userAccessDocSnap.exists) {
		await userAccessDocRef.set({
			patronUntil: new admin.firestore.Timestamp(0, 0),
		});
	}
	if (!userSocialDocSnap.exists) {
		await userSocialDocRef.set({
			points: 0,
			lastProfileChangeTime: new admin.firestore.Timestamp(0, 0),
			lastLevelUploadTime: new admin.firestore.Timestamp(0, 0),
		});
	}

	return { success: true, msg: '' };
});
