import AppFrame from '@components/AppFrame';
import LevelSearchResultView from '@components/pages/search/LevelSearchResultView';
import LevelSearchBar, { defaultFilterSettings, getSearchUrl, SearchFilterSettings } from '@components/pages/search/LevelSearchBar';
import { LevelSearchResults, searchLevels } from '@scripts/browser/MeilisearchUtil';
import { useRouter } from 'next/router';
import React from 'react';
import { getLevelThumbnailUrl } from '@scripts/site/FirebaseUtil';

export interface LevelSearchParams extends SearchFilterSettings {
	q: string;
}

/**
 * The search page.
 * @param props The server-side props.
 * * results: The search results.
 * * thumbnailUrls: An object matching level IDs with thumbnail URLs.
 */
function SearchResultsPage(props: {
	results: LevelSearchResults,
	thumbnailUrls: {[key: string]: string},
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
			<LevelSearchResultView
				results={props.results}
				thumbnailUrls={props.thumbnailUrls}
			/>
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
	const results = await searchLevels(queryData);

	const thumbnailUrls = await Promise.all(results.results.map(
		async (level) => ({
			id: level.id, url: await getLevelThumbnailUrl(level.id),
		}),
	));
	const thumbnailUrlObj: {[key: string]: string} = {};
	thumbnailUrls.forEach((urlEntry) => {
		thumbnailUrlObj[urlEntry.id] = urlEntry.url;
	});

	return {
		props: {
			results,
			thumbnailUrls: thumbnailUrlObj,
		},
	};
}
