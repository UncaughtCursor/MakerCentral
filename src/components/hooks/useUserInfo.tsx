import {
	auth, db, functions, getUser,
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

/**
 * Obtains the info of the currently logged-in user.
 * @returns The info or null if the user is not logged in.
 */
function useUserInfo(): UserInfo | null {
	const [user, setUser] = useState(getUser());
	const [userInfo, setUserInfo] = useState(null as UserInfo | null);

	onAuthStateChanged(auth, (authUser) => {
		setUser(authUser);
	});

	useEffect(() => {
		if (user !== null) infoFn();
	}, [user]);

	const infoFn = async () => {
		if (user === null) {
			console.error('infoFn: user is null');
			return;
		}
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
		setUserInfo(info);
	};

	return userInfo;
}

export default useUserInfo;
