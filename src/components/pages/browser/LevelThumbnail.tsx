import React from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RemovedImageIcon from '@mui/icons-material/CancelPresentation';
import ImageSpinner from '../controls/ImageSpinner';

/**
 * A component for displaying a level thumbnail.
 * @param props The props:
 * * url: The URL of the thumbnail.
 * * status: The status of the thumbnail.
 * * style: (Optional) A custom style to apply to the thumbnail.
 */
function LevelThumbnail(props: {
	url: string | null,
	status: 'Loading' | 'Loaded' | 'Error' | 'Removed' | 'Not Uploaded',
	style?: React.CSSProperties,
}) {
	return (
		<div
			className="level-thumbnail-container"
			style={props.style}
		>
			{(props.status === 'Loading' || props.status === 'Not Uploaded') && (
				<div className="level-thumbnail-loading">
					<ImageSpinner />
				</div>
			)}
			{props.status === 'Loaded' && (
				<img
					className="level-thumbnail-image"
					src={props.url!}
					alt="Level thumbnail"
				/>
			)}
			{props.status === 'Error' && (
				<div className="level-thumbnail-error">
					<ErrorOutlineIcon style={{
						color: 'var(--bg-lite)',
					}}
					/>
				</div>
			)}
			{props.status === 'Removed' && (
				<div className="level-thumbnail-removed">
					<RemovedImageIcon style={{
						color: 'var(--bg-lite)',
					}}
					/>
				</div>
			)}
		</div>
	);
}

LevelThumbnail.defaultProps = {
	style: {},
};

export default LevelThumbnail;
