/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import TimeAgo from 'javascript-time-ago';
import LikeIcon from '@mui/icons-material/Favorite';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import { useRouter } from 'next/router';
import { MCLevelDocData } from '@data/types/MCBrowserTypes';
import TagDisplay from './TagDisplay';
import LevelThumbnail from './LevelThumbnail';

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
	const history = useRouter();

	const previewContainerContents = (
		<>
			<div className="user-level-preview-header">
				<LevelThumbnail
					url={props.thumbnailUrl}
					status={props.status}
					style={{
						width: '140px',
						minWidth: '140px',
						height: 'min-content',
					}}
				/>
				<div className="user-level-preview-details">
					<h3 style={{ overflowWrap: 'anywhere' }}>{props.level.name}</h3>
					<p>{props.level.makerName} • {timeAgoStr}</p>
				</div>
			</div>
			<div className="user-level-preview-details">
				<div className="icon-count-row">
					<LikeIcon style={{ color: 'var(--text-color)' }} />
					<p>{props.level.numLikes.toLocaleString()}</p>
					<SportsEsportsIcon style={{ color: 'var(--text-color)' }} />
					<p>{props.level.numPlays.toLocaleString()}</p>
					<FlagCircleIcon style={{ color: 'var(--text-color)' }} />
					<p>{(props.level.clearRate * 100).toFixed(2)}%</p>
				</div>
				<TagDisplay tags={props.level.tags} />
				<p style={{ overflowWrap: 'anywhere' }}>{props.level.description}</p>
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
