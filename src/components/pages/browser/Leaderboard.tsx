import { MakerCentralTag } from '@scripts/browser/BrowserUtil';
import { db } from '@scripts/site/FirebaseUtil';
import {
	collectionGroup, getDoc, getDocs, limit, orderBy, query, QueryConstraint, where,
} from 'firebase/firestore/lite';
import Link from 'next/link';
import React, { ReactNode, useEffect, useState } from 'react';

interface LeaderboardEntry {
	rank: number,
	name: string,
	uid: string,
	rep: number,
}

// TODO: Support tag leaderboards
export type LeaderboardScoreFieldName = /* UserLevelTag | */ 'All';

const numEntries = 10;

/**
 * Displays a leaderboard for a specific
 * @param props The props:
 * * title The title to display to the user.
 * * repFieldName: The rep field name to query scores for.
 * * isWidget: (Optional) Whether or not to display a small preview of the leaderboard.
 */
function Leaderboard(props: {
	title: string,
	repFieldName: LeaderboardScoreFieldName,
	isWidget?: boolean,
}) {
	const [entries, setEntries] = useState([] as LeaderboardEntry[]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		(async () => {
			const pointsFieldName = props.repFieldName === 'All' ? 'points' : `${props.repFieldName}Rep`;
			const queryConstraints: QueryConstraint[] = [
				limit(numEntries),
				orderBy(pointsFieldName, 'desc'),
				where(pointsFieldName, '>', 0),
			];

			const docs = await getDocs(query(collectionGroup(db, 'priv'), ...queryConstraints));

			const dataEntries: LeaderboardEntry[] = await Promise.all(
				docs.docs.map(async (scoreDoc, i) => {
					const data = scoreDoc.data();

					const userDoc = await getDoc(scoreDoc.ref.parent.parent!);
					const userData = userDoc.data()!;

					return {
						rank: i + 1,
						name: userData.name,
						rep: data.points,
						uid: userDoc.id,
					};
				}),
			);
			setEntries(dataEntries);
			setIsLoading(false);
		})();
	}, []);

	return (
		<div>
			<h1>{props.title}</h1>
			<span style={{
				color: 'var(--text-color)',
				display: isLoading ? '' : 'none',
			}}
			>Loading...
			</span>
			<table
				className="display-table"
				style={{
					margin: '0 auto',
					display: isLoading ? 'none' : '',
				}}
			>
				<thead>
					<tr className="display-row table-header">
						<th>Rank</th>
						<th>Creator</th>
						<th>Rep</th>
					</tr>
				</thead>
				<tbody>
					{getTableRows()}
				</tbody>
			</table>
		</div>
	);

	/**
	 * Generates the rows of the leaderboard table.
	 * @returns The generated rows.
	 */
	function getTableRows(): ReactNode {
		return entries.map((entry) => (
			<tr
				className="display-row"
				key={`${entry.rank}-${entry.name}-${entry.rep}`}
			>
				<td>{entry.rank}</td>
				<td>
					<Link href={`/users/${entry.uid}`}>{entry.name}</Link>
				</td>
				<td>{entry.rep}</td>
			</tr>
		));
	}
}

Leaderboard.defaultProps = {
	isWidget: false,
};

export default Leaderboard;
