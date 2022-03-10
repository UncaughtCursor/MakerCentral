import {
	queryLevels, UserLevel,
} from '@scripts/browser/BrowserUtil';
import { serverTimestamp, Timestamp, where } from 'firebase/firestore/lite';
import React, { useEffect, useState } from 'react';
import Spinner from '../controls/Spinner';
import { LevelCategory } from './LevelCategoryPicker';
import LevelPreview from './LevelPreview';

interface LevelCategoryViewProps {
	category: LevelCategory;
	numEntries: number;
	doPaginate?: boolean;
}

/**
 * Displays some levels for a specific category.
 * @param props The props:
 * * category: The level category to display levels for.
 * * numEntries: The number of levels to display at once.
 * * doPaginate: (Optional) Whether or not to allow the user to view different pages.
 * False by default.
 */
function LevelCategoryView(props: LevelCategoryViewProps) {
	const [loaded, setLoaded] = useState(false);
	const [levels, setLevels] = useState([] as UserLevel[]);

	useEffect(() => {
		setLoaded(false);

		const epochDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

		const usedQueryFilters = [...props.category.queryConstraints];
		if (props.category.queueType !== 'None') {
			usedQueryFilters.push(
				where(`epochDaysIn${props.category.queueType}Queue`, 'array-contains', epochDay),
			);
		}

		queryLevels(usedQueryFilters, props.numEntries).then((foundLevels) => {
			setLevels(foundLevels);
			setLoaded(true);
		});
	}, [props.category]);

	const levelPreviews = levels.map((level) => <LevelPreview level={level} />);

	return (
		<>
			<Spinner isActive={!loaded} yOfsPx={0} />
			<div style={{
				visibility: loaded ? 'visible' : 'hidden',
				minHeight: '100px',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: '20px',
			}}
			>
				{levelPreviews}
			</div>
		</>
	);
}

LevelCategoryView.defaultProps = {
	doPaginate: false,
};

export default LevelCategoryView;
