/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { UserLevel } from '@scripts/browser/BrowserUtil';
import React from 'react';
import TimeAgo from 'javascript-time-ago';
import LikeIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import { useRouter } from 'next/router';
import useMediaQuery from '@components/hooks/useMediaQuery';
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
	// eslint-disable-next-line no-param-reassign
	props.level.uploadTime = props.level.uploadTime as number;
	const timeAgoStr = timeAgo.format(new Date(props.level.uploadTime));
	const history = useRouter();
	const isMobileMode = useMediaQuery('(max-width: 850px)');

	const previewContainerContents = isMobileMode ? (
		<div className="user-level-preview-details" key={props.level.id}>
			<h3 style={{ overflowWrap: 'anywhere' }}>{props.level.name}</h3>
			<div className="user-level-preview-img-container">
				<img
					alt={props.level.name}
					src={props.level.thumbnailUrl}
				/>
			</div>
			<div style={{
				display: 'flex',
				gap: '20px',
				justifyContent: 'center',
				margin: '-20px 0 -15px 0',
			}}
			>
				<p>{props.level.makerName} • {timeAgoStr}</p>
				<div className="view-like-count">
					<LikeIcon style={{ color: 'var(--text-color)' }} />
					<p>{props.level.numLikes}</p>
					<CommentIcon style={{ color: 'var(--text-color)' }} />
					<p>{props.level.numComments}</p>
				</div>
			</div>
			<TagDisplay tags={props.level.tags} />
			<p style={{ overflowWrap: 'anywhere' }}>{props.level.shortDescription}</p>
		</div>
	) : (
		<>
			<div className="user-level-preview-img-container">
				<img alt={props.level.name} src={props.level.thumbnailUrl} />
			</div>
			<div className="user-level-preview-details">
				<h3 style={{ overflowWrap: 'anywhere' }}>{props.level.name}</h3>
				<p>{props.level.makerName} • {timeAgoStr}</p>
				<div className="view-like-count">
					<LikeIcon style={{ color: 'var(--text-color)' }} />
					<p>{props.level.numLikes}</p>
					<CommentIcon style={{ color: 'var(--text-color)' }} />
					<p>{props.level.numComments}</p>
				</div>
				<TagDisplay tags={props.level.tags} />
				<p style={{ overflowWrap: 'anywhere' }}>{props.level.shortDescription}</p>
			</div>
		</>
	);

	return (
		<div
			className="user-level-preview"
			onClick={() => {
				history.push(`/levels/view/${props.level.id}`);
			}}
		>{previewContainerContents}
		</div>
	);
}

export default LevelPreview;
