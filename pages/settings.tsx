import AppFrame from '@components/AppFrame';
import Gate from '@components/main/Gate';
import TextField from '@components/pages/controls/TextField';
import TriggerButton from '@components/pages/controls/TriggerButton';
import { db, getUser } from '@scripts/site/FirebaseUtil';
import { hasEarlyAccess } from '@scripts/site/UserDataScripts';
import { doc, getDoc, setDoc } from 'firebase/firestore/lite';
import React, { useEffect, useState } from 'react';
import RewardRedeemer from '../src/components/pages/controls/settings/RewardRedeemer';
import SettingsGroup from '../src/components/pages/controls/settings/SettingsGroup';

/**
 * The page that displays user settings.
 */
function SettingsPage() {
	const user = getUser();
	const [username, setUsername] = useState('');

	const eaDisplay = hasEarlyAccess() ? (
		<>
			<p>You have early access! Thank you for supporting me!</p>
			{/* <p>Your early access will last until [TODO].</p> */}
			<p>If this key was from Patreon, you&apos;ll be given another one every month as long as you
				stay in the Fire Flower tier.
			</p>
		</>
	) : (
		<>
			<p>You can unlock early access by supporting me on Patreon!
			</p>
			{/* <p>I work very hard to develop this site and its music level technology.
				If you found this website helpful, please consider becoming a Patron.
				I would really appreciate it and you would be helping me a lot.
			</p> */}
			<p>I work hard to develop this site and its music level technology.
				If you know you will find this website helpful,
				please consider <a href="https://www.patreon.com/UncaughtCursor">becoming a Patron</a>.
				It helps me a ton and I would really appreciate it. ❤️
			</p>
		</>
	);
	const anOrAnother = hasEarlyAccess() ? 'another' : 'an';

	const userDocRef = doc(db, `users/${user?.uid}`);

	useEffect(() => {
		(async () => {
			const userDataSnap = await getDoc(userDocRef);
			if (!userDataSnap.exists()) return;
			const userData = userDataSnap.data();
			setUsername(userData.name);
		})();
	}, []);

	return (
		<AppFrame>
			<Gate requireEA={false} showLogout={false}>
				<div style={{
					display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
				}}
				>
					<h1>Settings</h1>
					<SettingsGroup name="Your Info">
						{/* <p>Email Address: {user?.email}</p> */}
						<TextField
							label="Display Name"
							value={username}
							onChange={(val) => { setUsername(val); }}
						/>
						<p>User ID: {user?.uid}</p>
						<div>
							<TriggerButton
								text="Submit"
								type="blue"
								onClick={async () => {
									setDoc(userDocRef, { name: username }, { merge: true });
								}}
							/>
						</div>
					</SettingsGroup>
					<SettingsGroup name="Early Access">
						{eaDisplay}
						<p>If you have {anOrAnother} early access key, you can use it here.</p>
						<RewardRedeemer />
					</SettingsGroup>
					<br />
				</div>
			</Gate>
		</AppFrame>
	);
}

export default SettingsPage;
