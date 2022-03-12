import TriggerButton from '@components/pages/controls/TriggerButton';
import {
	auth, getUser, logout, promptGoogleLogin,
} from '@scripts/site/FirebaseUtil';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Navlink } from '../Nav';
import { UserMenuItem } from '../UserMenu';

// TODO: User settings

/**
 * The site menu that displays on devices with small screen widths.
 * @param props The props:
 * * isOpen: Whether or not the menu is open.
 * * onCloseEvent: The function to call when the menu wants to close.
 */
function HamburgerMenu(props: {
	isOpen: boolean,
	onCloseEvent: () => void,
}) {
	const secondClassStr = props.isOpen ? '' : ' closed';
	const [user, setUser] = useState(getUser());
	const router = useRouter();

	onAuthStateChanged(auth, (authUser) => {
		setUser(authUser);
	});

	return (
		<div className={`hamburger-menu${secondClassStr}`}>
			<Navlink to="/" text="Home" onClick={requestMenuClose} />
			<Navlink to="/levels" text="Community Levels" onClick={requestMenuClose} />
			<Navlink to="/music-level-studio" text="Music Level Studio" onClick={requestMenuClose} />
			<Navlink to="/news" text="News" onClick={requestMenuClose} />
			<Navlink to="/about" text="About" onClick={requestMenuClose} />
			<hr style={{ width: '85%' }} />
			<p
				style={{ color: 'gray', fontSize: '12px', margin: '4px' }}
			>{user === null ? 'Logged out' : `Logged in as ${user.displayName}`}
			</p>
			<div style={{ display: user !== null ? 'flex' : 'none', flexDirection: 'column' }}>
				<Navlink text="Your Music Projects" to="/projects" onClick={requestMenuClose} />
				<Navlink text="Your Levels" to="/your-levels" onClick={requestMenuClose} />
				<Navlink text="Your Bookmarks" to="/bookmarks" onClick={requestMenuClose} />
				<Navlink text="Settings" to="/settings" onClick={requestMenuClose} />
				<div style={{ padding: '10px' }}>
					<TriggerButton
						text="Log Out"
						type="blue"
						onClick={() => {
							logout();
							requestMenuClose();
							router.push('/');
						}}
					/>
				</div>
			</div>
			<div style={{ display: user === null ? '' : 'none', padding: '10px' }}>
				<TriggerButton text="Log In" type="blue" onClick={() => { promptGoogleLogin(); }} />
			</div>
		</div>
	);

	/**
	 * Executes when the menu requests to be closed.
	 */
	function requestMenuClose() {
		props.onCloseEvent();
	}
}

export default HamburgerMenu;
