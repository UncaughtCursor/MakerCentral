import React, { useState } from 'react';
import AppFrame from '@components/AppFrame';
import LevelSearchBar, { defaultFilterSettings, getSearchUrl, SearchFilterSettings } from '@components/pages/search/LevelSearchBar';
import { useRouter } from 'next/router';

/**
 * The user level browsing view.
 */
function LevelBrowser() {
	const history = useRouter();

	return (
		<AppFrame
			title="Levels - MakerCentral"
			description="Browse and play levels over 26 million Mario Maker 2 levels!"
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
						alt="MakerCentral Search"
						style={{
							width: '90vw',
							maxWidth: '400px',
						}}
					/>
					<h4 style={{
						marginTop: '4px',
						fontSize: '20px',
					}}
					>Search Preview
					</h4>
					<br />
					<h4 style={{
						margin: '0',
						textAlign: 'left',
						marginLeft: '20px',
						marginBottom: '2px',
					}}
					>Search over 800,000 popular levels...
					</h4>
					<LevelSearchBar
						onSubmit={(query, filterSettings) => {
							history.push(getSearchUrl(query, filterSettings));
						}}
						initialVal=""
						initialSettings={defaultFilterSettings}
					/>
				</div>
				{/* <LevelCategoryFeed extraQueryConstraints={[]} /> */}
			</div>
		</AppFrame>
	);
}

export default LevelBrowser;
