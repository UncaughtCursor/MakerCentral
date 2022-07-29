import AppFrame from '@components/AppFrame';
import { marketedLevelDBSize } from '@data/constants';
import React from 'react';
import ActionButton from '../src/components/pages/controls/ActionButton';

/**
 * The landing page of the site.
 */
function Home() {
	const text = `Text search, browse, and bookmark every Mario Maker 2 level.
	For the first time in history.`;
	const bgImgWidthPx = 2560;
	const bgImgHeightPx = 1440;

	const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
	const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

	const bgImgWidth = bgImgWidthPx + Math.max(bgImgWidthPx, viewportWidth);
	const bgImgHeight = bgImgHeightPx + Math.max(bgImgHeightPx, viewportHeight);

	return (
		<AppFrame contentContainerClass="home-background">
			<div
				className="home-image"
				style={{
					width: `${bgImgWidth}px`,
					height: `${bgImgHeight}px`,
				}}
			/>
			<div className="home-info-container">
				<h1 style={{
					textAlign: 'left',
					marginTop: '0',
				}}
				>{`Search and Bookmark Over ${marketedLevelDBSize} Levels`}
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
							text="Try It Now"
						/>
					</div>
					<a href="https://medium.com/@maker-central/announcing-a-site-to-search-26-million-mario-maker-2-levels-ddcbdec7ba5a">Read More</a>
				</div>
			</div>
		</AppFrame>
	);
}

export default Home;
