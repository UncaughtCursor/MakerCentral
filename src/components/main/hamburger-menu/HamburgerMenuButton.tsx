import React from 'react';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import './HamburgerMenu.css';

/**
 * The button that opens and closes the hamburger menu.
 * @param props The props:
 * * isMenuOpen: Whether or not the menu is open.
 * * onToggle: The function to execute when the button is clicked.
 */
function HamburgerMenuButton(props: {
	isMenuOpen: boolean,
	onToggle: (arg0: boolean) => void
}) {
	return (
		<div className="hamburger-menu-container">
			<button
				type="button"
				className="hamburger-menu-btn"
				onClick={handleToggle}
				onKeyDown={handleToggle}
			>
				{getIcon()}
			</button>
		</div>
	);

	/**
	 * Runs when the menu is toggled.
	 */
	function handleToggle() {
		props.onToggle(!props.isMenuOpen);
	}

	/**
	 * Returns the icon to display.
	 * @returns The icon element to be displayed.
	 */
	function getIcon() {
		if (!props.isMenuOpen) {
			return (
				<MenuIcon className="hamburger-icon" fontSize="large" style={{ color: 'var(--text-color)' }} />
			);
		}
		return (
			<CloseIcon className="hamburger-icon" fontSize="large" style={{ color: 'var(--text-color)' }} />
		);
	}
}

export default HamburgerMenuButton;
