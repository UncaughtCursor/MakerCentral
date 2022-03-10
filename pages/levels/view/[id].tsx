import { getLevel, UserLevel } from '@scripts/browser/BrowserUtil';
import React from 'react';
import AppFrame from '@components/AppFrame';
import Page404 from 'pages/404';
import FeedbackControl from '@components/pages/browser/FeedbackControl';
import TagDisplay from '../../../src/components/pages/browser/TagDisplay';

/**
 * Displays details about a level. The id URL parameter specifies the level ID in the database.
 */
function LevelPage(props: {
	level: UserLevel | null
}) {
	const level = props.level;
	if (level === null) {
		return <Page404 />;
	}

	const levelRating = level.numLikes + level.numDislikes > 0
		? Math.round((100 * level.numLikes) / (level.numLikes + level.numDislikes))
		: 100;
	return (
		<AppFrame>
			<div className="level-page-content">
				<div className="level-page-top">
					<div className="level-page-info-container" style={{ flexGrow: 6 }}>
						<div style={{ marginBottom: '10px' }}>
							<h3 className="level-page-title">{level.name}</h3>
							<p className="level-code">{level.levelCode}</p>
						</div>
						<div className="level-page-img-container">
							<img
								className="level-page-img"
								src={level.thumbnailUrl}
								alt={level.name}
							/>
							<p><i>{level.shortDescription}</i></p>
						</div>
						<FeedbackControl levelId={level.id} />
					</div>
					<div
						className="level-page-info-container"
						style={{
							flexGrow: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center',
						}}
					>
						<table className="info-table">
							<tr>
								<td>Course ID</td>
								<td>{level.levelCode}</td>
							</tr>
							{/* TODO: Maker profile embed */}
							<tr>
								<td>Maker</td>
								<td>{level.makerName}</td>
							</tr>
							<tr>
								<td>Upload Date</td>
								<td>{new Date(level.uploadTime).toLocaleDateString()}</td>
							</tr>
							<tr>
								<td>Difficulty</td>
								<td>{level.difficulty}</td>
							</tr>
							<tr>
								<td>Game Style</td>
								<td>{level.gameStyle}</td>
							</tr>
							<tr>
								<td>Likes</td>
								<td>{level.numLikes}</td>
							</tr>
							<tr>
								<td>Rating</td>
								<td>{levelRating}%</td>
							</tr>
						</table>
					</div>
				</div>
				<div className="level-page-info-container">
					<h4>Description</h4>
					<p>{level.description}</p>
					<br />
					<h4>Tags</h4>
					<TagDisplay tags={level.tags} />
				</div>
			</div>
		</AppFrame>
	);
}

/**
 * Fetches level data at request time.
 * @param context The context of the request. Includes the URL parameters.
 * @returns The props to render at request time.
 */
export async function getServerSideProps(context: { params: {
	id: string,
}}) {
	const levelId = context.params.id;
	const loadedLevel = await getLevel(levelId);
	return {
		props: {
			level: loadedLevel,
		},
	};
}

export default LevelPage;
