import AppFrame from '@components/AppFrame';
import LevelPreview from '@components/pages/browser/LevelPreview';
import { LevelSearchResults, searchLevels } from '@scripts/browser/MeilisearchUtil';
import React from 'react';

/**
 * The search page.
 * @param props The server-side props.
 * * results: The search results.
 */
function SearchResultsPage(props: {
	results: LevelSearchResults
}) {
	return (
		<AppFrame title={`'${props.results.searchData.query}' - MakerCentral Levels`}>
			<h1>Search Results</h1>
			<div style={{
				minHeight: '100px',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: '20px',
			}}
			>
				{props.results.results.map((level) => <LevelPreview level={level} key={level.id} />)}
			</div>
		</AppFrame>
	);
}

export default SearchResultsPage;

/**
 * Fetches level data at request time.
 * @param context The context of the request. Includes the URL parameters.
 * @returns The props to render at request time.
 */
export async function getServerSideProps(context: { params: {
	q: string,
}}) {
	const query = context.params.q;
	return {
		props: {
			results: await searchLevels({ query }),
		},
	};
}
