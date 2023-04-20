import { SearchParams } from 'pages/levels/search/[q]';
import React, { useEffect, useState } from 'react';
import { PromoSearchParams } from 'pages/promotion/search/[q]';
import LevelSearchResultWidget from './LevelSearchResultWidget';

interface PromotedLevelViewProps {
	searchParams: SearchParams | PromoSearchParams;
}

/**
 * Displays promoted levels. This component is meant to be displayed below the main search results.
 * @param props The props:
 * - searchParams: The search parameters to search with.
 * @returns The component.
 */
function PromotedLevelView(props: PromotedLevelViewProps) {
	const [visible, setVisible] = useState(true);

	useEffect(() => {
		// Set the visibility to true when the search parameters change.
		setVisible(true);
	}, [props.searchParams]);

	return (
		// eslint-disable-next-line react/jsx-no-useless-fragment
		<>
			{visible && (
				<div className="promoted-level-view">
					<div className="promoted-level-divider">
						<hr />
						<div>
							<span>From Supporters</span>
						</div>
					</div>
					<LevelSearchResultWidget
						searchParams={props.searchParams}
						isPromoSearch
						onResultsChange={(results) => {
							setVisible(results.results.length > 0);
						}}
					/>
					<div className="promoted-level-divider promoted-level-divider-end">
						<hr />
						<div>
							<span><a href="/promotion" target="_blank" rel="noopener noreferrer">How to Promote Your Own Levels</a></span>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default PromotedLevelView;
