import { deleteLevel, getLevel, MakerCentralLevel } from '@scripts/browser/BrowserUtil';
import React, { useEffect, useState } from 'react';
import AppFrame from '@components/AppFrame';
import Page404 from 'pages/404';
import FeedbackControl from '@components/pages/browser/FeedbackControl';
import BookmarkButton from '@components/pages/browser/BookmarkButton';
import TriggerButton from '@components/pages/controls/TriggerButton';
import { auth, getUser, storage } from '@scripts/site/FirebaseUtil';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import ImageGallery, { ReactImageGalleryItem } from 'react-image-gallery';
import Link from 'next/link';
import CommentsSection from '@components/pages/browser/comments/CommentsSection';
import useUserInfo from '@components/hooks/useUserInfo';
import ReportDialog from '@components/main/dialogs/ReportDialog';
import { getDownloadURL, ref } from 'firebase/storage';
import { ImageLoadState, thumbnailDir, thumbnailSuffix } from '@components/pages/browser/LevelPreview';
import TagDisplay from '../../../src/components/pages/browser/TagDisplay';

/**
 * Displays details about a level. The id URL parameter specifies the level ID in the database.
 */
function LevelPage(props: {
	level: MakerCentralLevel | null
}) {
	const [showReportDialog, setShowReportDialog] = useState(false);

	const router = useRouter();

	const level = props.level;
	if (level === null) {
		return <Page404 />;
	}

	const userInfo = useUserInfo();
	const user = userInfo !== null ? userInfo.user : null;

	/* const thumbnailIdx = props.level!.imageUrls.indexOf(props.level!.thumbnailUrl);

	const images: ReactImageGalleryItem[] = props.level!.imageUrls.map((imageUrl) => ({
		original: imageUrl,
		originalClass: 'level-page-img-container',
	})); */

	const thumbnailStorageUrl = props.level !== null
		? `${thumbnailDir}/${props.level.id}${thumbnailSuffix}.png`
		: '';

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
			console.error(`Failed to load thumbnail for level ${props.level!.id}`);
		});
	}, [props.level]);

	const formattedLevelCode = `${props.level!.id.substring(0, 3)}-${props.level!.id.substring(3, 6)}-${props.level!.id.substring(6, 9)}`;

	return (
		<AppFrame
			title={`${props.level!.name} - MakerCentral Levels`}
			description={`"${props.level!.description}" Tags: ${props.level!.tags.join(', ')}. ${props.level!.makerName}'s level on MakerCentral.`}
			imageUrl=""
		>
			<div className="level-page-content">
				<div className="level-page-header">
					<BookmarkButton
						level={level}
						left="calc(100% - 50px)"
						top="15px"
					/>
					<img
						className="level-page-img"
						src={imgState.url!}
						alt={level.name}
					/>
					<div>
						<h3 className="level-page-title">{level.name}</h3>
						<p className="level-code">{formattedLevelCode}</p>
					</div>
				</div>
				<div className="level-page-info-group">
					<div
						className="level-page-info-container"
						style={{
							flexGrow: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center',
						}}
					>
						<table className="info-table">
							<tr>
								<td>Course ID</td>
								<td>{formattedLevelCode}</td>
							</tr>
							<tr>
								<td>Maker</td>
								<td>{level.makerName}</td>
							</tr>
							<tr>
								<td>Upload Date</td>
								<td>{new Date(level.uploadTime).toLocaleDateString()}</td>
							</tr>
							<tr>
								<td>Likes</td>
								<td>{level.numLikes}</td>
							</tr>
							<tr>
								<td>Plays</td>
								<td>{level.numPlays}</td>
							</tr>
							<tr>
								<td>Game Style</td>
								<td>{level.gameStyle}</td>
							</tr>
							<tr>
								<td>Theme</td>
								<td>{level.theme}</td>
							</tr>
							<tr>
								<td>Clear Rate</td>
								<td>{(level.clearRate * 100).toFixed(3)}%{level.clearRate === 0 ? ' (Uncleared)' : ''}</td>
							</tr>
						</table>
					</div>
					<div
						className="level-page-info-container"
						style={{
							width: '300px',
						}}
					>
						<h4>Description</h4>
						<p>{level.description}</p>
						<br />
						<h4>Tags</h4>
						<TagDisplay tags={level.tags} />
					</div>
				</div>
			</div>
		</AppFrame>
	);
}

/**
 * Fetches level data at request time.
 * @param context The context of the request. Includes the URL parameters.
 * @returns The props to render at request time.
 */
export async function getServerSideProps(context: { params: {
	id: string,
}}) {
	const levelId = context.params.id;
	const loadedLevel = await getLevel(levelId);
	return {
		props: {
			level: loadedLevel,
		},
	};
}

export default LevelPage;
