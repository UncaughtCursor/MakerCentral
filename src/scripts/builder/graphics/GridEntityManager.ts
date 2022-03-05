import createArray2d from '../util/createArray2d';
import { Coordinates2d } from '../util/Coordinates2d';

export type GridEntity = {
	occupiedTiles: Coordinates2d[]
}

/**
 * A system to keep track of different entities placed over the grid.
 */
export default class GridEntityManager<T extends GridEntity> {
	private gridWidth: number;

	private gridHeight: number;

	private mapEntries: Map<string, T>;

	entityList: T[];

	private occupancyGrid: boolean[][];

	/**
	 * Creates a new GridEntityManager.
	 * @param gridWidth The width of the grid in tiles.
	 * @param gridHeight The height of the grid in tiles.
	 */
	constructor(gridWidth: number, gridHeight: number) {
		this.gridWidth = gridWidth;
		this.gridHeight = gridHeight;
		this.mapEntries = new Map();
		this.occupancyGrid = createArray2d(gridWidth, gridHeight, false);
		this.entityList = [];
	}

	/**
	 * Adds an entity to the grid.
	 * @param entity The entity to add.
	 */
	addEntity(entity: T) {
		this.entityList.push(entity);

		// Check if the entity occupies one or multiple tiles.
		entity.occupiedTiles.forEach((occupiedTileCoords) => {
			// Only process grid tiles that are in bounds
			if (occupiedTileCoords.x >= 0 && occupiedTileCoords.x < this.gridWidth
				&& occupiedTileCoords.y >= 0 && occupiedTileCoords.y < this.gridHeight) {
				// Keys are 2d coordinates objects converted to strings.
				this.mapEntries.set(JSON.stringify(occupiedTileCoords), entity);
				this.occupancyGrid[occupiedTileCoords.x][occupiedTileCoords.y] = true;
			}
		});
	}

	/**
	 * Returns whether or not the queried grid tile is occupied.
	 * @param coords The coordinates of the tile.
	 * @returns Whether or not the tile is occupied.
	 */
	isTileOccupied(coords: Coordinates2d) {
		if (!(coords.x >= 0 && coords.x < this.gridWidth
			&& coords.y >= 0 && coords.y < this.gridHeight)) return false;
		return this.occupancyGrid[coords.x][coords.y];
	}

	/**
	 * Returns the entity held at the specified coordinates.
	 * @param coords The coordinates to check.
	 * @returns The entity.
	 */
	getEntityAtCoords(coords: Coordinates2d) {
		if (!(coords.x >= 0 && coords.x < this.gridWidth
			&& coords.y >= 0 && coords.y < this.gridHeight)) return undefined;
		return this.mapEntries.get(JSON.stringify(coords));
	}

	/**
	 * Clears the entities off of the grid.
	 */
	clearEntities() {
		this.entityList = [];
		this.mapEntries = new Map();
		this.occupancyGrid = createArray2d(this.gridWidth, this.gridHeight, false);
	}
}
