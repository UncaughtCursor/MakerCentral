import { LevelSearchResults } from '@scripts/browser/MeilisearchUtil';
import React from 'react';
import LevelPreview from '../browser/LevelPreview';

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
			minHeight: '100px',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: '20px',
		}}
		>
			<span>{`Found about ${props.results.numResults.toLocaleString()} results in ${props.results.computeTimeMs / 1000} seconds`}</span>
			<div style={{
				minHeight: '100px',
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				gap: '20px',
				flexWrap: 'wrap',
				width: '90vw',
				maxWidth: '1000px',
				justifyContent: 'center',
			}}
			>{props.results.results.map((level) => <LevelPreview level={level} key={level.id} />)}
			</div>
		</div>
	);
}

export default LevelSearchResultView;
