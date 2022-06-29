import {
	queryLevels,
} from '@scripts/browser/BrowserUtil';
import React, { useEffect, useState, useRef } from 'react';
import { MCLevelDocData } from '@data/types/MCBrowserTypes';
import { getLevelThumbnailUrl } from '@scripts/site/FirebaseUtil';
import useLevelThumbnails, { LevelThumbnailStates } from '@components/hooks/useLevelThumbnails';
import LevelPreview from './LevelPreview';
import LevelSearchPageControl from '../search/LevelSearchPageControl';
import Spinner from '../controls/Spinner';

export interface LevelCollectionViewProps {
	collectionPath: string;
	isLink?: boolean;
	batchSize?: number;
}

/**
 * Displays levels from a specific collection.
 * @param props The props:
 * * collectionPath: (Optional) The database path to the collection of levels.
 * Default is levels/.
 * * batchSize: The number of levels to display at once. Defaults to 10.
 * * isLink: (Optional) Whether or not the documents contain actual level data or
 * just links to a level in levels/ by sharing the same document ID. Defaults to
 * true.
 */
function LevelCollectionView(props: LevelCollectionViewProps) {
	const [levels, setLevels] = useState([] as MCLevelDocData[]);
	const [thumbnailStates, setThumbnailStates] = useState({} as LevelThumbnailStates);
	const [page, setPage] = useState<number>(0);
	const [loading, setLoading] = useState(true);
	const lastDocIdForPage = useRef<(string | null)[]>([null]);

	useEffect(() => {
		setLevels([]);
		setPage(0);
		lastDocIdForPage.current = [null];
	}, [props.collectionPath]);

	useEffect(() => {
		fetchLevels();
	}, [page]);

	const hasNextPage = levels.length === props.batchSize! + 1;
	const hasPreviousPage = page > 0;

	const thumbnails = useLevelThumbnails(thumbnailStates);

	// FIXME: Load each image upfront when the page loads.

	return (
		<>
			{loading && <Spinner />}
			{!loading && (
				<>
					<div
						className="level-results"
						style={{
							margin: '0 auto',
						}}
					>
						{levels.slice(0, props.batchSize!).map((level) => (
							<LevelPreview
								level={level}
								thumbnailUrl={thumbnails[level.id].url!}
								status={thumbnails[level.id].state}
								key={level.id}
							/>
						))}
						{levels.length === 0 ? (
							<span style={{
								margin: '0 auto',
								fontWeight: 'bold',
							}}
							>No levels here.
							</span>
						) : null}
					</div>
					<div style={{
						width: 'max-content',
						margin: '20px auto',
					}}
					>
						<LevelSearchPageControl
							hasNextPage={hasNextPage}
							hasPreviousPage={hasPreviousPage}
							onPageChange={(delta) => {
								setPage(page + delta);
							}}
						/>
					</div>
				</>
			)}
		</>
	);

	/**
	 * Fetches levels for the current page.
	 */
	async function fetchLevels() {
		setLoading(true);

		const foundLevels = await queryLevels(
			[],
			props.batchSize! + 1,
			lastDocIdForPage.current[page],
			props.collectionPath!,
			props.isLink!,
		);

		lastDocIdForPage.current[page + 1] = foundLevels.length > 1
			? foundLevels[foundLevels.length - 2].id : null;

		const levelIds = foundLevels.slice(0, props.batchSize!).map((level) => level.id);
		const initThumbnailStates = await loadThumbnails(levelIds);

		setThumbnailStates(initThumbnailStates);
		setLevels(foundLevels);
		setLoading(false);
	}
}

/**
 * Loads the thumbnails for a set of levels.
 * @param levelIds An array of level IDs to load thumbnails for.
 * @returns A Promise that resolves when all thumbnails have loaded.
 * The resulting object is a mapping of level IDs to thumbnail states.
 */
async function loadThumbnails(levelIds: string[]): Promise<LevelThumbnailStates> {
	const thumbnailStates: LevelThumbnailStates = {};

	const promises = [];
	for (const levelId of levelIds) {
		promises.push(getLevelThumbnailUrl(levelId));
	}

	const thumbnails = await Promise.all(promises);
	for (let i = 0; i < levelIds.length; i++) {
		const url = thumbnails[i];
		thumbnailStates[levelIds[i]] = {
			url,
			state: url !== '' ? 'Loaded' : 'Not Uploaded',
		};
	}
	return thumbnailStates;
}

LevelCollectionView.defaultProps = {
	batchSize: 10,
	isLink: true,
};

export default LevelCollectionView;
