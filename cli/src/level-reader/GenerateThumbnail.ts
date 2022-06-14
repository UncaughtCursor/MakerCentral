import getPixels from 'get-pixels';
import ndarray, { NdArray } from 'ndarray';
import clustering from 'density-clustering';
import { parseLevelFromDBBuffer } from './LevelReader';
import { renderLevelIDs } from './Render';
import { PixelQueueEntry } from '../LevelConvert';

/**
 * Generates a object representation of a thumbnail from the full thumbnail and gzipped level data.
 * Saves as [Course ID].cgf or .png if simple mode is used. Resolves when the operation completes.
 * @param thumbnailImageData A buffer of thumbnail's data.
 * @param levelData A buffer of the level data.
 * @param outPath The path to output the file at.
 * @param simple Whether or not to simply shrink the original thumbnail.
 * @returns The entry to a file writing queue.
 */
export function generateThumbnail(
	thumbnailImageData: Buffer,
	levelData: Buffer,
	outPath: string,
	simple?: boolean,
): Promise<PixelQueueEntry> {
	const mime = 'image/jpeg';
	const encoding = 'base64';
	const data = thumbnailImageData.toString(encoding);
	const uri = `data:${mime};${encoding},${data}`;

	return new Promise((resolve) => {
		getPixels(uri, (err, pixels) => {
			if (err) {
				console.error(err);
				return;
			}

			const indexedPixels = getIndexedTileArr(pixels, !!simple);

			if (!simple) {
				const level = parseLevelFromDBBuffer(levelData);
				const levelPixels = renderLevelIDs(level);
			}

			// TODO: Detect where level screenshot was taken and create data file

			resolve({
				path: outPath,
				data: indexedPixels,
			});
		});
	});
}

/**
 * Scans for a 2D array of tiles, where each different number represents a different color.
 * @param pixels The pixels of the image.
 * @param picMode Whether or not to use colors and higher res in the output. Used for previewing.
 * @returns The resulting grid.
 */
function getIndexedTileArr(pixels: NdArray<Uint8Array>, picMode: boolean): NdArray<Uint8Array> {
	const sourcePxPerTile = !picMode ? (80 / 3) : (80 / 3) / 2;

	const imgWidthTiles = Math.floor(pixels.shape[0] / sourcePxPerTile);
	const imgHeightTiles = Math.floor(pixels.shape[1] / sourcePxPerTile);

	const colors: number[][] = [];

	for (let i = 0; i < imgWidthTiles; i++) {
		for (let j = 0; j < imgHeightTiles; j++) {
			const x = Math.round(i * sourcePxPerTile);
			const y = Math.round(j * sourcePxPerTile);

			const color = getAvgColorFromRect(
				pixels,
				x,
				y,
				Math.floor(sourcePxPerTile),
				Math.floor(sourcePxPerTile),
			);

			colors.push(color);
		}
	}

	const dbscan = new clustering.DBSCAN();

	const colorTolerance = 10;

	// Each group contains the array indices of related pixels
	const indexedColorGroups = dbscan.run(colors, colorTolerance, 1);

	const indexedColors: NdArray<Uint8Array> = ndarray(
		new Uint8Array(imgWidthTiles * imgHeightTiles * 3),
		[imgWidthTiles, imgHeightTiles, 3],
	);

	const getGroupOfIndex = (pos: number) => {
		for (let k = 0; k < indexedColorGroups.length; k++) {
			if (indexedColorGroups[k].includes(pos)) return k;
		}
		return -1;
	};

	const groupAvgColors = indexedColorGroups.map(
		(groupColors) => groupColors.reduce(
			(acc, val) => acc.map((accVal, i) => accVal + colors[val][i]),
			[0, 0, 0],
		)
			.map((val) => Math.round(val / groupColors.length)),
	);

	let arrPos = 0;
	for (let i = 0; i < imgWidthTiles; i++) {
		for (let j = 0; j < imgHeightTiles; j++) {
			const pxGroup = getGroupOfIndex(arrPos);
			for (let k = 0; k < 3; k++) {
				const color = picMode
					? groupAvgColors[pxGroup][k]
					: pxGroup;
				indexedColors.set(i, j, k, color);
			}
			arrPos++;
		}
	}

	return indexedColors;
}

/**
 * Calculates the average color of the pixels contained in a rectangle over an image's pixels.
 * @param pixels The ndarray of pixels to that the rectangle exists on.
 * @param x The x-coordinate of the top left edge of the rectangle.
 * @param y The y-coordinate of the top left edge of the rectangle.
 * @param w The width of the rectangle.
 * @param h The height of the rectangle.
 * @returns An array containing the average RGB color.
 */
function getAvgColorFromRect(
	pixels: NdArray<Uint8Array>,
	x: number,
	y: number,
	w: number,
	h: number,
): number[] {
	const sum = [0, 0, 0];
	const tileSlicePixels = pixels.hi(x + w, y + h, 4).lo(x, y, 0);
	const numPx = tileSlicePixels.shape[0] * tileSlicePixels.shape[1];

	for (let i = 0; i < tileSlicePixels.shape[0]; i++) {
		for (let j = 0; j < tileSlicePixels.shape[1]; j++) {
			sum[0] += tileSlicePixels.get(i, j, 0);
			sum[1] += tileSlicePixels.get(i, j, 1);
			sum[2] += tileSlicePixels.get(i, j, 2);
		}
	}

	return [sum[0] / numPx, sum[1] / numPx, sum[2] / numPx];
}
