import { initializeApp } from 'firebase/app';
import {
	getFirestore, connectFirestoreEmulator,
} from 'firebase/firestore/lite';
import {
	getAuth, connectAuthEmulator, onAuthStateChanged, User,
	signOut, GoogleAuthProvider,
	EmailAuthProvider,
} from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { Analytics, getAnalytics } from 'firebase/analytics';
import {
	connectStorageEmulator, getDownloadURL, getStorage, ref, uploadBytes,
} from 'firebase/storage';
import 'firebaseui/dist/firebaseui.css';
import { getCookieConsentValue } from 'react-cookie-consent';
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

export const termsOfServiceUrl = 'https://www.termsfeed.com/live/3cf94489-44da-4cca-a1fa-22c192b7113d';
export const privacyPolicyUrl = 'https://www.termsfeed.com/live/9b12f22d-2228-4b5f-81dd-071a4cb079ed';
export const discordLink = 'https://discord.gg/KhmXzfp';
export const twitterLink = 'https://twitter.com/MusicLvlStudio';
export const patreonLink = 'https://www.patreon.com/UncaughtCursor';

const firebaseUiConfig: firebaseui.auth.Config = {
	signInOptions: [
		GoogleAuthProvider.PROVIDER_ID,
		EmailAuthProvider.PROVIDER_ID,
	],
	signInFlow: 'popup',
	tosUrl: termsOfServiceUrl,
	privacyPolicyUrl,
	callbacks: {
		signInSuccessWithAuthResult: () => {
			if (typeof window !== 'undefined') {
				const evt = new Event('login-end');
				document.dispatchEvent(evt);
			}
			return false;
		},
		signInFailure: () => {
			if (typeof window !== 'undefined') {
				const evt = new Event('login-end');
				document.dispatchEvent(evt);
			}
		},
	},
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
let analytics: Analytics | null = null;

// FIXME: COMMENT OUT IN PROD
try {
	connectFirestoreEmulator(db, '192.168.1.190', 8080);
	connectAuthEmulator(auth, 'http://192.168.1.190:9099');
	connectFunctionsEmulator(functions, '192.168.1.190', 5001);
	connectStorageEmulator(storage, '192.168.1.190', 9199);
} catch (e) {
	console.error(e);
}

let user: User | null = null;
onAuthStateChanged(auth, (authUser) => {
	user = authUser;
	if (user !== null) initUser();
});

// ui-sign-in-name-input

if (typeof window !== 'undefined') {
	// https://eager.io/blog/how-to-decide-when-your-code-should-run/

	const observer = new MutationObserver((mutations) => {
		for (let i = 0; i < mutations.length; i++) {
			for (let j = 0; j < mutations[i].addedNodes.length; j++) {
				const thisElement = mutations[i].addedNodes[j] as Element;

				// Target the 'First & last name' field and replace it with "Display Name"
				if (thisElement.className === 'mdl-card mdl-shadow--2dp firebaseui-container firebaseui-id-page-password-sign-up') {
					// eslint-disable-next-line no-param-reassign
					thisElement.id = 'firebase-ui-injection';
					thisElement.childNodes[0]
						.childNodes[1].childNodes[2]
						.childNodes[0].textContent = 'Display Name';
				}
			}
		}
	});

	observer.observe(document.documentElement, {
		childList: true,
		subtree: true,
	});

	// Init Google Analytics if the user has cookies enabled
	const hasCookiesEnabled = getCookieConsentValue();
	if (hasCookiesEnabled) {
		initAnalytics();
	}
}

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

let firebaseAuthUi: any;

if (typeof window !== 'undefined' && firebaseAuthUi === undefined) {
	try {
		import('firebaseui').then((firebaseui) => {
			firebaseAuthUi = new firebaseui.auth.AuthUI(auth);
		});
	} catch (e) {
		console.error(e);
	}
}

/**
 * Prompts the user to log in or register.
 * Ideally, the page they were just on.
 */
export async function promptLogin() {
	if (typeof window !== 'undefined') {
		const evt = new Event('login-request');
		document.dispatchEvent(evt);
	}
	try {
		firebaseAuthUi.start('#firebaseui-auth-container', firebaseUiConfig);
	} catch (e) {
		console.error(e);
	}
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

/**
 * Initializes Google Analytics. Should only be done if the user consented to it first.
 */
export function initAnalytics() {
	analytics = getAnalytics(app);
}

/**
 * Returns the Google Analytics object or null if not initialized.
 * @returns
 */
export function getAppAnalytics() {
	return analytics;
}

/**
 * Uploads one of more files to cloud storage.
 * @param localUrls The local blob urls of the files to upload.
 * @param path The path to upload the files in. E.g. /folder/dir/
 */
export async function uploadFiles(localUrls: string[], path: string): Promise<string[]> {
	const globalUrls = new Array<string>(localUrls.length).fill('');
	await Promise.all(localUrls.map(
		// eslint-disable-next-line no-async-promise-executor
		(localUrl, i) => new Promise(async (resolve, reject) => {
			// If the image is already uploaded, add the current URL to the list of global URLs
			if (localUrl.substring(0, 4) !== 'blob') {
				globalUrls[i] = localUrl;
				resolve();
			}

			// Get blob to upload
			const blob = await fetch(localUrl).then((r) => r.blob());

			// Establish image reference in cloud storage
			const fileId = randomString(24);
			const fileRef = ref(storage, `${path}${fileId}`);

			// Upload
			try {
				await uploadBytes(fileRef, blob);
				globalUrls[i] = await getDownloadURL(fileRef);
				resolve();
			} catch (e) {
				console.error(e);
				reject(e);
			}
		}) as Promise<void>,
	));
	return globalUrls;
}
