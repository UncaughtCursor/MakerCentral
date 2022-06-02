/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { MakerCentralLevel } from '@scripts/browser/BrowserUtil';
import React, { useState } from 'react';
import TimeAgo from 'javascript-time-ago';
import LikeIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import { useRouter } from 'next/router';
import useMediaQuery from '@components/hooks/useMediaQuery';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@scripts/site/FirebaseUtil';
import TagDisplay from './TagDisplay';

const timeAgo = new TimeAgo('en-us');
const thumbnailDir = 'gs://music-level-studio-dev.appspot.com/game-level-thumb/small';
const thumbnailSuffix = '_64x36';

interface ImageLoadState {
	status: 'Loading' | 'Loaded' | 'Error';
	url: string | null;
}

/**
 * Displays a clickable preview of a user-created level.
 * @param props The props:
 * * level: The level to display a preview of.
 */
function LevelPreview(props: {
	level: MakerCentralLevel,
}) {
	// eslint-disable-next-line no-param-reassign
	props.level.uploadTime = props.level.uploadTime as number;
	const timeAgoStr = timeAgo.format(new Date(props.level.uploadTime));
	const history = useRouter();
	const isMobileMode = useMediaQuery('(max-width: 850px)');
	const thumbnailStorageUrl = `${thumbnailDir}/${props.level.id}${thumbnailSuffix}.png`;

	const [imgState, setImgState] = useState<ImageLoadState>({
		status: 'Loading',
		url: null,
	});
	getDownloadURL(ref(storage, thumbnailStorageUrl)).then((url) => {
		setImgState({
			status: 'Loaded',
			url,
		});
	}).catch(() => {
		setImgState({
			status: 'Error',
			url: null,
		});
		console.error(`Failed to load thumbnail for level ${props.level.id}`);
	});

	const previewContainerContents = isMobileMode ? (
		<div className="user-level-preview-details" key={props.level.id}>
			<h3 style={{ overflowWrap: 'anywhere' }}>{props.level.name}</h3>
			<div className="user-level-preview-img-container">
				<img
					alt={props.level.name}
					src={imgState}
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
			<p style={{ overflowWrap: 'anywhere' }}>{props.level.description}</p>
		</div>
	) : (
		<>
			<div className="user-level-preview-img-container">
				<img alt={props.level.name} src={imgState.url!} />
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
