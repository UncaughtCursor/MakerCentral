/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import './Nav.css';

/**
 * The navigation menu in the site header.
 */
function Navbar() {
	return (
		<div className="navbar">
			<Navlink to="/" text="Home" />
			<Navlink to="/levels" text="Level Gallery" />
			<Navlink to="/builder" text="Music Level Studio" />
			<Navlink to="/news" text="News" />
			<Navlink to="/about" text="About" />
		</div>
	);
}

/**
 * A link in a navbar.
 * @param props.text The text to display.
 * @param props.to The destination path when clicked.
 * @param props.onClick (Optional) The function to execite when clicked.
 */
function Navlink(props: { to?: string | null; text: string; onClick?: () => void }) {
	// Allow sub-pages to light up the corresponding link unless it's the home page.
	const isMatch = props.to === '/' ? useRouteMatch({ path: props.to!, exact: true }) : useRouteMatch({ path: props.to!, exact: false });
	if (props.to! !== null) {
		return (
			<Link
				className={`navlink ${isMatch ? 'navlinkActive' : ''}`}
				to={props.to!}
				onClick={props.onClick}
			>{props.text}
			</Link>
		);
	}
	return (
		<a
			className={`navlink ${isMatch ? 'navlinkActive' : ''}`}
			onClick={props.onClick}
		>{props.text}
		</a>
	);
}

Navlink.defaultProps = {
	onClick: () => {},
	to: null,
};

export default Navbar;
export { Navlink };
