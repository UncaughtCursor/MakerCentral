/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { MakerCentralLevel } from '@scripts/browser/BrowserUtil';
import React, { useEffect, useState } from 'react';
import TimeAgo from 'javascript-time-ago';
import LikeIcon from '@mui/icons-material/Favorite';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import { useRouter } from 'next/router';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@scripts/site/FirebaseUtil';
import TagDisplay from './TagDisplay';

const timeAgo = new TimeAgo('en-us');
export const thumbnailDir = 'gs://music-level-studio-dev.appspot.com/game-level-thumb/small';
export const thumbnailSuffix = '_64x36';

export interface ImageLoadState {
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
	const thumbnailStorageUrl = `${thumbnailDir}/${props.level.id}${thumbnailSuffix}.png`;

	const [imgState, setImgState] = useState<ImageLoadState>({
		status: 'Loading',
		url: null,
	});

	useEffect(() => {
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
	}, [props.level]);

	const previewContainerContents = (
		<>
			<div className="user-level-preview-header">
				<img alt={props.level.name} src={imgState.url!} />
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
