import AppFrame from '@components/AppFrame';
import { getUser } from '@scripts/site/FirebaseUtil';
import { hasEarlyAccess } from '@scripts/site/UserDataScripts';
import React, { useState } from 'react';
import RewardRedeemer from '../src/components/pages/controls/settings/RewardRedeemer';
import SettingsGroup from '../src/components/pages/controls/settings/SettingsGroup';

interface SettingsPageState {

}

// FIXME: Await user, possibly have an await user gate component

/**
 * The page that displays user settings.
 */
function SettingsPage() {
	const [state, setState] = useState({} as SettingsPageState);
	const user = getUser();

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
				It helps me a ton and I would really appreicate it. ❤️
			</p>
		</>
	);
	const anOrAnother = hasEarlyAccess() ? 'another' : 'an';
	return (
		<AppFrame>
			<div style={{
				display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
			}}
			>
				<h1>Settings</h1>
				<SettingsGroup name="Your Info">
					<p>Display Name: {user?.displayName}</p>
					{/* <p>Email Address: {user?.email}</p> */}
					<p>User ID: {user?.uid}</p>
				</SettingsGroup>
				<SettingsGroup name="Early Access">
					{eaDisplay}
					<p>If you have {anOrAnother} early access key, you can use it here.</p>
					<RewardRedeemer />
				</SettingsGroup>
				<br />
			</div>
		</AppFrame>
	);
}

export default SettingsPage;
