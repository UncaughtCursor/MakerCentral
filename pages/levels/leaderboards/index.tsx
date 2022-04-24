import AppFrame from '@components/AppFrame';
import Leaderboard from '@components/pages/browser/Leaderboard';
import React from 'react';

/**
 * The leaderboard page.
 */
function LeaderboardPage() {
	return (
		<AppFrame
			title="Leaderboards - MakerCentral"
			description="View the top level creators on MakerCentral."
		>
			<Leaderboard title="All Levels Leaderboard" repFieldName="All" />
		</AppFrame>
	);
}

export default LeaderboardPage;
