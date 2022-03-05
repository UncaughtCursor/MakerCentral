import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from './Nav';
import UserMenu from './UserMenu';
import HamburgerMenuButton from './hamburger-menu/HamburgerMenuButton';
import HamburgerMenu from './hamburger-menu/HamburgerMenu';

/**
 * The header of the webpage, containing the logo and navigation buttons.
 */
function Header() {
	const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);
	return (
		<>
			<div className="header">
				<Link href="/">
					<div className="titleContainer">
						<Image src="/logo.png" alt="Music Level Studio" width={45} height={45} />
						<h3 style={{ textDecoration: 'none' }}>Music Level Studio</h3>
						<p style={{
							margin: 0,
							marginLeft: '10px',
							fontSize: '12px',
							fontWeight: 'bold',
							textDecoration: 'none',
						}}
						>EARLY ACCESS
						</p>
					</div>
				</Link>
				<Navbar />
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
