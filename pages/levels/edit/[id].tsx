import AppFrame from '@components/AppFrame';
import Gate from '@components/main/Gate';
import LevelEditor from '@components/pages/browser/LevelEditor';
import { useRouter } from 'next/router';
import React from 'react';

/**
 * Displays the page used to edit existing levels.
 */
function LevelEditPage() {
	const router = useRouter();
	const levelId = router.query.id as string;
	return (
		<AppFrame title="Edit Level - MakerCentral">
			<Gate requireEA={false} showLogout={false}>
				<h1>Edit Level</h1>
				<LevelEditor levelId={levelId} />
			</Gate>
		</AppFrame>
	);
}

export default LevelEditPage;
