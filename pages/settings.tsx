import AppFrame from '@components/AppFrame';
import useUserInfo from '@components/hooks/useUserInfo';
import Gate from '@components/main/Gate';
import AvatarUploader from '@components/pages/browser/AvatarUploader';
import LevelImageUploader from '@components/pages/browser/LevelImageUploader';
import TextArea from '@components/pages/controls/TextArea';
import TextField from '@components/pages/controls/TextField';
import TriggerButton from '@components/pages/controls/TriggerButton';
import { db, getUser, patreonLink } from '@scripts/site/FirebaseUtil';
import { getPatronType } from '@scripts/site/UserDataScripts';
import { doc, getDoc, setDoc } from 'firebase/firestore/lite';
import React, { useEffect, useState } from 'react';
import RewardRedeemer from '../src/components/pages/controls/settings/RewardRedeemer';
import SettingsGroup from '../src/components/pages/controls/settings/SettingsGroup';

/**
 * The page that displays user settings.
 */
function SettingsPage() {
	const userInfo = useUserInfo();
	const user = userInfo !== null ? userInfo.user : null;

	const [username, setUsername] = useState(userInfo !== null ? userInfo.name : '');
	const [avatarUrl, setAvatarUrl] = useState(userInfo !== null
		&& userInfo.avatarUrl !== undefined ? userInfo.avatarUrl : null);
	const [bio, setBio] = useState(userInfo !== null ? userInfo.bio : '');
	const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

	const patronType = getPatronType();
	const isPatron = patronType !== 'None' && patronType !== null;

	const eaDisplay = isPatron ? (
		<>
			<p>You are a patron! Thank you for supporting me!</p>
			<p>You are in the {patronType} Tier.</p>
			{/* <p>Your patron status will last until [TODO].</p> */}
		</>
	) : (
		<>
			<p>You can unlock Early Access and more by supporting me on Patreon!
			</p>
			{/* <p>I work very hard to develop this site and its music level technology.
				If you found this website helpful, please consider becoming a Patron.
				I would really appreciate it and you would be helping me a lot.
			</p> */}
			<p>I work hard to develop this site and its music level technology.
				If you know you will find this website helpful,
				please consider <a href={patreonLink}>becoming a Patron</a>.
				It helps me a ton and I would really appreciate it. ❤️
			</p>
		</>
	);
	const anOrAnother = isPatron ? 'another' : 'an';

	const userDocRef = doc(db, `users/${user?.uid}`);

	useEffect(() => {
		(async () => {
			const userDataSnap = await getDoc(userDocRef);
			if (!userDataSnap.exists()) return;
			const userData = userDataSnap.data();
			setUsername(userData.name);
			setBio(userData.bio);
			setAvatarUrl(userData.avatarUrl);
		})();
	}, []);

	useEffect(() => {
		if (userInfo === null) return;
		setUsername(userInfo.name);
		setBio(userInfo.bio);
		setAvatarUrl(userInfo.avatarUrl !== undefined ? userInfo.avatarUrl : null);
	}, [userInfo]);

	return (
		<AppFrame title="Settings - MakerCentral">
			<Gate requireEA={false} showLogout={false}>
				<div style={{
					display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
				}}
				>
					<h1>Settings</h1>
					<SettingsGroup name="Profile">
						{/* <p>Email Address: {user?.email}</p> */}
						<TextField
							label="Display Name"
							value={username}
							onChange={(val) => { setUsername(val); }}
						/>
						<TextArea
							label="Bio"
							value={bio}
							heightPx={150}
							onChange={(val) => { setBio(val); }}
							maxLength={1000}
						/>
						<AvatarUploader
							label="Profile Picture"
							initialImageUrl={avatarUrl}
							onUpload={(url) => { setAvatarUrl(url); }}
						/>
						<p>User ID: {user?.uid}</p>
						<div>
							<TriggerButton
								text="Submit"
								type="blue"
								onClick={async () => {
									setIsSubmittingProfile(true);
									await setDoc(userDocRef, {
										name: username,
										avatarUrl,
										bio,
									}, { merge: true });
									setIsSubmittingProfile(false);
								}}
								isLoading={isSubmittingProfile}
							/>
						</div>
					</SettingsGroup>
					<SettingsGroup name="Patron Status">
						{eaDisplay}
						<p>If you have {anOrAnother} reward key, you can use it here.</p>
						<RewardRedeemer />
					</SettingsGroup>
					<br />
				</div>
			</Gate>
		</AppFrame>
	);
}

export default SettingsPage;
