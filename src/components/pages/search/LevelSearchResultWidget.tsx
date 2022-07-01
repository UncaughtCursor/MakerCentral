import { LevelSearchResults } from '@scripts/browser/MeilisearchUtil';
import { FullLevelSearchParams, getLevelResultDisplayData } from '@scripts/browser/SearchUtil';
import { LevelSearchParams } from 'pages/levels/search/[q]';
import React, { useEffect, useState } from 'react';
import Spinner from '../controls/Spinner';
import LevelSearchResultView from './LevelSearchResultView';

/**
 * A widget that displays search results and can be changed in real time.
 * @param props The props:
 * - searchParams: The search parameters to search with.
 */
function LevelSearchResultWidget(props: {
	searchParams: LevelSearchParams | FullLevelSearchParams,
}) {
	const [searchResults, setSearchResults] = useState<{
		results: LevelSearchResults,
		thumbnailUrlObj: {[key: string]: string},
	} | null>(null);

	const [curSearchParams, setCurSearchParams]	= useState<LevelSearchParams | FullLevelSearchParams>(
		props.searchParams,
	);

	useEffect(() => {
		setSearchResults(null);
		getLevelResultDisplayData(curSearchParams).then((res) => {
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
