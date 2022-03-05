import React from 'react';
import '../Page.css';
import MusicSelectPage from './pages/MusicSelectPage';
import ResultsPage from './pages/ResultsPage';
import TrackSelectPage from './pages/TrackSelectPage';
import TrackEditPage from './pages/TrackEditPage';
import UploadPage from './pages/UploadPage';
import BuildSettingsPage from './pages/BuildSettingsPage';
import ProjectConfigPage from './pages/ProjectConfigPage';

/**
 * Renders an editor page from the editor context.
 * @param props.pageNum The page number to render.
 */
function PageRenderer(props: {pageNum: number}) {
	// eslint-disable-next-line no-undef
	let renderedPage: JSX.Element;
	switch (props.pageNum) {
	case 0: {
		renderedPage = (
			<UploadPage />
		);
		break;
	}
	case 1: {
		renderedPage = (
			<ProjectConfigPage />
		);
		break;
	}
	case 2: {
		renderedPage = (
			<MusicSelectPage />
		);
		break;
	}
	case 3: {
		renderedPage = (
			<TrackSelectPage />
		);
		break;
	}
	case 4: {
		renderedPage = (
			<TrackEditPage />
		);
		break;
	}
	case 5: {
		renderedPage = (
			<BuildSettingsPage />
		);
		break;
	}
	case 6: {
		renderedPage = (
			<ResultsPage />
		);
		break;
	}
	default: {
		renderedPage = (
			<p>Invalid Page!</p>
		);
	}
	}
	return <div className="page-renderer">{renderedPage}</div>;
}

export default PageRenderer;
