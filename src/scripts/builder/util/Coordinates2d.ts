export interface Coordinates2d {
	x: number;
	y: number;
}

/**
 * Returns a + b, the sum of two 2D coordinates.
 * @param a First coordinates to add.
 * @param b Second coordinates to add.
 * @returns The sum.
 */
export function addCoords(a: Coordinates2d, b: Coordinates2d): Coordinates2d {
	return { x: a.x + b.x, y: a.y + b.y };
}

/**
 * Returns a - b, the difference of two 2D coordinates.
 * @param a First coordinates to subtract.
 * @param b Second coordinates to subtract.
 * @returns The difference.
 */
export function subtractCoords(a: Coordinates2d, b: Coordinates2d): Coordinates2d {
	return { x: a.x - b.x, y: a.y - b.y };
}

/**
 * Returns a * n, where a is a pair of 2D coordinates and n is a scalar.
 * @param a The coordinates to multiply.
 * @param n The scalar to multiply by.
 * @returns The product.
 */
export function scaleCoords(a: Coordinates2d, n: number): Coordinates2d {
	return { x: a.x * n, y: a.y * n };
}

/**
 * Returns if a and b, two pairs of 2D coordinates, are equal.
 * @param a First coordinates.
 * @param b Second coordinates.
 * @returns Whether or not the two coordinates are equal.
 */
export function coordEquals(a: Coordinates2d, b: Coordinates2d) {
	return (a.x === b.x && a.y === b.y);
}

/**
 * Returns the squared euclidean distance between two pairs of two 2D coordinates, a and b.
 * @param a First coordinates.
 * @param b Second coordinates.
 * @returns The squared distance between the two coordinates.
 */
export function coordDistSqr(a: Coordinates2d, b: Coordinates2d): number {
	return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

/**
 * Returns the euclidean distance between two pairs of two 2D coordinates, a and b.
 * @param a First coordinates.
 * @param b Second coordinates.
 * @returns The distance between the two coordinates.
 */
export function coordDist(a: Coordinates2d, b: Coordinates2d): number {
	const distSqr = coordDistSqr(a, b);
	return Math.sqrt(distSqr);
}
