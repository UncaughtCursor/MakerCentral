import {
	queryLevels, UserLevel,
} from '@scripts/browser/BrowserUtil';
import { serverTimestamp, Timestamp, where } from 'firebase/firestore/lite';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Spinner from '../controls/Spinner';
import { LevelCategory } from './LevelCategoryPicker';
import LevelPreview from './LevelPreview';

interface LevelCategoryViewProps {
	category: LevelCategory;
	batchSize: number;
}

/**
 * Displays some levels for a specific category.
 * @param props The props:
 * * category: The level category to display levels for.
 * * numEntries: The number of levels to display at once.
 * False by default.
 */
function LevelCategoryView(props: LevelCategoryViewProps) {
	const [levels, setLevels] = useState([] as UserLevel[]);
	const [scrollEnded, setScrollEnded] = useState(false);
	const [lastLevelId, setLastLevelId] = useState(null as string | null);

	useEffect(() => {
		setScrollEnded(false);
		setLevels([]);
		setLastLevelId(null);
	}, [props.category]);

	return (
		<InfiniteScroll
			pageStart={0}
			loadMore={fetchLevels}
			hasMore={!scrollEnded}
			loader={<Spinner isActive />}
		>
			<div style={{
				minHeight: '100px',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: '20px',
			}}
			>
				{levels.map((level) => <LevelPreview level={level} />)}
			</div>
		</InfiniteScroll>
	);

	/**
	 * Fetches more levels to display in the scrolling view.
	 */
	function fetchLevels() {
		console.log('next');
		const epochDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

		const usedQueryFilters = [...props.category.queryConstraints];
		if (props.category.queueType !== 'None') {
			usedQueryFilters.push(
				where(`epochDaysIn${props.category.queueType}Queue`, 'array-contains', epochDay),
			);
		}

		queryLevels(usedQueryFilters, props.batchSize, lastLevelId).then((foundLevels) => {
			const newLevels = levels.concat(foundLevels);
			setLevels(newLevels);
			if (newLevels.length > 0) setLastLevelId(newLevels[newLevels.length - 1].id);
			else setLastLevelId(null);
			if (foundLevels.length === 0) setScrollEnded(true);
		});
	}
}

export default LevelCategoryView;
