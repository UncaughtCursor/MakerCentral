import AppFrame from '@components/AppFrame';
import Gate from '@components/main/Gate';
import LevelEditor from '@components/pages/browser/LevelEditor';
import React from 'react';

/**
 * The page used for editing and uploading levels.
 */
function LevelUploadPage() {
	return (
		<AppFrame title="Upload Level - Music Level Studio">
			<Gate requireEA={false} showLogout={false}>
				<div>
					<h1>Upload a Level</h1>
					<LevelEditor levelId={null} />
				</div>
			</Gate>
		</AppFrame>
	);
}
export default LevelUploadPage;
