/* eslint-disable no-param-reassign */
import Project, { ProjectData } from '@scripts/builder/project/Project';
import {
	deleteDoc,
	doc, getDoc, serverTimestamp, setDoc,
} from 'firebase/firestore/lite';
import serialize from 'serialize-javascript';
import LZString from 'lz-string';
import UndoRedoManager from '@scripts/builder/project/UndoRedoManager';
import ProjectTrack from '@scripts/builder/project/ProjectTrack';
import { httpsCallable } from 'firebase/functions';
import {
	db, functions, getUser,
} from './FirebaseUtil';

export type PatronStatus = 'None' | 'Mushroom' | 'Fire Flower' | 'Super Star';

let curPatronStatus: PatronStatus | null = null;

/**
 * Initializes and/or updates user data after login.
 */
export async function initUser() {
	curPatronStatus = null;

	const curUser = getUser()!;
	const userDocRef = doc(db, `users/${curUser.uid}`);
	const isFirstLogin = !(await getDoc(userDocRef)).exists();

	const userInit = httpsCallable(functions, 'initUser');
	await userInit();

	if (isFirstLogin) {
		setDoc(userDocRef, {
			name: curUser.displayName,
		}, { merge: true });
	}

	const getPatronStatus = httpsCallable(functions, 'getPatronStatus');
	const patronType = (await getPatronStatus()).data as 'None' | 'Mushroom' | 'Fire Flower' | 'Super Star';
	curPatronStatus = patronType;

	const evt = new Event('userinit');
	if (typeof window !== 'undefined') document.dispatchEvent(evt);
}

/**
 * Saves a project on the server.
 * @param name The name to assign to the level.
 * @param projectData The project data to save.
 * @param projectId The project ID to save under.
 */
export async function saveProject(
	name: string,
	projectData: Project,
	projectId: string,
) {
	const projectRef = doc(db, `users/${getUser()!.uid}/projects/${projectId}`);

	// Take out the optResult data when serializing
	const optResult = projectData.buildInstances[0].optResult;
	projectData.buildInstances[0].optResult = null;

	const serializedData = serialize(projectData);
	const compressedData = LZString.compressToUTF16(serializedData);

	await setDoc(projectRef, {
		name,
		savedAt: serverTimestamp(),
		data: compressedData,
		projectId,
	});

	projectData.buildInstances[0].optResult = optResult;
}

/**
 * Deletes a project.
 * @param projectId The id of the project to delete.
 */
export async function deleteProject(projectId: string) {
	const projectRef = doc(db, `users/${getUser()!.uid}/projects/${projectId}`);
	await deleteDoc(projectRef);
}

/**
 * Loads a project from the server.
 * @param projectId The project ID.
 * @returns The Project object or null if unsuccessful.
 */
export async function loadProject(
	projectId: string,
	userId?: string | null,
): Promise<Project | null> {
	const uid = (userId === undefined || userId === null) ? getUser()!.uid : userId;
	const projectRef = doc(db, `users/${uid}/projects/${projectId}`);
	const projectSnap = await getDoc(projectRef);

	if (projectSnap.exists()) {
		const data = projectSnap.data().data;
		const compressedData = data as unknown as string;

		const decompressedData = LZString.decompressFromUTF16(compressedData as unknown as string);
		console.log(decompressedData);

		const project = eval(`(${decompressedData})`);

		// Restore class objects from saved data
		const projectData: ProjectData = project;

		const undoRedoData = project.buildInstances[0].undoRedoManager;
		project.buildInstances[0].undoRedoManager = new UndoRedoManager(undoRedoData.history, undoRedoData.historyIndex);

		const baseTrackData = projectData.buildInstances[0].baseTracks;
		for (let i = 0; i < baseTrackData.length; i++) {
			baseTrackData[i] = ProjectTrack.fromData(baseTrackData[i]);
		}
		const trackData = projectData.buildInstances[0].tracks;
		for (let i = 0; i < trackData.length; i++) {
			trackData[i] = ProjectTrack.fromData(trackData[i]);
		}

		const createdProject: Project = new Project(projectData);
		return createdProject;
	}
	console.error('Project could not be loaded. Document not found.');
	return null;
}

/**
 * Refreshes the current user's data.
 */
export async function refreshUserData() {
	const curUser = getUser();
	if (curUser === null) return;
	await initUser();
}

/**
 * Returns whether or not the user has patron status. Returns null if the user data isn't loaded.
 */
export function getPatronType(): PatronStatus | null {
	return curPatronStatus;
}
