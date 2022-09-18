import React from 'react';
import AppFrame from '@components/AppFrame';
import {
	discordLink, kofiLink, patreonLink, twitterLinkPersonal,
} from '@scripts/site/FirebaseUtil';
import TextSection from '@components/main/TextSection';

/**
 * The about page of the site.
 */
function About() {
	return (
		<AppFrame title="About - MakerCentral">
			<h1>About</h1>
			<TextSection
				title="What is MakerCentral?"
				body={[<>MakerCentral is a comprehensive fan-made search engine and bookmarking site for Mario Maker 2.</>,
					<>Many Mario Maker 2 players have expressed the desire to search levels by text and bookmark them since the game&apos;s release in 2019.</>,
					<>Now, three years later, I have developed this website to solve both of these problems. It is now possible to search through and bookmark every level in the world!</>]}
			/>
			<TextSection
				title="Who made this site?"
				body={<>I, UncaughtCursor, am the sole developer of this website. I&apos;ve been working on it for over a year, first starting with Music Level Studio, and have spent the past few months working on the level search engine.</>}
			/>
			<TextSection
				title="Where does the data come from?"
				body={<>The data was obtained using TheGreatRambler&apos;s API and the tools used to run it. A big thanks to him for his work on the API and his direct help with obtaining the data. It would have been impossible without him.</>}
			/>
			<TextSection
				title="How does this site pay for itself?"
				body={[<>Donations.</>,
					<>Although I originally planned on not monetizing this site due to legal concerns, this is unsustainable; I will soon run out of money to pay for the site's ongoing expenses.</>,
					<>In other words, <b>this site will die soon without donations from people like you.</b></>,
					<>If you find this site useful and want it to stay available for everyone, please consider donating on <a href={patreonLink} target="_blank" rel="noopener noreferrer">Patreon</a> or <a href={kofiLink} target="_blank" rel="noopener noreferrer">Ko-Fi</a>. Every 5 dollars donated is another day that the site can stay running.</>]}
			/>
			<TextSection
				title="Donations - Thank You!"
				body={[<>I would like to thank the following people for their generous donations. In parentheses is how much longer this site will last thanks to them.</>,
					<ul>
						<li>tint - $40 (8 days)</li>
						<li>Anti Node - $10 (2 days)</li>
						<li>Taan Wallbanks - $5.83 (1 day, 4 hr)</li>
						<li>NintendoThumb@YT - $5 (1 day)</li>
						<li>Cody Stumma - $5 (1 day)</li>
					</ul>,
				]}
			/>
		</AppFrame>
	);
}

export default About;
