import AppFrame from '@components/AppFrame';
import LevelPreview from '@components/pages/browser/LevelPreview';
import LevelSearchBar from '@components/pages/search/LevelSearchBar';
import { LevelSearchResults, searchLevels } from '@scripts/browser/MeilisearchUtil';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

/**
 * The search page.
 * @param props The server-side props.
 * * results: The search results.
 */
function SearchResultsPage(props: {
	results: LevelSearchResults
}) {
	const history = useRouter();

	return (
		<AppFrame title={`'${props.results.searchData.query}' - MakerCentral Levels`}>
			<div style={{
				margin: '24px auto',
				width: 'max-content',
				marginTop: '36px',
			}}
			>
				<LevelSearchBar
					initialVal={props.results.searchData.query}
					onSubmit={(val) => { history.push(`/levels/search/${val}`); }}
				/>
			</div>
			<div style={{
				minHeight: '100px',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: '20px',
			}}
			>
				<span>{`Found about ${props.results.numResults.toLocaleString()} results in ${props.results.computeTimeMs / 1000} seconds`}</span>
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
