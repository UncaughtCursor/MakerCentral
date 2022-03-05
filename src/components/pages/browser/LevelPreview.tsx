/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { UserLevel } from '@scripts/browser/BrowserUtil';
import React from 'react';
import TimeAgo from 'javascript-time-ago';
import LikeIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import { useHistory } from 'react-router-dom';
import TagDisplay from './TagDisplay';

const timeAgo = new TimeAgo('en-us');

/**
 * Displays a clickable preview of a user-created level.
 * @param props The props:
 * * level: The level to display a preview of.
 */
function LevelPreview(props: {
	level: UserLevel,
}) {
	const timeAgoStr = timeAgo.format(props.level.timestamp.toDate());
	const history = useHistory();
	return (
		<div
			className="user-level-preview"
			onClick={() => {
				history.push(`/levels/view/${props.level.id}`);
			}}
		>
			<div className="user-level-preview-img-container">
				<img alt={props.level.name} src={props.level.thumbnailUrl} />
			</div>
			<div className="user-level-preview-details">
				<h3>{props.level.name}</h3>
				<p>{props.level.makerName} • {timeAgoStr}</p>
				<div className="view-like-count">
					<LikeIcon style={{ color: 'var(--text-color)' }} />
					<p>{props.level.numLikes}</p>
					<CommentIcon style={{ color: 'var(--text-color)' }} />
					<p>{props.level.numComments}</p>
				</div>
				<TagDisplay tags={props.level.tags} />
				<p>{props.level.shortDescription}</p>
			</div>
		</div>
	);
}

export default LevelPreview;
