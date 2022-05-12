import {
	queryLevels, MakerCentralLevel,
} from '@scripts/browser/BrowserUtil';
import { where } from 'firebase/firestore/lite';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { LevelSort } from './LevelSortPicker';
import LevelPreview from './LevelPreview';

interface LevelCategoryViewProps {
	category: LevelSort;
	batchSize: number;
	collectionPath?: string;
	isLink?: boolean;
}

/**
 * Displays some levels for a specific category.
 * @param props The props:
 * * category: The level category to display levels for.
 * * numEntries: The number of levels to display at once.
 * False by default.
 * * collectionPath: (Optional) The database path to the collection of levels.
 * Default is levels/.
 * * isLink: (Optional) Whether or not the documents contain actual level data or
 * just link to a level in levels/ by sharing the same document ID.
 */
function LevelCategoryView(props: LevelCategoryViewProps) {
	const [levels, setLevels] = useState([] as MakerCentralLevel[]);
	const [scrollEnded, setScrollEnded] = useState(false);
	const [lastLevelId, setLastLevelId] = useState(null as string | null);
	let locked = false;

	useEffect(() => {
		setScrollEnded(false);
		setLevels([]);
		setLastLevelId(null);
	}, [props.category, props.collectionPath]);

	return (
		<InfiniteScroll
			pageStart={0}
			loadMore={fetchLevels}
			hasMore={!scrollEnded}
		>
			<div style={{
				minHeight: '100px',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: '20px',
			}}
			>
				{levels.map((level) => <LevelPreview level={level} key={level.id} />)}
			</div>
		</InfiniteScroll>
	);

	/**
	 * Fetches more levels to display in the scrolling view.
	 */
	function fetchLevels() {
		if (scrollEnded || locked) return;

		// Prevent jittering and duplicate requests while loading more content
		locked = true;
		setScrollEnded(true);

		const epochDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

		const usedQueryFilters = [...props.category.queryConstraints];
		if (props.category.queueType !== 'None') {
			usedQueryFilters.push(
				where(`epochDaysIn${props.category.queueType}Queue`, 'array-contains', epochDay),
			);
		}

		queryLevels(
			usedQueryFilters,
			props.batchSize,
			lastLevelId,
			props.collectionPath!,
			props.isLink!,
		).then((foundLevels) => {
			const newLevels = levels.concat(foundLevels);
			setLevels(newLevels);

			if (newLevels.length > 0) setLastLevelId(newLevels[newLevels.length - 1].id);
			else setLastLevelId(null);

			if (foundLevels.length === props.batchSize!) setScrollEnded(false);
			locked = false;
		});
	}
}

LevelCategoryView.defaultProps = {
	collectionPath: 'levels',
	isLink: false,
};

export default LevelCategoryView;
