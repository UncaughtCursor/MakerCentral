/**
 * Creates a 2D array with a given width, height, and fill value.
 * @param width The width of the array.
 * @param height The height of the array.
 * @param fillValue The value to fill in for each entry.
 */
export default function createArray2d(width: number, height: number, fillValue: any) {
	const arr: any[][] = [];
	for (let i = 0; i < width; i++) {
		arr[i] = [];
		for (let j = 0; j < height; j++) {
			arr[i][j] = fillValue;
		}
	}
	return arr;
}
