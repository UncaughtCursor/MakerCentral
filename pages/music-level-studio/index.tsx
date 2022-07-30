import AppFrame from '@components/AppFrame';
import ActionButton from '@components/pages/controls/ActionButton';
import React from 'react';

export default function MLSLandingPage() {
	return (
		<AppFrame
			title="Music Level Studio - MakerCentral"
			description="Automatically generate music levels, even global looping music!"
		>
			<div>
				<h1>Want to Be the Next Maker Maestro?</h1>
				<p>This tool can help. Easily generate Mario Maker 2 music levels using MIDI files!
				</p>
				<br />
				<ActionButton text="Get Started" to="/music-level-studio/dashboard" />
			</div>
		</AppFrame>
	);
}
