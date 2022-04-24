import AppFrame from '@components/AppFrame';
import LevelCategoryFeed from '@components/pages/browser/LevelCategoryFeed';
import { db } from '@scripts/site/FirebaseUtil';
import {
	doc, getDoc, QueryConstraint, where,
} from 'firebase/firestore/lite';
import Page404 from 'pages/404';
import React from 'react';

interface UserPageProps {
	uid: string | null,
	userInfo: {
		name: string,
		avatarUrl: string | null,
		bio: string | null,
		creatorRep: number,
	}
}

/**
 * The page used to display the user's public profile.
 * @param props The props:
 * * uid: The User's ID.
 * * userInfo: The user's display name, bio, avatar url, and creator rep.
 */
function UserPage(props: UserPageProps) {
	if (props.uid === null) return <Page404 />;

	const constraint: QueryConstraint = where('makerUid', '==', props.uid);

	return (
		<AppFrame
			title={`${props.userInfo.name}'s Profile - MakerCentral`}
			description={`${props.userInfo.name}'s profile on MakerCentral. ${props.userInfo.creatorRep} creator rep.`}
		>
			<div className="user-profile-container-upper">
				<div className={props.userInfo.avatarUrl !== null ? 'user-profile-img-container'
					: 'user-profile-img-container user-profile-img-container-null'}
				>
					<span style={{
						display: props.userInfo.avatarUrl !== null ? 'none' : '',
					}}
					>No profile image
					</span>
					<img
						src={props.userInfo.avatarUrl !== null
							? props.userInfo.avatarUrl : undefined}
						alt={props.userInfo.name}
					/>
				</div>
				<div className="user-profile-name-container">
					<span>{props.userInfo.name}</span>
					<span>{props.userInfo.creatorRep} Creator Rep</span>
					<div
						className="user-profile-bio-container"
						style={{
							display: props.userInfo.bio !== null ? '' : 'none',
						}}
					>
						<p>{props.userInfo.bio}</p>
					</div>
				</div>
			</div>
			<LevelCategoryFeed
				extraQueryConstraints={[constraint]}
				excludedSortCodes={[
					'BY_PATRONS',
					'POPULAR',
					'TOP_THIS_MONTH',
				]}
			/>
		</AppFrame>
	);
}

/**
 * Obtains the server-side props used for rendering the page.
 * @param context The context object.
 * @returns The props.
 */
export async function getServerSideProps(
	context: {params: {uid: string}},
): Promise<{props: UserPageProps}> {
	const userSnap = await getDoc(doc(db, `/users/${context.params.uid}`));
	const userSocialSnap = await getDoc(doc(db, `/users/${context.params.uid}/priv/social`));

	if (!userSnap.exists() || !userSocialSnap.exists()) {
		return {
			props: {
				uid: null,
				userInfo: {
					name: 'Null User',
					bio: '',
					avatarUrl: '',
					creatorRep: 0,
				},
			},
		};
	}

	const userData = userSnap.data()!;
	const userSocialData = userSocialSnap.data()!;

	const name = userData.name;
	const avatarUrl = userData.avatarUrl as string | null | undefined;
	const bio = userData.bio as string | undefined;
	const creatorRep = userSocialData.points as number;

	return {
		props: {
			uid: context.params.uid,
			userInfo: {
				name,
				bio: bio !== undefined ? bio : null,
				avatarUrl: avatarUrl !== undefined ? avatarUrl : null,
				creatorRep,
			},
		},
	};
}

export default UserPage;
