/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import TimeAgo from 'javascript-time-ago';
import LikeIcon from '@mui/icons-material/Favorite';
import PlayIcon from '@mui/icons-material/SportsEsports';
import ClearRateIcon from '@mui/icons-material/FlagCircle';
import { MCLevelDocData } from '@data/types/MCBrowserTypes';
import TagDisplay from './TagDisplay';
import LevelThumbnail from './LevelThumbnail';
import BookmarkButton from './BookmarkButton';

const timeAgo = new TimeAgo('en-us');

/**
 * Displays a clickable preview of a user-created level.
 * @param props The props:
 * * level: The level to display a preview of.
 * * thumbnailUrl: The URL of the thumbnail to display.
 * * status: The status of the thumbnail.
 */
function LevelPreview(props: {
	level: MCLevelDocData,
	thumbnailUrl: string,
	status: 'Loading' | 'Loaded' | 'Error' | 'Removed' | 'Not Uploaded',
}) {
	// eslint-disable-next-line no-param-reassign
	props.level.uploadTime = props.level.uploadTime as number;
	const timeAgoStr = timeAgo.format(new Date(props.level.uploadTime));
	const previewContainerContents = (
		<>
			<div className="user-level-preview-header">
				<LevelThumbnail
					url={props.thumbnailUrl}
					status={props.status}
					style={{
						height: '81px',
					}}
				/>
				<div className="user-level-preview-details">
					<h3 style={{ overflowWrap: 'anywhere' }}>{props.level.name}</h3>
					<p><a
						href={`/users/${props.level.makerId}`}
						style={{
							color: 'var(--text-color)',
						}}
					>{props.level.makerName}
					</a> • {timeAgoStr}
					</p>
				</div>
			</div>
			<div className="user-level-preview-details">
				<div className="icon-count-row">
					<LikeIcon style={{ color: 'var(--text-color)' }} />
					<p>{props.level.numLikes.toLocaleString()}</p>
					<PlayIcon style={{ color: 'var(--text-color)' }} />
					<p>{props.level.numPlays.toLocaleString()}</p>
					<ClearRateIcon style={{ color: 'var(--text-color)' }} />
					<p>{(props.level.clearRate * 100).toFixed(2)}%</p>
				</div>
				<TagDisplay tags={props.level.tags} />
				<p style={{ overflowWrap: 'anywhere' }}>{props.level.description}</p>
			</div>
		</>
	);

	return (
		<div className="user-level-preview-wrapper">
			<BookmarkButton
				level={props.level}
				left="calc(100% - 36.75px - 10px)"
				top="10px"
			/>
			<a
				href={`/levels/view/${props.level.id}`}
				className="user-level-preview"
			>{previewContainerContents}
			</a>
		</div>
	);
}

export default LevelPreview;
