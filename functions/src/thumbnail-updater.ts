import * as functions from 'firebase-functions';
import { smm2APIBaseUrl, thumbnailEndpoint } from './constants';
import sharp from 'sharp';
import { storageBucket } from '.';
import { CloudFunction } from './data/types/FirebaseUtilTypes';

const thumbnailPath = 'game-level-thumbs/small';
const thumbnailSize = {
	width: 64,
	height: 36,
}

export type generateThumbnailsForLevelIDsType = CloudFunction<{
	levelIDs: string[],
}, Buffer[]>
export const generateThumbnailsForLevelIDs = functions.https.onCall(async (data: {
	levelIDs: string[],
}) => {
	// Download the thumbnails for the level IDs from the SMM2 server.
	const images: Buffer[] = await Promise.all(data.levelIDs.map(async (levelID) => {
		const url = `${smm2APIBaseUrl}/${thumbnailEndpoint}/${levelID}`;
		const response = await fetch(url);
		return Buffer.from(await response.arrayBuffer());
	}));
	
	// Resize the thumbnails to the correct size.
	const thumbnails: Buffer[] = await Promise.all(images.map(async (image) => {
		const thumbnail = await sharp(image).resize(thumbnailSize.width, thumbnailSize.height).toBuffer();
		return thumbnail;
	}));

	// Upload the thumbnails to Firebase Storage.
	await Promise.all(thumbnails.map(async (thumbnail, i) => {
		const thumbnailName = `${data.levelIDs[i]}_${thumbnailSize.width}x${thumbnailSize.height}.png`;
		await uploadThumbnail(thumbnail, thumbnailName);
	}));

	// Return the buffers of the thumbnails to make things faster for the client.
	return thumbnails;
});

/**
 * Uploads a thumbnail to Firebase Storage.
 * @param thumbnail A buffer containing the thumbnail image data.
 * @param thumbnailName The file name of the thumbnail.
 */
async function uploadThumbnail(thumbnail: Buffer, thumbnailName: string) {
	const file = storageBucket.file(`${thumbnailPath}/${thumbnailName}`);
	const metadata = {
		contentType: 'image/png',
	};
	await file.save(thumbnail, metadata);
}
