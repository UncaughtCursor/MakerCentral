/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import TimeAgo from 'javascript-time-ago';
import LikeIcon from '@mui/icons-material/Favorite';
import PlayIcon from '@mui/icons-material/SportsEsports';
import ClearRateIcon from '@mui/icons-material/FlagCircle';
import { MCLevelDocData, MCPromoLevelDocData } from '@data/types/MCBrowserTypes';
import TagDisplay from './TagDisplay';
import LevelThumbnail from './LevelThumbnail';
import BookmarkButton from './BookmarkButton';
import IconValueRow from './IconValueRow';

const timeAgo = new TimeAgo('en-us');

/**
 * Displays a clickable preview of a user-created level.
 * @param props The props:
 * * level: The level to display a preview of.
 * * thumbnailUrl: The URL of the thumbnail to display.
 * * status: The status of the thumbnail.
 */
function LevelPreview(props: {
	level: MCLevelDocData | MCPromoLevelDocData,
	thumbnailUrl: string,
	status: 'Loading' | 'Loaded' | 'Error' | 'Removed' | 'Not Uploaded',
}) {
	// eslint-disable-next-line no-param-reassign
	props.level.uploadTime = props.level.uploadTime as number;
	const timeAgoStr = timeAgo.format(new Date(props.level.uploadTime));
	const formattedLevelCode = `${props.level!.id.substring(0, 3)}-${props.level!.id.substring(3, 6)}-${props.level!.id.substring(6, 9)}`;

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
				<div className="user-level-preview-title-container">
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
				<IconValueRow values={[
					{
						icon: <LikeIcon style={{ color: 'var(--text-color)' }} />,
						value: props.level.numLikes.toLocaleString(),
					},
					{
						icon: <PlayIcon style={{ color: 'var(--text-color)' }} />,
						value: props.level.numPlays.toLocaleString(),
					},
					{
						icon: <ClearRateIcon style={{ color: 'var(--text-color)' }} />,
						value: `${(props.level.clearRate * 100).toFixed(2)}%`,
					},
				]}
				/>
				<TagDisplay tags={props.level.tags} />
				<p style={{ overflowWrap: 'anywhere' }}>{props.level.description}</p>
				{isPromoLevel(props.level) && (
					<p style={{ color: 'var(--inactive-white)' }}>
						{`Promoted by ${props.level.promoter}${props.level.expiry ? `, expires ${timeAgo.format(new Date(props.level.expiry))}` : ''}`}
					</p>
				)}
				{!isPromoLevel(props.level) && (
					// We don't want to show the level code for promo levels
					// This is to save space
					<div style={{
						display: 'flex',
						flexGrow: 1,
						width: '100%',
						alignItems: 'end',
						justifyContent: 'end',
					}}
					>
						<p
							className="level-code"
							style={{
								textAlign: 'right',
								color: 'var(--inactive-white)',
								height: 'max-content',
							}}
						>{formattedLevelCode}
						</p>
					</div>
				)}
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

/**
 * Discriminates between a level and a promo level.
 * @param level The level to discriminate.
 * @returns Whether the level is a promo level.
 */
export function isPromoLevel(
	level: MCLevelDocData | MCPromoLevelDocData,
): level is MCPromoLevelDocData {
	return (level as MCPromoLevelDocData).promoter !== undefined;
}

/**
 * Converts a promo level to a normal level.
 * @param promoLevel The promo level to convert.
 * @returns The converted level.
 */
export function convertPromoLevelToLevel(
	promoLevel: MCPromoLevelDocData,
): MCLevelDocData {
	return {
		id: promoLevel.id,
		name: promoLevel.name,
		description: promoLevel.description,
		makerId: promoLevel.makerId,
		makerName: promoLevel.makerName,
		uploadTime: promoLevel.uploadTime,
		numLikes: promoLevel.numLikes,
		numPlays: promoLevel.numPlays,
		clearRate: promoLevel.clearRate,
		tags: promoLevel.tags,
		updatedTime: promoLevel.updatedTime,
		country: promoLevel.country,
		difficulty: promoLevel.difficulty,
		gameStyle: promoLevel.gameStyle,
		numBoos: promoLevel.numBoos,
		theme: promoLevel.theme,
		likePercentage: promoLevel.likePercentage,
	};
}
