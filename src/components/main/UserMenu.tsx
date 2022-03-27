/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/no-unused-prop-types */
import React, { useState } from 'react';
import Link from 'next/link';
import OutsideClickHandler from 'react-outside-click-handler';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {
	onAuthStateChanged, User,
} from 'firebase/auth';
import { auth, logout, promptLogin } from '@scripts/site/FirebaseUtil';
import TriggerButton from '@components/pages/controls/TriggerButton';
import useUserInfo from '@components/hooks/useUserInfo';

/**
 * The user menu that displays on the site header.
 */
function UserMenu() {
	const [isOpen, setIsOpen] = useState(false);

	const userInfo = useUserInfo();
	const user = userInfo !== null ? userInfo.user : null;
	const signedIn = user !== null;

	const pfp = (userInfo?.avatarUrl !== null
		&& userInfo?.avatarUrl !== '' && userInfo?.avatarUrl !== undefined) ? (
			<img
				src={userInfo?.avatarUrl}
				alt={userInfo?.name}
				height="40px"
				className="user-icon"
				style={{
					border: '1px solid var(--bg-lite)',
				}}
			/>
		) : null;

	return (
		<div className="usermenu-container">
			<div className="login-container" style={{ display: !signedIn ? 'flex' : 'none' }}>
				<TriggerButton
					text="Log In"
					type="blue"
					onClick={promptLogin}
				/>
			</div>
			<div style={{ display: signedIn ? 'flex' : 'none' }}>
				<OutsideClickHandler onOutsideClick={() => { setIsOpen(false); }}>
					<button
						type="button"
						className="usermenu"
						onClick={() => { setIsOpen(!isOpen); }}
						onKeyDown={() => { setIsOpen(!isOpen); }}
					>
						<AccountCircleIcon
							className="user-icon"
							fontSize="large"
							style={{
								color: 'var(--text-color)',
								display: pfp === null ? '' : 'none',
							}}
						/>
						{pfp}
					</button>

					<UserMenuDropdown isVisible={isOpen}>
						<p
							style={{ color: 'gray', fontSize: '12px', margin: '4px' }}
						>{!signedIn ? 'Logged out' : `Logged in as ${userInfo?.name}`}
						</p>
						<UserMenuItem text="Your Music Projects" to="/projects" />
						<UserMenuItem text="Your Levels" to="/your-levels" />
						<UserMenuItem text="Your Bookmarks" to="/bookmarks" />
						<UserMenuItem text="Settings" to="/settings" />
						<hr />
						<UserMenuItem text="Log Out" to="/" do={logout} />
					</UserMenuDropdown>
				</OutsideClickHandler>
			</div>
		</div>
	);
}

/**
 * The dropdown menu for user actions.
 * @param props.isVisible Whether or not the menu is visible.
 */
function UserMenuDropdown(props: {isVisible: boolean, children: React.ReactNode}) {
	return (
		<div className={`usermenudropdown ${!props.isVisible ? 'hidden' : ''}`}>
			{props.children}
		</div>
	);
}

/**
 * A dropdown menu item for user actions.
 * @param props.text The text to display.
 * @param props.to (Optional) The destination path when clicked.
 * @param props.do (Optional) A function to execute when clicked.
 * @param props.isVisible Whether or not the item is visible.
 */
function UserMenuItem(props: {
	text: string,
	to?: string | null,
	do?: () => void,
	isVisible?: boolean
}) {
	if (props.to !== null) {
		return (
			<Link href={props.to!}>
				<a
					className={`usermenuitem ${!props.isVisible ? 'hidden' : ''}`}
					onClick={props.do!}
					role="button"
				>{props.text}
				</a>
			</Link>
		);
	}

	return (
		<a
			className={`usermenuitem ${!props.isVisible ? 'hidden' : ''}`}
			role="button"
			onClick={props.do!}
		>{props.text}
		</a>
	);
}

UserMenuItem.defaultProps = {
	isVisible: true,
	to: null,
	do: () => {},
};

export default UserMenu;
export { UserMenuDropdown };
export { UserMenuItem };
