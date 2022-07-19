import AppFrame from '@components/AppFrame';
import LevelSearchResultView from '@components/pages/search/LevelSearchResultView';
import LevelSearchBar, { getSearchUrl } from '@components/pages/search/LevelSearchBar';
import { useRouter } from 'next/router';
import React from 'react';
import {
	defaultFilterSettings, getLevelResultData, SearchFilterSettings, SearchResults,
} from '@scripts/browser/SearchUtil';

export interface SearchParams extends SearchFilterSettings {
	q: string;
}

interface SearchResultsPageProps {
	results: SearchResults;
	thumbnailUrls?: {[key: string]: string};
}

/**
 * The search page.
 * @param props The server-side props.
 * * results: The search results.
 * * thumbnailUrls: An object matching level IDs with thumbnail URLs.
 */
function SearchResultsPage(props: SearchResultsPageProps) {
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
			<LevelSearchResultView
				results={props.results}
				thumbnailUrls={props.thumbnailUrls}
				isWidget={false}
			/>
		</AppFrame>
	);
}

SearchResultsPage.defaultProps = {
	thumbnailUrls: {},
};

export default SearchResultsPage;

/**
 * Fetches level data at request time.
 * @param context The context of the request. Includes the URL parameters.
 * @returns The props to render at request time.
 */
export async function getServerSideProps(context: { query: any }) {
	const queryData = { ...defaultFilterSettings, ...context.query } as SearchParams;
	if (queryData.q === '_') queryData.q = '';

	const displayRes = await getLevelResultData(queryData);

	return {
		props: {
			results: displayRes.results,
			thumbnailUrls: displayRes.thumbnailUrlObj,
		},
	};
}
