/* eslint-disable require-jsdoc */
/**
 * A 2D grid of numbers representing the tiles making up a structure.
 */
export default class Blueprint {
	grid: number[][];

	width: number;

	height: number;

	constructor(arr2d: number[][]) {
		this.grid = [];
		for (let i = 0; i < arr2d[0].length; i++) {
			this.grid[i] = [];
			for (let j = 0; j < arr2d.length; j++) {
				this.grid[i][j] = arr2d[j][i];
			}
		}

		this.width = this.grid.length;
		this.height = this.grid[0].length;
	}

	get(x: number, y: number) {
		return this.grid[x][y];
	}

	set(x: number, y: number, n: number) {
		this.grid[x][y] = n;
	}

	insertRow(y: number, row: number[]) {
		for (let i = 0; i < row.length; i++) {
			this.grid[i].splice(y, 0, row[i]);
		}
		this.height++;
	}
}
