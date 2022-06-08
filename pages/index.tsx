import AppFrame from '@components/AppFrame';
import LandingPageCard from '@components/main/landing-page/LandingPageCard';
import Link from 'next/link';
import React from 'react';
import ActionButton from '../src/components/pages/controls/ActionButton';

/**
 * The landing page of the site.
 */
function Home() {
	const text = `Text search, browse, and bookmark almost every Mario Maker 2 level ever uploaded.
	For the first time in history.`;
	const columnWidth = '600px';

	return (
		<AppFrame>
			<div style={{
				width: '90vw',
				maxWidth: columnWidth,
				margin: '0 auto',
			}}
			>
				<h1 style={{
					textAlign: 'left',
					marginTop: '20px',
				}}
				>Coming Soon: Search and Bookmark Over 26 Million Levels
				</h1>
				<p style={{
					textAlign: 'left',
					fontSize: '18px',
					margin: '40px 0',
				}}
				>{text}
				</p>
				<div style={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'center',
					alignItems: 'center',
					gap: '20px',
				}}
				>
					<div style={{
						position: 'relative',
					}}
					>
						<ActionButton
							to="/levels"
							text="Try the Demo"
						/>
					</div>
					<a href="https://medium.com/@maker-central/announcing-a-site-to-search-26-million-mario-maker-2-levels-ddcbdec7ba5a">Read More</a>
				</div>
			</div>
		</AppFrame>
	);
}

export default Home;
