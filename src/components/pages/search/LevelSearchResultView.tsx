import { LevelSearchResults, numResultsPerPage } from '@scripts/browser/MeilisearchUtil';
import React from 'react';
import LevelPreview from '../browser/LevelPreview';
import LevelSearchPageControl from './LevelSearchPageControl';

/**
 * Displays level search results.
 * @param props The props:
 * - results: The results of the search.
 * - thumbnailUrls: An object matching level IDs with thumbnail URLs.
 * - isWidget: (Optional) Whether or not the component should be able to dynamically
 * update and trigger callbacks for user events. Defaults to true.
 * - onPageChange (Optional) Function to be called when the page has changed.
 * The parameter is the change in the page index.
 */
function LevelSearchResultView(props: {
	results: LevelSearchResults,
	thumbnailUrls: {[key: string]: string},
	isWidget?: boolean,
	onPageChange?: (delta: number) => void,
}) {
	return (
		<div style={{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: '20px',
		}}
		>
			{!props.isWidget! ? (
				<span>{`Found about ${props.results.numResults.toLocaleString()} results in ${props.results.computeTimeMs / 1000} seconds`}</span>
			) : null}
			{props.results.results.length === 0 ? (
				<span style={{
					margin: '0 auto',
					fontWeight: 'bold',
				}}
				>No levels here.
				</span>
			) : null}
			<div className="level-results">
				{props.results.results.slice(0, numResultsPerPage)
					.map((level) => (
						<LevelPreview
							level={level}
							thumbnailUrl={props.thumbnailUrls[level.id]}
							key={level.id}
						/>
					))}
			</div>
			<LevelSearchPageControl
				goToPage={!props.isWidget!}
				curSearchResults={props.results}
				onPageChange={props.onPageChange!}
			/>
		</div>
	);
}

LevelSearchResultView.defaultProps = {
	isWidget: true,
	onPageChange: () => {},
};

export default LevelSearchResultView;
