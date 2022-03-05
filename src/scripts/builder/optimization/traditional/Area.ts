/**
 * A grid of tiles.
 */
export default class Area<T> {
	w: number;

	h: number;

	ofsX: number;

	ofsY: number;

	isVisible: boolean;

	grid!: (T | null)[][];

	/**
	 * Initializes the Area object.
	 * @param {number} w The width of the grid.
	 * @param {number} h The height of the grid.
	 */
	constructor(w: number, h: number) {
		this.w = w;
		this.h = h;
		this.ofsX = 0;
		this.ofsY = 0;
		this.isVisible = true;
		this.clear();
	}

	/**
	 * Gets the ID of the tile at the specified location on the grid.
	 * @param {number} x The x-coordinate of the tile to get.
	 * @param {number} y The y-coordinate of the tile to get.
	 * @param {boolean} useOfs If the x and y offset values should be factored in.
	 * @returns {number} The object in the tile found at the location.
	 */
	getTile(x: number, y: number, useOfs: boolean): T | null {
		if (!this.isInBounds(x, y)) {
			return null;
		}
		if (useOfs) {
			return this.grid[x + this.ofsX][y - this.ofsY];
		}
		return this.grid[x][y];
	}

	/**
	 * Determines if the tile at the specified location is not empty.
	 * @param {number} x The x-coordinate of the tile.
	 * @param {number} y The y-coordinate of the tile.
	 * @returns {boolean} If the tile at the location is not empty.
	 */
	isOccupied(x: number, y: number): boolean {
		if (!this.isInBounds(x, y)) {
			return true;
		}
		return this.grid[x][y] !== null;
	}

	/**
	 * Changes the type of tile at the specified location.
	 * @param {number} x The x-coordinate of the tile.
	 * @param {number} y The y-coordinate of the tile.
	 * @param {number} n The object to assign to the tile.
	 */
	setTile(x: number, y: number, n: T) {
		if (!this.isInBounds(x, y)) {
			return;
		}
		this.grid[x][y] = n;
	}

	/**
	 * Sets the tile at the specified location to null.
	 * @param {number} x The x-coordinate of the tile.
	 * @param {number} y The y-coordinate of the tile.
	 */
	clearTile(x: number, y: number) {
		if (!this.isInBounds(x, y)) {
			return;
		}
		this.grid[x][y] = null;
	}

	/**
	 * Clears the entire grid.
	 */
	clear() {
		let i;
		this.grid = [];
		for (i = 0; i < this.w; i++) {
			this.grid[i] = new Array(this.h).fill(null);
		}
	}

	/**
	 * Sets whether or not the grid is visible.
	 * @param {boolean} v If the grid is visible.
	 */
	setVisibility(v: boolean) {
		this.isVisible = v;
	}

	/**
	 * Determines if a specified point is within the bounds of the grid.
	 * @param {number} x The x-coordinate of the point.
	 * @param {number} y The y-coordinate of the point.
	 * @returns {boolean} If the point is in bounds.
	 */
	isInBounds(x: number, y: number): boolean {
		return x < this.w + this.ofsX && x >= this.ofsX && y < this.h + this.ofsY && y >= this.ofsY;
	}
}
