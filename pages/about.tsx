import React from 'react';
import AppFrame from '@components/AppFrame';
import {
	discordLink, twitterLinkPersonal,
} from '@scripts/site/FirebaseUtil';
import TextSection from '@components/main/TextSection';

/**
 * The landing page of the site.
 */
function About() {
	return (
		<AppFrame title="About - MakerCentral">
			<h1>About</h1>
			<TextSection
				title="What is MakerCentral?"
				body={[<>MakerCentral is a comprehensive fan-made search engine and bookmarking site for Mario Maker 2.</>,
					<>Many Mario Maker 2 players have expressed the desire to search levels by text and bookmark them since the game&apos;s release in 2019.</>,
					<>Now, three years later, I have developed this website to solve both of these problems. It is now possible to search through and bookmark nearly every level in the world!</>]}
			/>
			<TextSection
				title="Who made this site?"
				body={<>I, UncaughtCursor, am the sole developer of this website. I&apos;ve been working on this it for over a year, first starting with Music Level Studio, and have spent the past few months working on the level search engine.</>}
			/>
			<TextSection
				title="Where does the data come from?"
				body={<>The data was obtained using TheGreatRambler&apos;s API and the tools used to run it. A big thanks to him for his work on the API and his direct help with obtaining the data. It would have been impossible without his help.</>}
			/>
			<TextSection
				title="How does this site make money?"
				body={[<>It doesn&apos;t. And it never will.</>,
					<>Due to the legal risks of even attempting to make money from this site, I have decided to not monetize it.</>,
					<>Unfortunately, that means this site has no way of covering its overhead costs, and I will need to earn money through other ventures to do so.</>,
					<>If you&apos;re open to trying any projects I create in the future, please consider following me on <a href={twitterLinkPersonal} target="_blank" rel="noopener noreferrer">Twitter</a> or joining my <a href={discordLink} target="_blank" rel="noopener noreferrer">Discord community</a>.</>]}
			/>
		</AppFrame>
	);
}

export default About;
