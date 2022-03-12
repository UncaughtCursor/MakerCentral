/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

/**
 * The navigation menu in the site header.
 */
function Navbar() {
	return (
		<div className="navbar">
			<Navlink to="/" text="Home" />
			<Navlink to="/levels" text="Community Levels" />
			<Navlink to="/music-level-studio" text="Music Level Studio" />
			<Navlink to="/news" text="News" />
			<Navlink to="/about" text="About" />
		</div>
	);
}

/**
 * A link in a navbar.
 * @param props.text The text to display.
 * @param props.to The destination path when clicked.
 * @param props.onClick (Optional) The function to execute when clicked.
 */
function Navlink(props: { to?: string | null; text: string; onClick?: () => void }) {
	// Allow sub-pages to light up the corresponding link unless it's the home page.
	const router = useRouter();
	const isMatch = isRouteMatch(props.to!, props.to === '/');
	if (props.to! !== null) {
		return (
			<Link href={props.to!}>
				<a
					className={`navlink ${isMatch ? 'navlinkActive' : ''}`}
					onClick={props.onClick}
				>
					{props.text}
				</a>
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

	/**
	 * Determines if the current URL matches the provided URL.
	 * @param url The URL to check against.
	 * @param exact Whether or not the URL has to be equal to the provided URL
	 * as opposed to starting with the same path.
	 * @returns Whether or not there is a match.
	 */
	function isRouteMatch(url: string, exact: boolean) {
		const currentUrl = router.pathname;
		if (exact) {
			return currentUrl === url;
		}
		return currentUrl.substring(0, url.length) === url;
	}
}

Navlink.defaultProps = {
	onClick: () => {},
	to: null,
};

export default Navbar;
export { Navlink };
