import AppFrame from '@components/AppFrame';
import React from 'react';
import ProjectList from '../src/components/pages/controls/ProjectList';

/**
 * The user projects page.
 */
function ProjectsPage() {
	return (
		<AppFrame title="Your Projects - MakerCentral">
			<h1>Your Music Projects</h1>
			<p>Your music projects are shown here. Click one to open it.</p>
			<ProjectList />
		</AppFrame>
	);
}

export default ProjectsPage;
