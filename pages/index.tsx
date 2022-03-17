import AppFrame from '@components/AppFrame';
import Link from 'next/link';
import React from 'react';
import ActionButton from '../src/components/pages/controls/ActionButton';

/**
 * The landing page of the site.
 */
function Home() {
	return (
		<AppFrame>
			<h1>Want to Be the Next Maker Maestro?</h1>
			<p>This site can help. Easily generate Mario Maker 2 music levels using MIDI files!
			</p>
			<br />
			<ActionButton text="Get Started" to="/music-level-studio" />
			<br />
			<br />
			<p>Once you&apos;re done, you can share it in the <Link href="/levels">level gallery!</Link></p>
			<p>(You can also share any non-music levels you&apos;ve made there, too!)</p>
		</AppFrame>
	);
}

export default Home;
