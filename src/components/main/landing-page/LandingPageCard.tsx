import Color from 'color';
import React from 'react';

interface LandingPageCardProps {
	headerText: string;
	text: string;
	backgroundColor: string;
	linkButton?: {
		text: string;
		url: string;
		color: string;
	}
}

/**
 * A card that displays on a landing page to show site features.
 * @param props The props.
 * - headerText: The text that displays the header.
 * - text: The supporting text to display.
 * - backgroundColor: The background color for the block.
 * - linkButton: An optional button to display.
 * - linkButton.text: The text to display on the button.
 * - linkButton.url: The url that the button leads to.
 * - linkButton.color: The background color of the button.
 */
function LandingPageCard(props: LandingPageCardProps) {
	const color = new Color(props.backgroundColor);
	const contentColor = color.darken(0.2);

	return (
		<div className="landing-card">
			<div
				className="landing-card-title-container"
				style={{
					backgroundColor: props.backgroundColor,
				}}
			>
				<h2>{props.headerText}</h2>
			</div>
			<div
				className="landing-card-content"
				style={{
					backgroundColor: contentColor.toString(),
				}}
			>
				<p>{props.text}</p>
			</div>
		</div>
	);
}

export default LandingPageCard;
