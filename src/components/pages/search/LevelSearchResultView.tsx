import { LevelSearchResults, numResultsPerPage } from '@scripts/browser/MeilisearchUtil';
import React from 'react';
import LevelPreview from '../browser/LevelPreview';
import LevelSearchPageControl from './LevelSearchPageControl';

/**
 * Displays level search results.
 * @param props The props:
 * - results: The results of the search.
 */
function LevelSearchResultView(props: {
	results: LevelSearchResults,
}) {
	return (
		<div style={{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: '20px',
		}}
		>
			<span>{`Found about ${props.results.numResults.toLocaleString()} results in ${props.results.computeTimeMs / 1000} seconds`}</span>
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
					.map((level) => <LevelPreview level={level} key={level.id} />)}
			</div>
			<LevelSearchPageControl curSearchResults={props.results} />
		</div>
	);
}

export default LevelSearchResultView;
