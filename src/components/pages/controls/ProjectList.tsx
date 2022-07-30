import { db } from '@scripts/site/FirebaseUtil';
import {
	collection, DocumentData, getDocs, limit, orderBy, query,
} from 'firebase/firestore/lite';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TimeAgo from 'javascript-time-ago';
import useUserInfo from '@components/hooks/useUserInfo';
import EditorContext from '../editor/EditorContext';

const timeAgo = new TimeAgo('en-US');

/**
 * Returns a list of projects, most recent first.
 * @param props The props:
 * * limit: (Optional) The maximum amount of projects to show or null if no maximum.
 */
function ProjectList(props: {
	limit?: number | null,
}) {
	const [loaded, setLoaded] = useState(false);
	const [projects, setProjects] = useState([] as DocumentData[]);

	const ctx = useContext(EditorContext);
	const router = useRouter();
	const userInfo = useUserInfo();

	useEffect(() => {
		if (userInfo === null) return;
		const projectQuery = async function projectQuery() {
			const projectsRef = collection(db, `users/${userInfo.user.uid}/projects`);

			const q = query(
				projectsRef,
				orderBy('savedAt', 'desc'),
				limit(props.limit! === null ? Infinity : props.limit!),
			);
			const querySnapshot = await getDocs(q);

			const docs: DocumentData[] = [];
			querySnapshot.forEach((doc) => {
				docs.push(doc.data());
			});
			setProjects(docs);
			setLoaded(true);
		};

		if (userInfo !== null) projectQuery();
		if (typeof document !== 'undefined') {
			document.addEventListener('userinit', () => { projectQuery(); });
		}
	}, [userInfo]);

	const tableRows = getProjectListElements();

	return (
		<div style={{ display: 'flex', justifyContent: 'center' }}>
			{!loaded && userInfo !== null && <span>Loading...</span>}
			{tableRows.length === 0 && loaded && (
				<span>No projects. Try creating one!</span>
			)}
			{userInfo === null && (
				<span>Sign in to see your projects!</span>
			)}
			<table
				style={{ display: loaded ? '' : 'none' }}
				className="project-display-table"
			>
				<tr
					className="project-display-row table-header"
				>
					<td>Project Name</td>
					<td>Last Modified</td>
				</tr>
				{tableRows}
			</table>
		</div>
	);

	/**
	 * Retrieves the list of elements to be displayed for each project.
	 */
	function getProjectListElements() {
		return projects.map((project) => (
			<tr
				className="project-display-row"
				key={project.name}
				onClick={() => { launchEditor(project.projectId, project.name); }}
			>
				<td>{project.name}</td>
				<td>{capitalizeFirstLetter(
					timeAgo.format(project.savedAt.toDate()) as string,
				)}
				</td>
			</tr>
		));
	}

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

ProjectList.defaultProps = {
	limit: null,
};

/**
 * Returns the string with the first letter capitalized.
 * @param str The string to capitalize.
 * @returns The string with the first letter capitalized.
 */
function capitalizeFirstLetter(str: string) {
	return `${str.charAt(0).toUpperCase()}${str.substring(1)}`;
}

export default ProjectList;
