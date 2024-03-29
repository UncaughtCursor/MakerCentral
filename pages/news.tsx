import AppFrame from '@components/AppFrame';
import { discordLink, twitterLink } from '@scripts/site/FirebaseUtil';
import React from 'react';

/**
 * Displays site news.
 */
function News() {
	return (
		<AppFrame
			title="News - MakerCentral"
			description="The latest news regarding MakerCentral, the automatic music level generator!"
		>
			<h1>News</h1>
			<p>News feed for site updates coming soon!</p>
			<br />
			<p>For now, check the official&nbsp;
				<a
					href={discordLink}
					target="_blank"
					rel="noopener noreferrer"
				>Discord server
				</a>
				&nbsp;or&nbsp;
				<a
					href={twitterLink}
					target="_blank"
					rel="noopener noreferrer"
				>Twitter
				</a> for the latest news.
			</p>
		</AppFrame>
	);
}

export default News;
