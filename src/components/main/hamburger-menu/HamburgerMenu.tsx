import TriggerButton from '@components/pages/controls/TriggerButton';
import {
	auth, discordLink, getUser, kofiLink, logout, promptLogin,
} from '@scripts/site/FirebaseUtil';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import useUserInfo from '@components/hooks/useUserInfo';
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
	const userInfo = useUserInfo();
	const user = userInfo !== null ? userInfo.user : null;
	const router = useRouter();

	return (
		<div className={`hamburger-menu${secondClassStr}`}>
			<Navlink to="/" text="Home" onClick={requestMenuClose} />
			<Navlink to="/levels" text="Browse Levels" onClick={requestMenuClose} />
			<Navlink to="/music-level-studio" text="Music Level Studio" onClick={requestMenuClose} />
			<Navlink to={discordLink} openInNewTab text="Discord" onClick={requestMenuClose} />
			<Navlink to="/about" text="About" onClick={requestMenuClose} />
			<Navlink to={kofiLink} openInNewTab text="Donate" />
			<hr style={{ width: '85%' }} />
			<p
				style={{ color: 'gray', fontSize: '12px', margin: '4px' }}
			>{user === null ? 'Logged out' : `Logged in as ${user.displayName}`}
			</p>
			<div style={{ display: user !== null ? 'flex' : 'none', flexDirection: 'column' }}>
				<Navlink text="Your Bookmarks" to="/bookmarks" onClick={requestMenuClose} />
				<Navlink text="Your Music Projects" to="/projects" onClick={requestMenuClose} />
				{/* <Navlink text="Your Levels" to="/your-levels" onClick={requestMenuClose} /> */}
				{/* <Navlink text="Settings" to="/settings" onClick={requestMenuClose} /> */}
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
				<TriggerButton
					text="Sign In"
					type="blue"
					onClick={() => {
						requestMenuClose();
						promptLogin();
					}}
				/>
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
