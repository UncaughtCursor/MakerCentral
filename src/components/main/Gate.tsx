import SettingsGroup from '@components/pages/controls/settings/SettingsGroup';
import { getUser } from '@scripts/site/FirebaseUtil';
import { getPatronType } from '@scripts/site/UserDataScripts';
import React, { useEffect, useState } from 'react';
import Spinner from '@components/pages/controls/Spinner';
import useUserInfo from '@components/hooks/useUserInfo';
import LoginPrompt from './LoginPrompt';

type GateOpenState = 'login' | 'EA' | 'open' | 'closed';

/**
 * A component to force the user to sign in and, optionally, to also have patron status.
 * @param props The props:
 * * requireEA: Whether or not patron status is required.
 * * showLogout: Whether or not to show a button to allow the user to log out on key entry.
 */
function Gate(props: {
	requireEA: boolean,
	showLogout: boolean,
	children: React.ReactNode
}) {
	const userInfo = useUserInfo();
	const user = userInfo !== null ? userInfo.user : null;
	const [isLoading, setIsLoading] = useState(getUser() !== null && getPatronType() === null);

	const [openState, setOpenState] = useState(getOpenState());
	if (getUser() !== null && getPatronType() === null && !isLoading) setIsLoading(true);

	useEffect(() => {
		setOpenState(getOpenState());
	}, [userInfo]);

	const boldMsg = props.requireEA ? 'You\'ll be able to use this page with patron status.'
		: 'You\'ll be able to use this page after logging in.';

	switch (openState) {
	case 'open': {
		// eslint-disable-next-line react/jsx-no-useless-fragment
		return <>{props.children}</>;
	}
	case 'login': {
		return (
			<div className="gate-background">
				<div style={{ display: isLoading ? 'none' : '' }}>
					<SettingsGroup name="Sign in to Continue">
						<p><b>{boldMsg}</b></p>
						<br />
						<p>Sign into your account or create a new one below.</p>
						<LoginPrompt />
					</SettingsGroup>
				</div>
				<Spinner isActive={isLoading} />
			</div>
		);
	}
	case 'EA': {
		return (
			<div className="gate-background">
				<div style={{ display: isLoading ? 'none' : '' }}>
					<span>Error</span>
					<Spinner isActive={isLoading} />
				</div>
			</div>
		);
	}
	default: {
		return <p>Error</p>;
	}
	}

	/**
	 * Returns what the GateOpenState should be based on the logged in user.
	 * @param user The currently logged in user or null is none is logged in.
	 * @returns The GateOpenState to render.
	 */
	function getOpenState(): GateOpenState {
		const patronType = userInfo?.patronStatus;
		const hasEA = patronType === 'Fire Flower' || patronType === 'Super Star';

		let newOpenState: GateOpenState = 'closed';
		if (user === null || hasEA === null) newOpenState = 'login';
		else if (!hasEA && props.requireEA) newOpenState = 'EA';
		else if (!props.requireEA) newOpenState = 'open';
		else if (hasEA) newOpenState = 'open';
		return newOpenState;
	}
}

export default Gate;
