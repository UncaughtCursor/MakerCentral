import AppFrame from '@components/AppFrame';
import React from 'react';

const discordLink = 'https://discord.gg/KhmXzfp';
const twitterLink = 'https://twitter.com/MusicLvlStudio';

/**
 * Displays site news.
 */
function News() {
	return (
		<AppFrame
			title="News - Music Level Studio"
			description="The latest news regarding Music Level Studio, the automatic music level generator!"
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
