import {
	discordLink, privacyPolicyUrl, termsOfServiceUrl, twitterLink,
} from '@scripts/site/FirebaseUtil';
import React from 'react';

/**
 * The footer of the webpage.
 */
function Footer() {
	return (
		<div className="footer">
			<p>Created by UncaughtCursor</p>
			<p><a href={twitterLink}>Twitter</a></p>
			<p><a href={discordLink}>Discord</a></p>
			<p><a href={termsOfServiceUrl}>Terms of Service</a></p>
			<p><a href={privacyPolicyUrl}>Privacy Policy</a></p>
		</div>
	);
}

export default Footer;
