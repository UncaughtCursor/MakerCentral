import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import SettingsGroup from './controls/settings/SettingsGroup';
import TextField from './controls/TextField';
import TriggerButton from './controls/TriggerButton';
import EditorContext from './editor/EditorContext';

/**
 * The admin page.
 */
function Admin() {
	const [pid, setPid] = useState('');
	const [uid, setUid] = useState('');

	const ctx = useContext(EditorContext);
	const history = useHistory();
	return (
		<div style={{
			display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
		}}
		>
			<h1>Admin Panel</h1>
			<SettingsGroup name="Project Viewer">
				<TextField label="User ID" value={uid} onChange={setUid} />
				<TextField label="Project ID" value={pid} onChange={setPid} />
				<TriggerButton
					type="blue"
					text="Open"
					onClick={() => {
						launchAdminEditor(pid, uid, 'Admin Copy');
					}}
				/>
			</SettingsGroup>
			<SettingsGroup name="Early Access Key Generator">
				<TriggerButton
					type="normal"
					text="Generate"
					onClick={() => {}}
				/>
				<p>This doesn&amp;t actually do anything yet.
					Add functionality when we get enough patrons!
				</p>
			</SettingsGroup>
		</div>
	);

	/**
	 * Launches the track editor.
	 * @param projectId The ID of the project to open or null to start a new one.
	 */
	function launchAdminEditor(projectId: string | null, viewUid: string | null,
		projectName: string = 'Untitled Project') {
		ctx.projectId = projectId;
		ctx.projectName = projectName;
		ctx.isInitialized = false;
		ctx.viewUid = viewUid;
		history.push('/builder/editor');
	}
}

export default Admin;
