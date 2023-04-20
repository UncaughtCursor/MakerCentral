import React from 'react';
import AppFrame from '@components/AppFrame';
import { useRouter } from 'next/router';
import PromoSearchBar, { getPromoSearchUrl } from '@components/pages/promotion/PromoSearchBar';

/**
 * The user level browsing view.
 */
function LevelBrowser() {
	const history = useRouter();

	return (
		<AppFrame
			title="Promoted Levels - MakerCentral"
		>
			<div style={{
				display: 'flex',
				flexDirection: 'column',
				marginTop: '100px',
			}}
			>
				<div style={{
					margin: '0 auto',
				}}
				>
					<img
						src="/logo.png"
						alt="MakerCentral Promoted Levels"
						style={{
							width: '90vw',
							maxWidth: '400px',
						}}
					/>
					<h4 style={{
						marginTop: '4px',
						fontSize: '20px',
					}}
					>Promoted Levels
					</h4>
					<br />
					<h4 style={{
						margin: '0',
						textAlign: 'left',
						marginLeft: '20px',
						marginBottom: '2px',
					}}
					>Search promoted levels...
					</h4>
					<PromoSearchBar
						onSubmit={(query) => {
							history.push(getPromoSearchUrl(query));
						}}
						initialVal=""
					/>
				</div>
			</div>
		</AppFrame>
	);
}

export default LevelBrowser;
