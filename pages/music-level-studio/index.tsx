import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import AppFrame from '@components/AppFrame';
import Gate from '@components/main/Gate';
import EditorContext from '../../src/components/pages/editor/EditorContext';
import TriggerButton from '../../src/components/pages/controls/TriggerButton';
import ProjectList from '../../src/components/pages/controls/ProjectList';

/**
 * The initial project creation page.
 */
function Builder() {
	const router = useRouter();
	const ctx = useContext(EditorContext);
	return (
		<AppFrame
			title="Music Level Studio - MakerCentral"
			description="Automatically generate music levels, even global looping music!"
		>
			<h1>Music Level Studio</h1>
			<p>To begin, start a new project or open an existing one.</p>
			<br />
			<TriggerButton
				text="New Project"
				type="blue"
				onClick={() => { launchEditor(null); }}
			/>
			<br />
			<br />
			<h3>Recent Projects</h3>
			<ProjectList limit={3} />
		</AppFrame>
	);

	/**
	 * Launches the track editor.
	 * @param projectId The ID of the project to open or null to start a new one.
	 */
	function launchEditor(projectId: string | null, projectName: string = 'Untitled Project') {
		ctx.projectId = projectId;
		ctx.projectName = projectName;
		ctx.isInitialized = false;
		router.push('/music-level-studio/edit');
	}
}

export default Builder;
