import { initializeApp } from 'firebase/app';
import {
	getFirestore, connectFirestoreEmulator,
} from 'firebase/firestore/lite';
import {
	getAuth, connectAuthEmulator, onAuthStateChanged, User,
	signOut, signInWithPopup, GoogleAuthProvider,
} from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
// import { getAnalytics } from 'firebase/analytics';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

import { initUser } from './UserDataScripts';

// Non-EAP prod
/* const firebaseConfig = {

	apiKey: 'AIzaSyC48dcQtgCIPSSNaRnat_-CXPxkya79tc0',

	authDomain: 'music-level-studio.firebaseapp.com',

	projectId: 'music-level-studio',

	storageBucket: 'music-level-studio.appspot.com',

	messagingSenderId: '488540089829',

	appId: '1:488540089829:web:411f70f8755af245da930c',

	measurementId: 'G-69W6WFMN46',

}; */

// Dev
const firebaseConfig = {

	apiKey: 'AIzaSyBeSkLVhnFqDxmgcOt0SJQPwQIG-2EMLgk',

	authDomain: 'music-level-studio-dev.firebaseapp.com',

	projectId: 'music-level-studio-dev',

	storageBucket: 'music-level-studio-dev.appspot.com',

	messagingSenderId: '707972708379',

	appId: '1:707972708379:web:5fd139171f15188768e0be',

};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
// export const analytics = getAnalytics(app);

// FIXME: COMMENT OUT IN PROD
try {
	connectFirestoreEmulator(db, '192.168.1.190', 8080);
	connectAuthEmulator(auth, 'http://192.168.1.190:9099');
	connectFunctionsEmulator(functions, '192.168.1.190', 5001);
	connectStorageEmulator(storage, '192.168.1.190', 9199);
} catch (e) {
	console.log(e);
}

let user: User | null = null;
onAuthStateChanged(auth, (authUser) => {
	user = authUser;
	if (user !== null) initUser();
});

/**
 * Gets the currently logged in user or null if logged out.
 * @returns The currently logged in user or null if logged out.
 */
export function getUser() {
	return user;
}

/**
 * Generates a string of random alphanumeric characters.
 * @param length The length of the string.
 * @returns The generated string.
 */
export function randomString(length: number) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random()
 * charactersLength));
	}
	return result;
}

const provider = new GoogleAuthProvider();

/**
 * Prompts the user to log in with Google.
 */
export function promptGoogleLogin() {
	signInWithPopup(auth, provider)
		.catch((error) => {
			// Handle Errors here.
			const errorCode = error.code;
			const errorMessage = error.message;
			// The email of the user's account used.
			const email = error.email;
			// The AuthCredential type that was used.
			const credential = GoogleAuthProvider.credentialFromError(error);
			console.error(errorCode, errorMessage, email, credential);
		});
}

/**
 * Logs the user out.
 */
export function logout() {
	signOut(auth).then(() => {
		// Sign-out successful.
	}).catch((error) => {
		// An error happened.
		console.error(error);
	});
}
