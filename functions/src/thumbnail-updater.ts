import * as functions from 'firebase-functions';
import { smm2APIBaseUrl, thumbnailEndpoint } from './constants';
import sharp from 'sharp';
import { storageBucket } from '.';
import { fetchBuffer, operationCollectionName } from './util';
import { AxiosError } from 'axios';
import { db } from '.';

const thumbnailPath = 'game-level-thumb/small';
const thumbnailSize = {
	width: 64,
	height: 36,
}

const levelDeleteQueueCollectionPath = `${operationCollectionName}/queues/level-delete-queue`;

export const generateThumbnailsForLevelIDs = functions.https.onCall(async (data: {
	levelIDs: string[],
}) => {
	type ThumbnailDownloadResult = {
		levelID: string,
		status: 'Success' | 'Error' | 'Removed',
		buffer: Buffer | null,
	};
	const maxLevelsPerRequest = 100;

	if (data.levelIDs.length > maxLevelsPerRequest) {
		throw new Error(`Cannot generate thumbnails for more than ${maxLevelsPerRequest} levels at once.`);
	}

	// Download the thumbnails for the level IDs from the SMM2 server.
	const results: ThumbnailDownloadResult[] = await Promise.all(data.levelIDs.map(async (levelID) => {
		const url = `${smm2APIBaseUrl}/${thumbnailEndpoint}/${levelID}`;
		let buffer: Buffer | null = null;
		let status: 'Success' | 'Error' | 'Removed' = 'Error';
		try {
			buffer = await fetchBuffer(url);
			status = 'Success';
		} catch(e) {
			console.error('Error downloading thumbnail');
			if (e instanceof AxiosError) {
				console.error('HTTP error:', e.response?.status);
				const respData = (e.response?.data as Buffer | undefined);
				const respJson = (respData instanceof Buffer ? JSON.parse(respData.toString()) : undefined);
				if (respJson.error === 'No course with that ID') {
					status = 'Removed';

					// Add the level ID to the level delete queue
					// as an empty document whose ID is the level ID.
					const docRef = db.collection(levelDeleteQueueCollectionPath).doc(levelID);
					await docRef.set({});
				}
			}
		}
		return {
			levelID,
			status,
			buffer,
		};
	}));

	const statusMap: { [levelID: string]: 'Success' | 'Error' | 'Removed' } = {};
	results.forEach(({ levelID, status }) => {
		statusMap[levelID] = status;
	});
		
	
	// Resize the thumbnails to the correct size.
	const thumbnails: Map<string, Buffer> = new Map();
	for (const result of results) {
		const buffer = result.buffer;
		if (buffer) {
			const thumbnail = await sharp(buffer)
				.png()
				.resize(thumbnailSize.width, thumbnailSize.height)
				.toBuffer();
			thumbnails.set(result.levelID, thumbnail);
		}
	}

	// Upload the thumbnails to Firebase Storage.
	for (const [levelID, thumbnail] of thumbnails) {
		const numTries = 5;
		const thumbnailSuffix = '_64x36';
		for (let i = 0; i < numTries; i++) {
			try {
				await uploadThumbnail(thumbnail, `${levelID}${thumbnailSuffix}.png`);
				break;
			}
			catch(e) {
				console.error(e);
			}
		}
	}

	// Return the thumbnails to make things faster for the client.
	// Encode them as a map of level ID to thumbnail URL or the status if there was an error.
	const thumbnailsMap: { [levelID: string]: string } = {};
	Object.keys(statusMap).forEach((levelID) => {
		const thumbnail = thumbnails.get(levelID);
		thumbnailsMap[levelID] = statusMap[levelID] === 'Success'
			? `data:image/png;base64,${thumbnail!.toString('base64')}` : statusMap[levelID];
	});
	return thumbnailsMap;
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
