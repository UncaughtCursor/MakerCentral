import { MCLevelDocData } from '@data/types/MCBrowserTypes';
import { MeiliSearchResults } from '@scripts/browser/MeilisearchUtil';
import {
	AnySearchResults, FullSearchParams, getLevelResultData, getPromoLevelResultData, SearchResults,
} from '@scripts/browser/SearchUtil';
import { SearchParams } from 'pages/levels/search/[q]';
import React, { useEffect, useState } from 'react';
import { PromoSearchParams } from 'pages/promotion/search/[q]';
import Spinner from '../controls/Spinner';
import LevelSearchResultView from './LevelSearchResultView';

/**
 * A widget that displays search results and can be changed in real time.
 * @param props The props:
 * - searchParams: The search parameters to search with.
 * - isPromoSearch: (Optional) Whether or not the search is for promoted levels.
 * - onResultsChange: (Optional) A callback that is called when the results change.
 */
function LevelSearchResultWidget(props: {
	searchParams: SearchParams | FullSearchParams | PromoSearchParams,
	isPromoSearch?: boolean,
	onResultsChange?: (results: AnySearchResults) => void,
}) {
	const [searchResults, setSearchResults] = useState<{
		results: AnySearchResults,
		levelThumbnailUrlObj?: {[key: string]: string},
		worldThumbnailUrlObjs?: {[key: string]: string}[],
	} | null>(null);

	const [curSearchParams, setCurSearchParams]	= useState<SearchParams | FullSearchParams | PromoSearchParams>(
		props.searchParams,
	);

	useEffect(() => {
		setSearchResults(null);
		if (!props.isPromoSearch) {
			getLevelResultData(curSearchParams as SearchParams | FullSearchParams).then((res) => {
				setSearchResults(res);
				props.onResultsChange?.(res.results);
			});
		} else {
			getPromoLevelResultData(curSearchParams as PromoSearchParams).then((res) => {
				setSearchResults(res);
				props.onResultsChange?.(res.results);
			});
		}
	}, [curSearchParams]);

	useEffect(() => {
		setCurSearchParams(props.searchParams);
	}, [props.searchParams]);

	if (searchResults !== null) {
		return (
			<LevelSearchResultView
				results={searchResults.results}
				levelThumbnailUrls={searchResults.levelThumbnailUrlObj}
				worldThumbnailUrls={searchResults.worldThumbnailUrlObjs}
				isWidget
				showPageControls={!props.isPromoSearch}
				onPageChange={(delta) => {
					setCurSearchParams({
						...curSearchParams,
						page: curSearchParams.page + delta,
					});
				}}
			/>
		);
	}

	return (
		<div>
			<Spinner isActive />
		</div>
	);
}

LevelSearchResultWidget.defaultProps = {
	isPromoSearch: false,
	onResultsChange: null,
};

export default LevelSearchResultWidget;
