import { MCLevelDocData } from '@data/types/MCBrowserTypes';
import { MeiliSearchResults, numResultsPerPage } from '@scripts/browser/MeilisearchUtil';
import { AnySearchResults, SearchFilterSettings, SearchResults } from '@scripts/browser/SearchUtil';
import { useRouter } from 'next/router';
import React from 'react';
import { PromoSearchParams } from 'pages/promotion/search/[q]';
import TriggerButton from '../controls/TriggerButton';
import { getSearchUrl } from './LevelSearchBar';
import { getPromoSearchUrl } from '../promotion/PromoSearchBar';

/**
 * Displays pagination controls for a search result page.
 * @param props The props:
 * - curSearchResults (Optional): The current search results being displayed.
 * If omitted, the hasNextPage and hasPreviousPage props must be provided.
 * - toToPage: (Optional) Whether or not to navigate to the next page
 * automatically. Defaults to true.
 * - onPageChange: (Optional) The function to be called when the page has changed.
 * The parameter the change in the page index.
 * - hasNextPage: (Optional) Whether or not there is a next page. Must be provided
 * if curSearchResults is not provided.
 * - hasPreviousPage: (Optional) Whether or not there is a previous page. Must be
 * provided if curSearchResults is not provided.
 * - isPromo: (Optional) Whether or not the search is for a promotion. Defaults to
 * false.
 */
function LevelSearchPageControl(props: {
	curSearchResults?: AnySearchResults,
	hasNextPage?: boolean,
	hasPreviousPage?: boolean,
	goToPage?: boolean,
	onPageChange?: (delta: number) => void,
	isPromo?: boolean,
}) {
	const history = useRouter();

	const showBackBtn = props.curSearchResults
		? props.curSearchResults.searchParams.page > 0
		: props.hasPreviousPage!;
	const showNextBtn = props.curSearchResults
		? props.curSearchResults.results.length === numResultsPerPage + 1
		: props.hasNextPage!;

	const curPage = props.curSearchResults
		? parseInt(props.curSearchResults.searchParams.page as unknown as string, 10)
		: undefined;

	return (
		<div style={{
			display: 'flex',
			flexDirection: 'row',
			gap: '5px',
		}}
		>
			<div style={{ display: showBackBtn ? '' : 'none' }}>
				<TriggerButton
					text="Back"
					type="normal"
					onClick={() => { changePage(-1); }}
				/>
			</div>
			<div style={{ display: showNextBtn ? '' : 'none' }}>
				<TriggerButton
					text="Next"
					type="normal"
					onClick={() => { changePage(1); }}
				/>
			</div>
		</div>
	);

	/**
	 * Changes the page by the given amount.
	 * @param delta The amount to change the page by. Must be -1 or 1.
	 */
	function changePage(delta: -1 | 1) {
		if (props.curSearchResults) {
			const query = props.curSearchResults.searchParams.q;
			const searchParams = props.curSearchResults.searchParams;
			const { q, ...persistedParams } = searchParams;

			const newSearchSettings: SearchFilterSettings | Omit<PromoSearchParams, 'q'> = {
				...persistedParams,
				page: curPage! + delta,
			};
			if (props.goToPage!) {
				const url = props.isPromo
					? getPromoSearchUrl(query)
					: getSearchUrl(query, newSearchSettings as SearchFilterSettings);
				history.push(url);
			}
		}
		props.onPageChange!(delta);
	}
}

LevelSearchPageControl.defaultProps = {
	curSearchResults: undefined,
	goToPage: true,
	onPageChange: () => {},
	hasNextPage: undefined,
	hasPreviousPage: undefined,
	isPromo: false,
};

export default LevelSearchPageControl;
