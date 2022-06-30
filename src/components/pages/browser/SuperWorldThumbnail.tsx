import useLevelThumbnails, { LevelThumbnailStates } from '@components/hooks/useLevelThumbnails';
import React from 'react';
import LevelThumbnail from './LevelThumbnail';

const aspectRatio = 16 / 9;

/**
 * A 2x2 grid of thumbnails for the levels in a super world.
 * @param props	The props:
 * * thumbnailUrls: The URLs of the thumbnails of the levels in the super world.
 * Empty URLs will be attempted to be generated.
 * * heightPx: The height of the grid in pixels.
 * * style: (Optional) The style of the grid.
 */
function SuperWorldThumbnail(props: {
	thumbnailUrls: {[levelId: string]: string},
	heightPx: number,
	style?: React.CSSProperties,
}) {
	const initThumbnailStates: LevelThumbnailStates = {};

	const thumbnailHeight = props.heightPx / 2;
	const thumbnailWidth = thumbnailHeight * aspectRatio;

	for (const levelId of Object.keys(props.thumbnailUrls)) {
		const thumbnailUrl = props.thumbnailUrls[levelId];
		if (thumbnailUrl === '') {
			initThumbnailStates[levelId] = {
				state: 'Not Uploaded',
				url: null,
			};
		} else {
			initThumbnailStates[levelId] = {
				state: 'Loaded',
				url: thumbnailUrl,
			};
		}
	}
	const thumbnails = useLevelThumbnails(initThumbnailStates);

	return (
		<div
			className="super-world-thumbnail-container"
			style={{
				maxHeight: `${props.heightPx}px`,
				maxWidth: `${props.heightPx * aspectRatio}px`,
				gridTemplateRows: 'repeat(2, 1fr)',
				gridTemplateColumns: 'repeat(2, 1fr)',
				...props.style,
			}}
		>
			{Object.keys(thumbnails).map((levelId) => {
				const thumbnail = thumbnails[levelId];
				return (
					<LevelThumbnail
						url={thumbnail.url!}
						status={thumbnail.state}
						style={{
							maxWidth: `${thumbnailWidth}px`,
							maxHeight: `${thumbnailHeight}px`,
						}}
					/>
				);
			})}
		</div>
	);
}

SuperWorldThumbnail.defaultProps = {
	style: {},
};

export default SuperWorldThumbnail;
