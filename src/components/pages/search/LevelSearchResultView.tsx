import useLevelThumbnailStates, { LevelThumbnailStates } from '@components/hooks/useLevelThumbnailStates';
import {
	MCLevelDocData, MCPromoLevelDocData, MCUserDocData, MCWorldDocData,
} from '@data/types/MCBrowserTypes';
import { numResultsPerPage } from '@scripts/browser/MeilisearchUtil';
import { AnySearchResults, SearchMode } from '@scripts/browser/SearchUtil';
import React from 'react';
import LevelPreview, { convertPromoLevelToLevel, isPromoLevel } from '../browser/LevelPreview';
import SuperWorldPreview from '../browser/SuperWorldPreview';
import UserPreview from '../browser/UserPreview';
import LevelSearchPageControl from './LevelSearchPageControl';
import PromotedLevelView from './PromotedLevelView';

// A property for each search result data type to be used to identify the type of result.
const uniqueProperty: {[key in SearchMode]: string} & { Promo: string } = {
	Levels: 'theme',
	Users: 'makerPoints',
	Worlds: 'levelText',
	Promo: 'promoter',
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
	results: AnySearchResults,
	levelThumbnailUrls?: {[key: string]: string},
	worldThumbnailUrls?: {[key: string]: string}[],
	isWidget?: boolean,
	showPromotedLevels?: boolean,
	onPageChange?: (delta: number) => void,
	showPageControls?: boolean,
	showPromotionInfo?: boolean,
}) {
	const initThumbnailStates: LevelThumbnailStates = {};
	for (const levelId of Object.keys(props.levelThumbnailUrls!)) {
		const thumbnailUrl = props.levelThumbnailUrls![levelId];
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

	const mergedWorldThumbnailUrls: {[key: string]: string} = {};
	for (const levelIds of props.worldThumbnailUrls!) {
		for (const levelId of Object.keys(levelIds)) {
			const thumbnailUrl = levelIds[levelId];
			mergedWorldThumbnailUrls[levelId] = thumbnailUrl;
		}
	}

	const levelThumbnails = useLevelThumbnailStates(initThumbnailStates);

	const isPromo = (() => {
		if (props.results.results.length === 0) return false;
		const firstResult = props.results.results[0];
		return (firstResult as MCPromoLevelDocData)[
			uniqueProperty.Promo as keyof MCPromoLevelDocData
		] !== undefined;
	})();

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
							// Note: This can still be a promoted level.
							const level = result as MCLevelDocData | MCPromoLevelDocData;
							const shownLevel = props.showPromotionInfo
								? level
								: (() => {
									if (isPromoLevel(level)) {
										return convertPromoLevelToLevel(level);
									}
									return level;
								})();
							return (
								<LevelPreview
									level={shownLevel}
									thumbnailUrl={levelThumbnails[level.id].url !== null ? levelThumbnails[level.id].url! : ''}
									status={levelThumbnails[level.id].state}
									key={level.id}
								/>
							);
						}

						// If the result is a user...
						if ((result as MCUserDocData)[uniqueProperty.Users as keyof MCUserDocData]) {
							const user = result as MCUserDocData;
							return (
								<UserPreview
									userData={user}
									key={user.id}
								/>
							);
						}

						// If the result is a world...
						if ((result as MCWorldDocData)[uniqueProperty.Worlds as keyof MCWorldDocData]) {
							const world = result as MCWorldDocData;
							const showcasedLevelIds = world.levels
								.sort((a, b) => b.numLikes - a.numLikes).slice(0, 4).map((level) => level.id);
							const thumbnailUrlObj: {[key: string]: string} = {};
							for (const levelId of showcasedLevelIds) {
								thumbnailUrlObj[levelId] = mergedWorldThumbnailUrls[levelId] !== undefined
									? mergedWorldThumbnailUrls[levelId]! : '';
							}
							return (
								<SuperWorldPreview
									world={world}
									makerName={world.makerName}
									makerId={world.makerId}
									thumbnailUrls={thumbnailUrlObj}
									key={world.makerId}
								/>
							);
						}

						return null;
					})}
			</div>
			{props.showPromotedLevels && (
				<PromotedLevelView
					searchParams={props.results.searchParams}
				/>
			)}
			{props.showPageControls && (
				<LevelSearchPageControl
					goToPage={!props.isWidget!}
					curSearchResults={props.results}
					onPageChange={props.onPageChange!}
					isPromo={isPromo}
				/>
			)}
		</div>
	);
}

LevelSearchResultView.defaultProps = {
	isWidget: true,
	onPageChange: () => {},
	levelThumbnailUrls: {},
	worldThumbnailUrls: [],
	showPromotedLevels: false,
	showPageControls: true,
	showPromotionInfo: false,
};

export default LevelSearchResultView;
