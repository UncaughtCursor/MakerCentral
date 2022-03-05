import {
	queryLevels, UserLevel,
} from '@scripts/browser/BrowserUtil';
import { QueryConstraint } from 'firebase/firestore/lite';
import React, { useEffect, useState } from 'react';
import Spinner from '../controls/Spinner';
import LevelPreview from './LevelPreview';

interface LevelCategoryViewProps {
	title: string;
	queryConstraints: QueryConstraint[];
	numEntries: number;
	doPaginate?: boolean;
}

/**
 * Displays some levels for a specific category.
 * @param props The props:
 * * title: The title of the category.
 * * queryOrders: Array of what level field names to sort by and how.
 * * numEntries: The number of levels to display at once.
 * * queryFilter: (Optional) The filter criteria for the category. None by default.
 * * doPaginate: (Optional) Whether or not to allow the user to view different pages.
 * False by default.
 */
function LevelCategoryView(props: LevelCategoryViewProps) {
	const [loaded, setLoaded] = useState(false);
	const [levels, setLevels] = useState([] as UserLevel[]);
	useEffect(() => {
		setLoaded(false);
		queryLevels(props.queryConstraints, props.numEntries).then((foundLevels) => {
			setLevels(foundLevels);
			setLoaded(true);
		});
	}, [props.queryConstraints]);

	const levelPreviews = levels.map((level) => <LevelPreview level={level} />);

	return (
		<>
			<h2>{props.title}</h2>
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
