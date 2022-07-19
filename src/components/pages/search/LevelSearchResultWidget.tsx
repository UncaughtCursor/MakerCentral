import { MCLevelDocData } from '@data/types/MCBrowserTypes';
import { MeiliSearchResults } from '@scripts/browser/MeilisearchUtil';
import { FullSearchParams, getLevelResultData, SearchResults } from '@scripts/browser/SearchUtil';
import { SearchParams } from 'pages/levels/search/[q]';
import React, { useEffect, useState } from 'react';
import Spinner from '../controls/Spinner';
import LevelSearchResultView from './LevelSearchResultView';

/**
 * A widget that displays search results and can be changed in real time.
 * @param props The props:
 * - searchParams: The search parameters to search with.
 */
function LevelSearchResultWidget(props: {
	searchParams: SearchParams | FullSearchParams,
}) {
	const [searchResults, setSearchResults] = useState<{
		results: SearchResults,
		thumbnailUrlObj?: {[key: string]: string},
	} | null>(null);

	const [curSearchParams, setCurSearchParams]	= useState<SearchParams | FullSearchParams>(
		props.searchParams,
	);

	useEffect(() => {
		setSearchResults(null);
		getLevelResultData(curSearchParams).then((res) => {
			setSearchResults(res);
		});
	}, [curSearchParams]);

	if (searchResults !== null) {
		return (
			<LevelSearchResultView
				results={searchResults.results}
				thumbnailUrls={searchResults.thumbnailUrlObj}
				isWidget
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

export default LevelSearchResultWidget;
