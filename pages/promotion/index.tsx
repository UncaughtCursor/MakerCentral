import React from 'react';
import AppFrame from '@components/AppFrame';
import { kofiLink, patreonLink, discordLink } from '@scripts/site/FirebaseUtil';
import TextSection from '@components/main/TextSection';
import Section from '@components/main/Section';

// TODO: Finish the text for this page and revise anything as needed

const searchPageUrl = '/promotion/search';

/**
 * The level promotion page.
 */
function PromotionPage() {
	return (
		<AppFrame title="Level Promotion - MakerCentral">
			<h1>Promoting Your Levels</h1>
			<TextSection
				title="Reach Thousands of Potential Players"
				body={[<>MakerCentral requires donations to stay afloat. That&apos;s why I&apos;ve created a system to reward supporters for helping me keep the site running: level promotion!</>,
					<>Thousands of Mario Maker 2 players use MakerCentral every month to find interesting levels to play. This is your chance to get your own levels in front of them.</>,
				]}
			/>
			<TextSection
				title="How It Works"
				body={[<>You can promote your levels by donating to MakerCentral. The more you donate, the more your levels will be shown to other players.</>,
					<>Here&apos;s the math:</>,
					// eslint-disable-next-line react/jsx-no-useless-fragment
					<span style={{
						textAlign: 'center',
						display: 'block',
					}}
					>
						<b>Every $3 donated = 30 days of promotion for one level.</b>
					</span>,
					<>For example, if you donate $12, you can promote 4 levels at once for 30 days.</>,
					<>Your levels will then show up in relevant searches below the normal search results.</>,
					<>For example, if you make a troll level, and a user searches for &quot;troll&quot;, that user is likely to see your level.</>,
					<>For donation methods, you have a couple of options: Ko-fi or Patreon.</>,
				]}
			/>
			<Section
				title="Ko-fi"
				body={[
					<p className="explanatory-text">Ko-fi is a one-time donation platform. If you donate on Ko-Fi, your levels will be promoted for 30 days.</p>,
					<p className="explanatory-text">Here&apos;s how to donate on Ko-fi:</p>,
					<ol>
						<li>Go to my <a href={kofiLink}>Ko-fi page</a>.</li>
						<li>Click the &quot;Donate&quot; button.</li>
						<li>Enter the amount you&apos;d like to donate, keeping in mind the $3 per level system.</li>
						<li>In the &quot;Your message&quot; box, enter the Course IDs of the levels you&apos;d like to promote.</li>
						<li>Click the &quot;Donate&quot; button below the form and follow the onscreen instructions to enter your payment information.</li>
						<li>Your levels should be promoted within 24 hours. If not, check to see if I messaged you on Ko-fi. You can check <a href={searchPageUrl}>here</a> to see if your levels are currently promoted.</li>
					</ol>,
				]}
				// TODO: Make the /promoted page
			/>
			<Section
				title="Patreon"
				body={[
					<p className="explanatory-text">Patreon, unlike Ko-fi, is a monthly donation platform. Your levels will stay promoted for as long as your subscription is active, so it&apos;s more convenient for promoting your levels long-term.</p>,
					<p className="explanatory-text">Here&apos;s how to donate on Patreon:</p>,
					<ol>
						<li>Go to my <a href={patreonLink}>Patreon page</a>.</li>
						<li>Click the &quot;Join&quot; button.</li>
						<li>Enter the amount you&apos;d like to donate, keeping in mind the $3 per level system.</li>
						<li>Go to my page again and click the &quot;Message&quot; button. On mobile, it may be in the &quot;...&quot; menu.</li>
						<li>Send a message with the Course IDs of the levels you&apos;d like to promote.</li>
						<li>Your levels should be promoted within 24 hours. If not, check to see if I messaged you on Patreon. You can check <a href={searchPageUrl}>here</a> to see if your levels are currently promoted.</li>
					</ol>,
				]} // TODO: Finish this section
			/>
			<TextSection
				title="What's Next?"
				body={[
					<>Once you have donated, I will enter the levels you specified into the promotion system, most likely within 24 hours. Your levels will then show up in relevant searches below the normal search results.</>,
					<>You can check if your level has been promoted by looking at the <a href={searchPageUrl}>promotion search engine</a> and searching for your level.</>,
					<>After your promotion runs out (if you donated on Ko-fi), you can donate again to promote your levels for another 30 days. For Patreon, your levels will stay promoted as long as your subscription is active.</>,
					<>I&apos;ll try to make adjustments to the promotion algorithm as needed to ensure that each level is shown to a good amount of players.</>,
				]}
			/>
			<TextSection
				title="Need Help?"
				body={[
					<>If you have questions or concerns, you can reach out to me on <a href={discordLink}>Discord</a>. I am usually available to answer questions.</>,
				]}
			/>

		</AppFrame>
	);
}

export default PromotionPage;
