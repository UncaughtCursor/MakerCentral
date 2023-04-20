import AppFrame from '@components/AppFrame';
import LevelSearchResultView from '@components/pages/search/LevelSearchResultView';
import { useRouter } from 'next/router';
import React from 'react';
import { PromoSearchResults, defaultFilterSettings, getPromoLevelResultData } from '@scripts/browser/SearchUtil';
import { SearchParams, SearchParamsRaw } from 'pages/levels/search/[q]';
import PromoSearchBar, { getPromoSearchUrl } from '@components/pages/promotion/PromoSearchBar';

interface PromoSearchResultsPageProps {
	results: PromoSearchResults;
	thumbnailUrls: {[key: string]: string};
}

export type PromoSearchParams = Omit<SearchParams, 'searchMode'>;

// TODO: Add promo-specific information to the results, like the expiration date.

/**
 * The search results page for promoted levels.
 * @param props The server-side props.
 * * results: The search results.
 * * thumbnailUrls: An object matching level IDs with thumbnail URLs.
 */
function PromoSearchResultsPage(props: PromoSearchResultsPageProps) {
	const history = useRouter();

	return (
		<AppFrame title={`'${props.results.searchParams.q}' - MakerCentral Promoted Levels`}>
			<div style={{
				margin: '24px auto',
				width: 'max-content',
				marginTop: '36px',
			}}
			>
				<PromoSearchBar
					initialVal={props.results.searchParams.q}
					onSubmit={(query) => {
						history.push(getPromoSearchUrl(query));
					}}
				/>
			</div>
			<LevelSearchResultView
				results={props.results}
				levelThumbnailUrls={props.thumbnailUrls}
				isWidget={false}
				showPromotionInfo
			/>
		</AppFrame>
	);
}

export default PromoSearchResultsPage;

/**
 * Fetches level data at request time.
 * @param context The context of the request. Includes the URL parameters.
 * @returns The props to render at request time.
 */
export async function getServerSideProps(context: { query: SearchParamsRaw }) {
	const queryData = { ...defaultFilterSettings.Levels, ...context.query };
	if (queryData.q === '_') queryData.q = '';

	const displayRes = await getPromoLevelResultData(queryData, true);

	return {
		props: {
			results: displayRes.results,
			thumbnailUrls: displayRes.levelThumbnailUrlObj ? displayRes.levelThumbnailUrlObj : {},
		},
	};
}
