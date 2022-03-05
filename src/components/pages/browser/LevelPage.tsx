import { getLevel, UserLevel } from '@scripts/browser/BrowserUtil';
import TimeAgo from 'javascript-time-ago';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Spinner from '../controls/Spinner';
import TagDisplay from './TagDisplay';

const timeAgo = new TimeAgo('en-us');

/**
 * Displays details about a level. The id URL parameter sepecifes the level ID in the database.
 */
function LevelPage() {
	const params = useParams() as {id: string | undefined};
	const levelId = params.id;
	const [loaded, setLoaded] = useState(false);
	const [level, setLevel] = useState(null as UserLevel | null);

	useEffect(() => {
		setLoaded(false);
		getLevel(levelId !== undefined ? levelId : 'none').then((loadedLevel) => {
			setLevel(loadedLevel);
			setLoaded(true);
		});
	}, []);

	if (level === null) {
		return (
			<>
				<Spinner isActive={!loaded} />
				<p style={{ display: loaded ? '' : 'none' }}>Level not found. It may have been deleted.</p>
			</>
		);
	}
	return (
		<>
			<Spinner isActive={!loaded} />
			<div style={{ display: loaded ? '' : 'none' }}>
				<div className="level-page-content">
					<div className="level-page-top">
						<div className="level-page-info-container">
							<div style={{ marginBottom: '10px' }}>
								<h3 className="level-page-title">{level.name}</h3>
								<p className="level-code">{level.levelCode}</p>
							</div>
							<div className="level-page-img-container">
								<img className="level-page-img" src={level.thumbnailUrl} alt={level.name} />
								<p><i>{level.shortDescription}</i></p>
							</div>
						</div>
						<div
							className="level-page-info-container"
							style={{
								flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
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
									<td>{level.timestamp.toDate().toLocaleDateString()}</td>
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
			</div>
		</>
	);
}

export default LevelPage;
