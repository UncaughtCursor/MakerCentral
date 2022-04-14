import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import AppFrame from '@components/AppFrame';
import useUserInfo from '@components/hooks/useUserInfo';
import { ownerUid } from '@scripts/site/FirebaseUtil';
import SettingsGroup from '../src/components/pages/controls/settings/SettingsGroup';
import TextField from '../src/components/pages/controls/TextField';
import TriggerButton from '../src/components/pages/controls/TriggerButton';
import EditorContext from '../src/components/pages/editor/EditorContext';
import Page404 from './404';

/**
 * The admin page.
 */
function Admin() {
	const [pid, setPid] = useState('');
	const [uid, setUid] = useState('');

	const userInfo = useUserInfo();
	const userId = userInfo !== null ? userInfo.user.uid : null;

	const ctx = useContext(EditorContext);
	const history = useRouter();

	if (userId !== ownerUid) return <Page404 />;
	return (
		<AppFrame>
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
				<SettingsGroup name="Reward Key Generator">
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
		</AppFrame>
	);

	/**
	 * Launches the track editor.
	 * @param projectId The ID of the project to open or null to start a new one.
	 */
	function launchAdminEditor(
		projectId: string | null,
		viewUid: string | null,
		projectName: string = 'Untitled Project',
	) {
		ctx.projectId = projectId;
		ctx.projectName = projectName;
		ctx.isInitialized = false;
		ctx.viewUid = viewUid;
		history.push('/music-level-studio/edit');
	}
}

export default Admin;
