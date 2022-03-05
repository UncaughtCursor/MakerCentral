import React, { useState } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import Navbar from './Nav';
import UserMenu from './UserMenu';
import Logo from '../../logo-test.png';
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
				<Link to="/" style={{ textDecoration: 'none' }}>
					<div className="titleContainer">
						<img src={Logo} alt="Music Level Studio" />
						<h3>Music Level Studio</h3>
						<p style={{
							margin: 0,
							marginLeft: '10px',
							fontSize: '12px',
							fontWeight: 'bold',
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
