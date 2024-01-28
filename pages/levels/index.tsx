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
			<div className="search-page-outer-container">
				<div className="search-page-inner-container">
					<img
						src="/logo.png"
						alt="MakerCentral Search"
						className="search-page-logo"
					/>
					<h4 className="search-page-subtitle">Search</h4>
					<br />
					<h4 className="search-bar-text">{`Search over ${marketedLevelDBSize.toLowerCase()} levels...`}</h4>
					<LevelSearchBar
						onSubmit={(query, filterSettings) => {
							history.push(getSearchUrl(query, filterSettings));
						}}
						initialVal=""
						initialSettings={defaultFilterSettings.Levels}
					/>
				</div>
				{/* <div className="donation-callout">
					<div className="donation-callout-text-container">
						<h3>MakerCentral Needs Your Help!</h3>
						<p>
							MakerCentral is run by a single
							developer, and I&apos;ll eventually run out of money
							to keep this site running, so please consider donating to help keep
							MakerCentral alive! You&apos;ll be able to <b>promote your levels</b> in
							the search results if you do.
						</p>
					</div>
					<a
						href="/promotion"
						target="_blank"
						rel="noopener noreferrer"
						className="donation-button"
					>
						Learn More
					</a>
				</div> */}
			</div>
		</AppFrame>
	);
}

export default LevelBrowser;
