import React, { useContext, useState } from 'react';
import { deleteProject, saveProject } from '@scripts/site/UserDataScripts';
import { auth, getUser, randomString } from '@scripts/site/FirebaseUtil';
import TimeAgo from 'javascript-time-ago';
import useInterval from 'use-interval';
import { onAuthStateChanged } from 'firebase/auth';
import useUserInfo from '@components/hooks/useUserInfo';
import TriggerButton from '../controls/TriggerButton';
import TextField from '../controls/TextField';
import EditorContext from './EditorContext';

const timeAgo = new TimeAgo('en-US');

type ProjectManagerTabProperty = 'name' | 'description';

interface ProjectManagerTabState {
	projectName: string,
	lastSaveTime: Date | null,
	isSaving: boolean,
	ago: string,
}

/**
 * Tab tab in the editor that allows the user to save and rename their project.
 */
function ProjectManagerTab() {
	const ctx = useContext(EditorContext);
	const [state, setState] = useState({
		projectName: ctx.projectName,
		lastSaveTime: null,
		isSaving: false,
		ago: 'never',
	} as ProjectManagerTabState);
	const userInfo = useUserInfo();
	const user = userInfo !== null ? userInfo.user : null;

	let saveStatusText = '';
	if (state.isSaving) saveStatusText = 'Saving...';
	else {
		saveStatusText = `Last saved ${state.ago}`;
	}

	useInterval(() => {
		setState((s) => ({
			...s,
			ago: s.lastSaveTime !== null
				? timeAgo.format(s.lastSaveTime) as string
				: 'never',
		}));
	}, 1000);

	return (
		<div>
			<h4>Project Settings</h4>
			<div className="project-manager-tab-container">
				<TextField
					label="Project Name"
					value={state.projectName}
					onChange={(str) => { handleChange('name', str); }}
				/>
			</div>
			<div style={{ display: user === null ? 'none' : '' }}>
				<TriggerButton
					type="blue"
					text="Save Project"
					onClick={() => { save(false); }}
				/>
				<p
					style={{ color: 'gray', fontSize: '12px' }}
				>{saveStatusText}
				</p>
				<TriggerButton
					type="dark"
					text="Save as New"
					onClick={() => { save(true); }}
				/>
				<TriggerButton
					type="dark"
					text="Delete"
					onClick={deleteProj}
				/>
			</div>
			<div style={{ display: user === null ? '' : 'none' }}>
				<p>Sign in to save your project.</p>
			</div>
		</div>
	);

	/**
	 * Handles a change in the project manager tab's settings.
	 * @param type The property to be changed.
	 * @param value The new property value.
	 */
	function handleChange(type: ProjectManagerTabProperty, value: string) {
		setState({
			...state,
			projectName: value,
		});
	}

	/**
	 * Saves the current working project.
	 * @param saveAsNew Whether or not to save the current project as a new one.
	 */
	function save(saveAsNew: boolean) {
		if (ctx.projectId === null || saveAsNew) {
			ctx.projectId = randomString(28);
		}
		try {
			saveProject(state.projectName, ctx.project, ctx.projectId).then(() => {
				const time = new Date();
				setState({
					...state,
					isSaving: false,
					lastSaveTime: time,
					ago: timeAgo.format(time) as string,
				});
			});
			setState({
				...state,
				isSaving: true,
			});
		} catch (e) {
		// eslint-disable-next-line no-alert
			alert('Level failed to save.');
		}
	}

	/**
	 * Deletes the current working project.
	 */
	function deleteProj() {
		if (ctx.projectId === null) {
			return;
		}
		try {
			deleteProject(ctx.projectId).then(() => {
				// eslint-disable-next-line no-alert
				alert('Project has been deleted. To undo, save the project again.');
			});
		} catch (e) {
		// eslint-disable-next-line no-alert
			alert('Level failed to be deleted.');
		}
	}
}

export default ProjectManagerTab;
