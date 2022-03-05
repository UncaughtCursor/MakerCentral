import { Coordinates2d } from '@scripts/builder/util/Coordinates2d';
import { GridEntity } from './GridEntityManager';

/**
 * A system to keep track of different entities placed over a grid.
 * May have no boundaries, but has no collision detection.
 */
export default class UnboundedGridEntityManager<T extends GridEntity> {
	private gridWidth: number;

	private gridHeight: number;

	private mapEntries: Map<string, T>;

	entityList: T[];

	/**
	 * Creates a new GridEntityManager.
	 * @param gridWidth The width of the grid in tiles. Can be infinite.
	 * @param gridHeight The height of the grid in tiles. Can be infinite.
	 */
	constructor(gridWidth: number, gridHeight: number) {
		this.gridWidth = gridWidth;
		this.gridHeight = gridHeight;
		this.mapEntries = new Map();
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
			if (occupiedTileCoords.x < this.gridWidth && occupiedTileCoords.y < this.gridHeight) {
				// Keys are 2d coordinates objects converted to strings.
				this.mapEntries.set(JSON.stringify(occupiedTileCoords), entity);
			}
		});
	}

	/**
	 * Returns whether or not the queried grid tile is occupied.
	 * @param coords The coordinates of the tile.
	 * @returns Whether or not the tile is occupied.
	 */
	isTileOccupied(coords: Coordinates2d) {
		return this.mapEntries.get(JSON.stringify(coords)) !== undefined;
	}

	/**
	 * Returns the entity held at the specified coordinates.
	 * @param coords The coordinates to check.
	 * @returns The entity.
	 */
	getEntityAtCoords(coords: Coordinates2d) {
		return this.mapEntries.get(JSON.stringify(coords));
	}

	/**
	 * Deletes the entity held at the specified coordinates.
	 * @param coords The coordinates to delete from.
	 * @returns The entity.
	 */
	deleteEntityAtCoords(coords: Coordinates2d) {
		// Delete array entry
		const entity = this.mapEntries.get(JSON.stringify(coords));
		if (entity !== undefined) {
			const entityIndex = this.entityList.indexOf(entity);
			this.entityList.splice(entityIndex, 1);
		}

		// Delete map entry
		this.mapEntries.delete(JSON.stringify(coords));
	}

	/**
	 * Clears the entities off of the grid.
	 */
	clearEntities() {
		this.entityList = [];
		this.mapEntries = new Map();
	}

	/**
	 * Prints all coordinates and their corresponding entities to the console.
	 */
	logSelf() {
		const keyIterator = this.mapEntries.keys();
		let result = keyIterator.next();
		while (!result.done) {
			console.log(result.value);
			console.log(this.mapEntries.get(result.value));
			result = keyIterator.next();
		}
	}
}
