import { MCWorldPreview } from '@data/types/MCBrowserTypes';
import React from 'react';
import LikeIcon from '@mui/icons-material/Favorite';
import LevelsIcon from '@mui/icons-material/EmojiFlags';
import PlayIcon from '@mui/icons-material/SportsEsports';
import ClearRateIcon from '@mui/icons-material/FlagCircle';
import SuperWorldThumbnail from './SuperWorldThumbnail';
import TagDisplay from './TagDisplay';
import IconValueRow from './IconValueRow';

const superWorldSlug = '/worlds';

/**
 * Displays a preview of a super world.
 * @param props The props:
 * * world: The preview data of the super world.
 * * makerName: The name of the maker who owns the super world.
 * * makerId: The ID of the maker who owns the super world.
 * * thumbnailUrls: The URLs of the thumbnails of the showcased levels in the super world.
 */
function SuperWorldPreview(props: {
	world: MCWorldPreview,
	makerName: string,
	makerId: string,
	thumbnailUrls: {[levelId: string]: string},
}) {
	const totalLikes = Math.round(props.world.avgLikes * props.world.numLevels);
	const totalPlays = Math.round(props.world.avgPlays * props.world.numLevels);
	return (
		<a
			className="super-world-preview"
			href={`${superWorldSlug}/${props.makerId}`}
		>
			<SuperWorldThumbnail
				heightPx={162}
				thumbnailUrls={props.thumbnailUrls}
			/>
			<div className="super-world-info-container">
				<h3>Super {props.makerName} World</h3>
				<IconValueRow values={[
					{
						icon: <LikeIcon style={{ color: 'var(--text-color)' }} />,
						value: totalLikes.toLocaleString(),
					},
					{
						icon: <PlayIcon style={{ color: 'var(--text-color)' }} />,
						value: totalPlays.toLocaleString(),
					},
					{
						icon: <ClearRateIcon style={{ color: 'var(--text-color)' }} />,
						value: `${props.world.avgClearRate.toFixed(2)}%`,
					},
					{
						icon: <LevelsIcon style={{ color: 'var(--text-color)' }} />,
						value: props.world.numLevels.toLocaleString(),
					},
				]}
				/>
				<TagDisplay tags={props.world.prominentTags} />
			</div>
		</a>
	);
}

export default SuperWorldPreview;
