import AppFrame from '@components/AppFrame';
import LevelPreview from '@components/pages/browser/LevelPreview';
import LevelSearchBar, { defaultFilterSettings, getSearchUrl, SearchFilterSettings } from '@components/pages/search/LevelSearchBar';
import { LevelSearchResults, searchLevels } from '@scripts/browser/MeilisearchUtil';
import { useRouter } from 'next/router';
import React from 'react';

export interface LevelSearchParams extends SearchFilterSettings {
	q: string;
}

/**
 * The search page.
 * @param props The server-side props.
 * * results: The search results.
 */
function SearchResultsPage(props: {
	results: LevelSearchResults
}) {
	const history = useRouter();
	const initSettings = (() => {
		const validKeys = Object.keys(props.results.searchParams).filter((key) => key !== 'q');
		return validKeys.reduce((obj, key) => {
			// eslint-disable-next-line no-param-reassign
			obj[key] = props
				.results.searchParams[key as keyof typeof props.results.searchParams];
			return obj;
		}, {} as {[key: string]: any});
	})() as SearchFilterSettings;

	return (
		<AppFrame title={`'${props.results.searchParams.q}' - MakerCentral Levels`}>
			<div style={{
				margin: '24px auto',
				width: 'max-content',
				marginTop: '36px',
			}}
			>
				<LevelSearchBar
					initialVal={props.results.searchParams.q}
					initialSettings={initSettings}
					onSubmit={(query, filterSettings) => {
						history.push(getSearchUrl(query, filterSettings));
					}}
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
export async function getServerSideProps(context: { query: any }) {
	const queryData = { ...defaultFilterSettings, ...context.query } as LevelSearchParams;
	return {
		props: {
			results: await searchLevels(queryData),
		},
	};
}
