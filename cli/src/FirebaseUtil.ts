import * as admin from 'firebase-admin';
import * as serviceAccount from './private/firebase-priv-key.json';

export const app = admin.initializeApp({
	credential: admin.credential.cert(serviceAccount as unknown as string),
	storageBucket: 'music-level-studio-dev.appspot.com',
});

export const db = admin.firestore(app);
export const storage = admin.storage(app);
