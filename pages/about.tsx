import React from 'react';
import AppFrame from '@components/AppFrame';
import { patreonLink } from '@scripts/site/FirebaseUtil';

/**
 * The landing page of the site.
 */
function About() {
	return (
		<AppFrame title="About - MakerCentral">
			<h1>About</h1>
			<div style={{ maxWidth: '600px', margin: '0 auto' }}>
				<p className="explanatory-text">Under Construction (Again)
				</p>
			</div>
		</AppFrame>
	);
}

export default About;
