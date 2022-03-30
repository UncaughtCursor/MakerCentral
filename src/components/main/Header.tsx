import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from './Nav';
import UserMenu from './UserMenu';
import HamburgerMenuButton from './hamburger-menu/HamburgerMenuButton';
import HamburgerMenu from './hamburger-menu/HamburgerMenu';
import EventPopup from './EventPopup';
import NotificationWidget from './NotificationWidget';

/**
 * The header of the webpage, containing the logo and navigation buttons.
 */
function Header() {
	const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);
	const isMakerCentral = false; // FIXME: SET TO FALSE IN PROD
	const titleContents = !isMakerCentral ? (
		<>
			<div style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				marginLeft: '8px',
			}}
			>
				<img
					src="/logo.png"
					alt="Music Level Studio"
					width={45}
					height={45}
				/>
			</div>
			<h3 style={{ textDecoration: 'none' }}>Music Level Studio</h3>
			<p style={{
				margin: 0,
				marginLeft: '10px',
				fontSize: '12px',
				fontWeight: 'bold',
				textDecoration: 'none',
			}}
			>BETA
			</p>
		</>
	) : (
		<div style={{
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			marginLeft: '8px',
		}}
		>
			<img
				src="/logo.png"
				alt="MakerCentral"
				width={228}
				height={25}
			/>
		</div>
	);
	return (
		<>
			<div className="header">
				<Link href="/">
					<div className="titleContainer" style={{ cursor: 'pointer' }}>
						{titleContents}
					</div>
				</Link>
				<Navbar />
				<NotificationWidget />
				<UserMenu />
				<HamburgerMenuButton
					isMenuOpen={isHamburgerMenuOpen}
					onToggle={setHamburgerMenuOpenState}
				/>
			</div>
			<HamburgerMenu
				isOpen={isHamburgerMenuOpen}
				onCloseEvent={() => {
					setHamburgerMenuOpenState(false);
				}}
			/>
			<EventPopup
				id="firebaseui-auth-container"
				eventName="login-request"
				hideEventName="login-end"
			/>
		</>
	);

	/**
	 * Toggles the hamburger menu.
	 * @param isOpen Whether or not the hamburger menu is open.
	 */
	function setHamburgerMenuOpenState(isOpen: boolean) {
		setIsHamburgerMenuOpen(isOpen);
	}
}

export default Header;
