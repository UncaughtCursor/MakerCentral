import { Stream } from "stream";
import { storage } from "./FirebaseUtil";
import { meilisearch } from "./SearchManager";
import sharp from 'sharp';

/**
 * Generates a thumbnail grid to be displayed on the site's home page.
 * These thumbnails are obtained from popular levels in the database.
 * This is then saved as a file in the tmp directory.
 * @param width The number of thumbnails to display in a row.
 * @param height The number of thumbnails to display in a column.
 */
export default async function generateThumbnailGrid(width: number, height: number) {
	const outputFilePath = 'tmp/thumbnail-grid.png';
	const numThumbnails = width * height;

	console.log(`Downloading ${numThumbnails} thumbnails.`);
	
	console.log('Getting level IDs...');
	const levelIds = await getPopularLevelIds(numThumbnails);

	console.log('Downloading thumbnails...');
	// TODO: Max batch size of 5000.
	const thumbnails = await Promise.all(levelIds.map(getLevelThumbnailUrl));

	console.log('Creating thumbnail grid...');

	const thumbWidth = 64;
	const thumbHeight = 36;

	const image = sharp({
		create: {
			width: thumbWidth * width,
			height: thumbHeight * height,
			channels: 4,
			background: { r: 255, g: 255, b: 255, alpha: 0 },
		}
	});

	// Add each thumbnail to the image.
	const composites: sharp.OverlayOptions[] = [];
	for (let i = 0; i < numThumbnails; i++) {
		const x = i % width;
		const y = Math.floor(i / width);

		composites.push({
			input: thumbnails[i],
			left: x * thumbWidth,
			top: y * thumbHeight,
		});
	}

	image.composite(composites);

	// Save the image to the output file.
	console.log('Saving thumbnail grid...');
	await image.png().toFile(outputFilePath);

	console.log('Thumbnail grid saved.');
}

/**
 * Obtains the level IDs of the most popular levels in the database.
 * @param numLevels The number of IDs to obtain.
 * @returns The level IDs of the most popular levels.
 */
async function getPopularLevelIds(numLevels: number): Promise<string[]> {
	const levelIndex = meilisearch.index('levels');
	const chunkSize = 100;
	const numChunks = Math.ceil(numLevels / chunkSize);

	const levelIds: string[] = [];

	for (let i = 0; i < numChunks; i++) {
		const chunk = await levelIndex.search('', {
			limit: chunkSize,
			offset: i * chunkSize,
		});

		levelIds.push(...chunk.hits.map(hit => hit.id));
	}

	return levelIds;
}

/**
 * Downloads a thumbnail for a level.
 * @param id The level's course ID.
 * @returns A Promise that resolves to a buffer containing the thumbnail.
 */
async function getLevelThumbnailUrl(id: string): Promise<Buffer> {
	const levelThumbnailDir = 'game-level-thumb/small';
	const levelThumbnailSuffix = '_64x36';

	const thumbnailStorageUrl = `${levelThumbnailDir}/${id}${levelThumbnailSuffix}.png`;
	const buffer = await streamToBuffer(storage.bucket().file(thumbnailStorageUrl).createReadStream());
	return buffer;
}

async function streamToBuffer(stream: Stream): Promise<Buffer> {
    return new Promise < Buffer > ((resolve, reject) => {
        const buffer = Array < any > ();

        stream.on("data", chunk => buffer.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(buffer)));
        stream.on("error", err => reject(`error converting stream - ${err}`));

    });
} 