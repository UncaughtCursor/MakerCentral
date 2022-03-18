import React, { useContext, useEffect, useState } from 'react';
import { notesToGrid } from '@scripts/builder/project/NoteGridConverter';
import NoteSchedule from '@scripts/builder/playback/NoteSchedule';
import { loadProject } from '@scripts/site/UserDataScripts';
import Project from '@scripts/builder/project/Project';
import { loadBuffersInSchedule } from '@scripts/builder/playback/MusicPlayer';
import * as Images from '@scripts/builder/graphics/Images';
import EditorLink from './EditorLink';
import PageRenderer from './PageRenderer';
import ProjectManagerTab from './ProjectManagerTab';
import EditorContext from './EditorContext';
import EditorMenu from './controls/EditorMenu';
import Spinner from '../controls/Spinner';

const pageNames = [
	'Choose Source',
	'Configure Project',
	'Select Music',
	'Choose Tracks',
	'Edit Tracks',
	'Build Music',
	'View Results',
];

/**
 * A component used to render the state of the editor.
 */
function EditorView() {
	const ctx = useContext(EditorContext);
	const [pageNum, setPageNum] = useState(0);
	const [pageLimit, setPageLimit] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!ctx.isInitialized) initialize();
	}, []);

	return (
		<>
			<div className="editor-display" style={{ display: isLoading ? 'none' : '' }}>
				<EditorMenu>
					<ProjectManagerTab />
					<div>
						<h4>Builder Navigation</h4>
						<div className="editor-nav">
							{renderNavItems()}
						</div>
					</div>
				</EditorMenu>
				<PageRenderer pageNum={pageNum} />
			</div>
			<Spinner isActive={isLoading} />
		</>
	);

	/**
 	 * Renders the links in the navigation component.
 	 * @returns The links to be displayed.
 	 */
	function renderNavItems() {
		const items = [];
		for (let i = 0; i <= pageLimit; i++) {
			const name = pageNames[i];
			const className = `editor-nav-link ${i === pageNum ? 'editor-nav-active' : ''}`;
			items.push(
				<EditorLink
					className={className}
					pageNum={i}
					onActivate={(num) => ctx.func.setPage(num)}
					key={name}
				>{name}
				</EditorLink>,
			);
		}
		return items;
	}

	/**
	 * Determines the latest editor page number that the user should have access to.
	 * @returns The page number.
	 */
	function getFinalAvailablePageNum(): number {
		const buildInst = ctx.project.buildInstances[0];
		let pgNum = 0;
		if (ctx.project.projectMidis.length > 0) pgNum = 1;
		if (buildInst.buildMode !== 'unspecified') pgNum = 2;
		if (buildInst.selections[0].startBeat !== null
			&& buildInst.selections[0].endBeat !== null) pgNum = 3;
		if (buildInst.tracks.length > 0) pgNum = 4;
		if (buildInst.optResult !== null) {
			if (buildInst.optResult.succeeded) pgNum = 6;
		}
		return pgNum;
	}

	/**
	 * Initializes the editor session.
	 */
	async function initialize() {
		setIsLoading(true);
		ctx.noteSchedule = new NoteSchedule();
		ctx.project = new Project();
		ctx.uploadedFileName = 'none';

		await loadBuffersInSchedule(ctx.noteSchedule);

		// Load old codebase images
		await Images.loadImages();

		// Set context functions
		ctx.func.setPage = (num: number) => {
			ctx.noteSchedule!.stop();
			ctx.currentPage = num;
			setPageLimit(getFinalAvailablePageNum());
			setPageNum(num);
		};
		ctx.func.genNoteGrids = () => {
			const buildInst = ctx.project.buildInstances[0];
			buildInst.noteGrids = [];
			buildInst.tracks.forEach((track) => {
				const grid = notesToGrid(track.notes);
				buildInst.noteGrids.push(grid);
				// grid.logSelf();
			});
		};

		ctx.func.setPage(0);

		// Decode and load project data
		if (ctx.projectId !== null) {
			ctx.project = (await loadProject(ctx.projectId, ctx.viewUid))!;

			const buildInst = ctx.project.buildInstances[0];

			let initPageNum = 0;

			// Go to project config page if MIDI is uploaded
			if (ctx.project.projectMidis.length > 0) initPageNum = 1;

			// Go to music selection page if build type is specified
			if (buildInst.buildMode !== 'unspecified') initPageNum = 2;

			// Go to track selection page is a selection exists
			if (buildInst.selections[0].startBeat !== null
				&& buildInst.selections[0].endBeat !== null) initPageNum = 3;

			// Go to the editor page if there are selected tracks
			if (buildInst.tracks.length > 0) initPageNum = 4;

			ctx.func.setPage(initPageNum);

			ctx.isInitialized = true;
			setIsLoading(false);
		} else {
			ctx.isInitialized = true;
			setIsLoading(false);
		}
	}
}

/**
 * A sidebar that can be opened and closed by the user.
 */
function EditorSidebar(props: {children: React.ReactNode}) {
	return <div className="editor-sidebar">{props.children}</div>;
}

export default EditorView;
