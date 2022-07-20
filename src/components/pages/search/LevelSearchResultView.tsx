import useLevelThumbnailStates, { LevelThumbnailStates } from '@components/hooks/useLevelThumbnailStates';
import { MCLevelDocData, MCUserDocData, MCWorldDocData } from '@data/types/MCBrowserTypes';
import { numResultsPerPage } from '@scripts/browser/MeilisearchUtil';
import { SearchMode, SearchResults } from '@scripts/browser/SearchUtil';
import React from 'react';
import LevelPreview from '../browser/LevelPreview';
import SuperWorldPreview from '../browser/SuperWorldPreview';
import LevelSearchPageControl from './LevelSearchPageControl';

// A property for each search result data type to be used to identify the type of result.
const uniqueProperty: {[key in SearchMode]: string} = {
	Levels: 'theme',
	Users: 'world',
	Worlds: 'levelText',
};

/**
 * Displays level search results.
 * @param props The props:
 * - results: The results of the search.
 * - thumbnailUrls: An object matching level IDs with thumbnail URLs if applicable.
 * - isWidget: (Optional) Whether or not the component should be able to dynamically
 * update and trigger callbacks for user events. Defaults to true.
 * - onPageChange (Optional) Function to be called when the page has changed.
 * The parameter is the change in the page index.
 */
function LevelSearchResultView(props: {
	results: SearchResults,
	thumbnailUrls?: {[key: string]: string},
	isWidget?: boolean,
	onPageChange?: (delta: number) => void,
}) {
	const initThumbnailStates: LevelThumbnailStates = {};
	for (const levelId of Object.keys(props.thumbnailUrls!)) {
		const thumbnailUrl = props.thumbnailUrls![levelId];
		if (thumbnailUrl === '') {
			initThumbnailStates[levelId] = {
				state: 'Not Uploaded',
				url: null,
			};
		} else {
			initThumbnailStates[levelId] = {
				state: 'Loaded',
				url: thumbnailUrl,
			};
		}
	}
	const thumbnails = useLevelThumbnailStates(initThumbnailStates);

	return (
		<div style={{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			gap: '20px',
		}}
		>
			{!props.isWidget! ? (
				<span>{`Found about ${props.results.numResults.toLocaleString()} results in ${props.results.computeTimeMs / 1000} seconds`}</span>
			) : null}
			{props.results.results.length === 0 ? (
				<span style={{
					margin: '0 auto',
					fontWeight: 'bold',
				}}
				>No levels here.
				</span>
			) : null}
			<div className="level-results">
				{props.results.results.slice(0, numResultsPerPage)
					.map((result) => {
						// If the result is a level...
						if ((result as MCLevelDocData)[uniqueProperty.Levels as keyof MCLevelDocData]) {
							const level = result as MCLevelDocData;
							return (
								<LevelPreview
									level={level}
									thumbnailUrl={thumbnails[level.id].url !== null ? thumbnails[level.id].url! : ''}
									status={thumbnails[level.id].state}
									key={level.id}
								/>
							);
						}

						// If the result is a user...
						if ((result as MCUserDocData)[uniqueProperty.Users as keyof MCUserDocData]) {
							const user = result as MCUserDocData;
							return null; // TODO: Implement user search results.
						}

						// If the result is a world...
						if ((result as MCWorldDocData)[uniqueProperty.Worlds as keyof MCWorldDocData]) {
							const world = result as MCWorldDocData;
							return (
								<SuperWorldPreview
									world={world}
									makerName={world.makerName}
									makerId={world.makerId}
									thumbnailUrls={{}} // TODO: Implement world thumbnail URLs.
									key={world.makerId}
								/>
							);
						}

						return null;
					})}
			</div>
			<LevelSearchPageControl
				goToPage={!props.isWidget!}
				curSearchResults={props.results}
				onPageChange={props.onPageChange!}
			/>
		</div>
	);
}

LevelSearchResultView.defaultProps = {
	isWidget: true,
	onPageChange: () => {},
	thumbnailUrls: {},
};

export default LevelSearchResultView;
