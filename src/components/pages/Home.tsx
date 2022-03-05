import React from 'react';
import ActionButton from './controls/ActionButton';

/**
 * The landing page of the site.
 */
function Home() {
	return (
		<div>
			<h1>Want to Be the Next Maker Maestro?</h1>
			<p>This site can help. Easily generate Mario Maker 2 music levels using MIDI files!
			</p>
			<br />
			<ActionButton text="Get Started" to="/builder" />

		</div>
	);
}

export default Home;
