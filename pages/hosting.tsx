/* eslint-disable max-len */
import React from 'react';
import AppFrame from '@components/AppFrame';
import TextSection from '@components/main/TextSection';
import wiz128 from '@assets/wizulus-128.png';

/**
 * The about page of the site.
 */
function About() {
	return (
		<AppFrame title="Hosting - MakerCentral">
			<h1>Hosting</h1>
			<TextSection
				title="Dear Friends"
				body={[
					<>It is I, Wizulus Redikulus, your friendly neighborhood wizard known for the Wizulus Level Viewer, Open Course World, and Ironbros.gg.</>,
					<>As many of you know, our friend UncaughtCursor's health has been degrading, calling his very mortality into question.</>,
					<>In an effort to preserve UncaughtCursor's creation for all time, I have volunteered to take over hosting and maintenance, including future development if UncaughtCursor is unable to overcome his health challenges.</>,
				]}
			/>
			<TextSection
				title="Why is the site slow?"
				body={[
					<>At the heart of MakerCentral is a Meilisearch database that demands significant resources to host. That server costs $140/month to run.</>,
					<>We have not been able to collect enough donations to keep the servers running, so I have moved the Meilisearch server to much cheaper and slower hardware.</>,
					<>If we are able to gather enough contributors to cover hosting costs, Meilisearch will be moved back into the cloud.</>,
				]}
			/>
			<TextSection
				title="How can I help?"
				body={<>Consider joining my <a href="https://www.buymeacoffee.com/wizulus/uncaughtcursor-update">Buy me a Coffee</a> page for $5/mo. As few as 30 regular contributors can help keep MakerCentral.io online.</>}
			/>

			<p>
				Sincerely, <br />
				Wizulus Redikulus <br />
				<img src={wiz128.src} alt="🧙‍♂️" />
			</p>
		</AppFrame>
	);
}

export default About;
