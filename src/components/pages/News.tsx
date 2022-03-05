import React from 'react';

const discordLink = 'https://discord.gg/KhmXzfp';
const twitterLink = 'https://twitter.com/MusicLvlStudio';

/**
 * Displays site news.
 */
function News() {
	return (
		<>
			<h1>News</h1>
			<p>Under Construction!</p>
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
		</>
	);
}

export default News;
