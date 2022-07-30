import AppFrame from '@components/AppFrame';
import useUserInfo from '@components/hooks/useUserInfo';
import Gate from '@components/main/Gate';
import AvatarUploader from '@components/pages/browser/AvatarUploader';
import TextArea from '@components/pages/controls/TextArea';
import TextField from '@components/pages/controls/TextField';
import TriggerButton from '@components/pages/controls/TriggerButton';
import { db } from '@scripts/site/FirebaseUtil';
import { doc, getDoc, setDoc } from 'firebase/firestore/lite';
import React, { useEffect, useState } from 'react';
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
					<br />
				</div>
			</Gate>
		</AppFrame>
	);
}

export default SettingsPage;
