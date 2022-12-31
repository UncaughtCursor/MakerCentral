import React from 'react';
import AppFrame from '@components/AppFrame';
import {
	discordLink, kofiLink, patreonLink, twitterLinkPersonal,
} from '@scripts/site/FirebaseUtil';
import TextSection from '@components/main/TextSection';

// Donations; key = username, value = donation amount in cents
// Sort from highest to lowest
const donations: [string, number][] = [
	['tint', 18000],
	['NintendoThumbFan', 8000],
	['BeardBear', 3970],
	['Anti Node', 4000],
	['BamBoozil', 1000],
	['Taan Wallbanks', 2317],
	['Cody Stumma', 2000],
	['RogendGuy', 1800],
	['SirMystic', 1500],
	['Annette Wilson', 10000],
	['FauxBlue', 1000],
	['youyi1996', 5000],
].sort((a, b) => (b[1] as number) - (a[1] as number)) as [string, number][];

const totalDonations = donations.reduce((a, b) => a + b[1], 0);

const siteDailyCostCents = 500;

const daysPaidForByDonators: number[] = donations.map((donation) => {
	const [_, amount] = donation;
	const daysPaidFor = Math.floor(amount / siteDailyCostCents);
	return daysPaidFor;
});

const totalDaysPaidFor = Math.floor(totalDonations / siteDailyCostCents);

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
						{/* <li>tint - $40 (8 days)</li>
						<li>NintendoThumbFan - $20 (4 days)</li>
						<li>BeardBear - $10.79 (2 days, 3 hr)</li>
						<li>Anti Node - $10 (2 days)</li>
						<li>BamBoozil - $10 (2 days)</li>
						<li>Taan Wallbanks - $5.83 (1 day, 4 hr)</li>
	<li>Cody Stumma - $5 (1 day)</li> */}
						{donations.map((donation, i) => {
							const [username, amount] = donation;
							const daysPaidFor = daysPaidForByDonators[i];
							return (
								<li key={username}>
									{`${username} - $${(amount / 100).toFixed(2)} (${daysPaidFor} day${daysPaidFor === 1 ? '' : 's'})`}
								</li>
							);
						})}
					</ul>,
					<>Total amount donated: ${(totalDonations / 100).toFixed(2)} ({totalDaysPaidFor} day{totalDaysPaidFor === 1 ? '' : 's'})</>,
				]}
			/>
		</AppFrame>
	);
}

export default About;
