import AppFrame from '@components/AppFrame';
import LevelSearchResultView from '@components/pages/search/LevelSearchResultView';
import LevelSearchBar, { getSearchUrl } from '@components/pages/search/LevelSearchBar';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import {
	defaultFilterSettings, getLevelResultData, SearchFilterSettings, SearchMode, SearchResults,
} from '@scripts/browser/SearchUtil';
import { discordLink } from '@scripts/site/FirebaseUtil';
import Spinner from '@components/pages/controls/Spinner';

export interface SearchParams extends SearchFilterSettings {
	q: string;
}

interface SearchResultsPageProps {
	queryData: {[key: string]: string};
}

interface SearchResultsState {
	results: SearchResults;
	thumbnailUrls: {[key: string]: string};
	worldThumbnailUrls: {[key: string]: string}[];
}

/**
 * The search page.
 * @param props The server-side props.
 * * results: The search results.
 * * thumbnailUrls: An object matching level IDs with thumbnail URLs.
 */
function SearchResultsPage(props: SearchResultsPageProps) {
	const history = useRouter();
	const [res, setRes] = useState<SearchResultsState | null>(null);

	useEffect(() => {
		setRes(null);
		getLevelResultData(props.queryData as any).then((r) => {
			setRes({
				results: r.results,
				thumbnailUrls: r.levelThumbnailUrlObj ? r.levelThumbnailUrlObj : {},
				worldThumbnailUrls: r.worldThumbnailUrlObjs ? r.worldThumbnailUrlObjs : [],
			});
		});
	}, [props.queryData]);

	const initSettings = (() => {
		const validKeys = Object.keys(props.queryData).filter((key) => key !== 'q');
		return validKeys.reduce((obj, key) => {
			// eslint-disable-next-line no-param-reassign
			obj[key] = props
				.queryData[key as keyof typeof props.queryData];
			return obj;
		}, {} as {[key: string]: any});
	})() as SearchFilterSettings;

	const discordLinkElement = (
		<a
			href={discordLink}
			target="_blank"
			rel="noopener noreferrer"
		>Discord server
		</a>
	);

	return (
		<AppFrame title={`'${props.queryData.q}' - MakerCentral Levels`}>
			{/* <WarningBanner
				message={(
					<div>
						MakerCentral's database is currently having issues. Work is being done to restore all of the levels. We should be back in a few hours. For more info and updates, check the {discordLinkElement}.
					</div>
				)}
				style={{
					marginBottom: '-12px',
				}}
			/> */}
			<div style={{
				margin: '24px auto',
				width: 'max-content',
				marginTop: '36px',
			}}
			>
				<LevelSearchBar
					initialVal={props.queryData.q}
					initialSettings={initSettings}
					onSubmit={(query, filterSettings) => {
						history.push(getSearchUrl(query, filterSettings));
					}}
				/>
			</div>
			{ res ? (
				<LevelSearchResultView
					results={res.results}
					levelThumbnailUrls={res.thumbnailUrls}
					worldThumbnailUrls={res.worldThumbnailUrls}
					isWidget={false}
					showPromotedLevels
				/>
			) : (
				<div style={{
					marginTop: '24px',
					textAlign: 'center',
				}}
				>
					<Spinner />
				</div>
			)}
		</AppFrame>
	);
}

export default SearchResultsPage;

export interface SearchParamsRaw extends Partial<SearchParams> {
	q: string;
}

/**
 * Fetches level data at request time.
 * @param context The context of the request. Includes the URL parameters.
 * @returns The props to render at request time.
 */
export async function getServerSideProps(context: { query: SearchParamsRaw }) {
	const searchMode: SearchMode = context.query.searchMode ? context.query.searchMode : 'Levels';
	const queryData = { ...defaultFilterSettings[searchMode], ...context.query };
	if (queryData.q === '_') queryData.q = '';

	return {
		props: {
			queryData,
		},
	};
}
