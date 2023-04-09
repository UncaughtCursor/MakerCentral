import {
	discordLink, kofiLink, patreonLink, privacyPolicyUrl, termsOfServiceUrl, twitterLink,
} from '@scripts/site/FirebaseUtil';
import React, { useEffect, useRef } from 'react';

/**
 * The footer of the webpage.
 */
function Footer() {
	const ref = useRef<HTMLDivElement>(null);
	const eventListener = useRef<() => void | null>();

	useEffect(() => {
		// Change the footer height CSS variable when the window is resized.
		if (ref.current) {
			if (!eventListener.current) {
				eventListener.current = () => {
					const footerHeight = ref.current?.clientHeight;
					if (footerHeight) {
						document.documentElement.style.setProperty(
							'--footer-height',
							`${footerHeight}px`,
						);
					}
				};
				window.addEventListener('resize', eventListener.current);

				// Execute the event listener once to set the initial value.
				eventListener.current();
			}
		}
	}, [ref]);

	useEffect(() => () => {
		// Remove the resize event listener when the component unmounts.
		if (eventListener.current) {
			window.removeEventListener('resize', eventListener.current);
		}
	}, []);

	return (
		<div className="footer" ref={ref}>
			<p>Created by UncaughtCursor</p>
			<p><a href={twitterLink}>Twitter</a></p>
			<p><a href={discordLink}>Discord</a></p>
			<p><a href={patreonLink}>Patreon</a></p>
			<p><a href={kofiLink}>Ko-fi</a></p>
			<p><a href={termsOfServiceUrl}>Terms of Service</a></p>
			<p><a href={privacyPolicyUrl}>Privacy Policy</a></p>
		</div>
	);
}

export default Footer;
