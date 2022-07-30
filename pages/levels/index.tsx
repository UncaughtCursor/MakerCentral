import React from 'react';
import AppFrame from '@components/AppFrame';
import LevelSearchBar, { getSearchUrl } from '@components/pages/search/LevelSearchBar';
import { useRouter } from 'next/router';
import { defaultFilterSettings } from '@scripts/browser/SearchUtil';
import { marketedLevelDBSize } from '@data/constants';

/**
 * The user level browsing view.
 */
function LevelBrowser() {
	const history = useRouter();

	return (
		<AppFrame
			title="Browse Levels - MakerCentral"
			description="Search, browse, and bookmark over 800,000 popular Mario Maker 2 levels!"
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
					>Search
					</h4>
					<br />
					<h4 style={{
						margin: '0',
						textAlign: 'left',
						marginLeft: '20px',
						marginBottom: '2px',
					}}
					>{`Search over ${marketedLevelDBSize.toLowerCase()} levels...`}
					</h4>
					<LevelSearchBar
						onSubmit={(query, filterSettings) => {
							history.push(getSearchUrl(query, filterSettings));
						}}
						initialVal=""
						initialSettings={defaultFilterSettings.Levels}
					/>
				</div>
				{/* <LevelCategoryFeed extraQueryConstraints={[]} /> */}
			</div>
		</AppFrame>
	);
}

export default LevelBrowser;
