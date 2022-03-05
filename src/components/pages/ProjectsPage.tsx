import React from 'react';
import ProjectList from './controls/ProjectList';

/**
 * The user projects page.
 */
function ProjectsPage() {
	return (
		<>
			<h1>Your Projects</h1>
			<p>Your projects are shown here. Click one to open it.</p>
			<ProjectList />
		</>
	);
}

export default ProjectsPage;
