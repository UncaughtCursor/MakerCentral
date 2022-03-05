import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import EditorContext from './editor/EditorContext';
import TriggerButton from './controls/TriggerButton';
import ProjectList from './controls/ProjectList';

/**
 * The initial project creation page.
 */
function Builder() {
	const history = useHistory();
	const ctx = useContext(EditorContext);
	return (
		<div>
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
		</div>
	);

	/**
	 * Launches the track editor.
	 * @param projectId The ID of the project to open or null to start a new one.
	 */
	function launchEditor(projectId: string | null, projectName: string = 'Untitled Project') {
		console.log('launch');
		ctx.projectId = projectId;
		ctx.projectName = projectName;
		ctx.isInitialized = false;
		history.push('/builder/editor');
	}
}

export default Builder;
