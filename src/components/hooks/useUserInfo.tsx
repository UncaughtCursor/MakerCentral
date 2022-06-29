import {
	auth, db, getUser,
} from '@scripts/site/FirebaseUtil';
import { PatronStatus, getPatronType } from '@scripts/site/UserDataScripts';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, Timestamp } from 'firebase/firestore/lite';

import { useEffect, useState } from 'react';

export interface UserInfo {
	user: User,
	patronStatus: PatronStatus,
	name: string,
	bio: string | undefined,
	avatarUrl: string | undefined,
	lastLevelUploadTime: number,
	creatorRep: number,
}

let globalUserInfo: UserInfo | null = null;

onAuthStateChanged(auth, async (authUser) => {
	globalUserInfo = await fetchInfo(authUser);
	const evt = new Event('userinfoupdate');
	if (typeof document !== 'undefined') document.dispatchEvent(evt);
});

/**
 * Obtains the info of the currently logged-in user.
 * @returns The info or null if the user is not logged in.
 */
function useUserInfo(): UserInfo | null {
	const [userInfo, setUserInfo] = useState(globalUserInfo as UserInfo | null);

	useEffect(() => {
		if (typeof document !== 'undefined') document.addEventListener('userinfoupdate', updateFn);
		return () => {
			if (typeof document !== 'undefined') document.removeEventListener('userinfoupdate', updateFn);
		};
	}, []);

	const updateFn = () => {
		setUserInfo(globalUserInfo);
	};

	return userInfo;
}

/**
 * Fetches the info of a logged in user.
 * @param user The User object or null if logged out.
 * @returns The obtained info or null if the user is logged out.
 */
async function fetchInfo(user: User | null): Promise<UserInfo | null> {
	if (user === null) return null;

	const uid = user.uid;
	const userDocData = (await getDoc(doc(db, `/users/${uid}`))).data()!;
	const userSocialData = (await getDoc(doc(db, `/users/${uid}/priv/social`))).data()!;
	const patronType = getPatronType()!;

	const info: UserInfo = {
		user,
		name: userDocData.name as string,
		bio: userDocData.bio as string | undefined,
		avatarUrl: userDocData.avatarUrl as string | undefined,
		patronStatus: patronType,
		lastLevelUploadTime: (userSocialData.lastLevelUploadTime as Timestamp).toDate().getTime(),
		creatorRep: userSocialData.points as number,
	};
	return info;
}

export default useUserInfo;
