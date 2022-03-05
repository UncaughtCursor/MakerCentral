/* eslint-disable require-jsdoc */
import GridEntityManager from '@scripts/builder/graphics/GridEntityManager';
import { MM2GameEntity } from '../MM2GameEntity';
import { SemisolidPlatform } from '../SemisolidPlatform';
import {
	handleAllConflicts, marginWidth, numStructChunks, Setup, TraditionalOptimizerTarget,
} from './AlphaOptimizer';
import Area from './Area';
import CollisionBox from './CollisionBox';
import NoteStructure, { setNoteStructureData } from './NoteStructure';
import { entityIdToName, levelHeight, MM2Instruments } from './util';

const isBuildMode = true;
globalThis.levelWidth = 240;

export default class TraditionalLevel {
	width: number;

	height: number;

	targets: TraditionalOptimizerTarget[][];

	overview: Area<number>;

	background!: Area<number>;

	foreground!: Area<number>;

	isTrackOccupant: boolean[][][];

	numberOfOccupants: number[][];

	entityCount: number;

	powerupCount: number;

	maxWidth: number;

	resolution: number;

	limitLine: number | null;

	conflictCount!: number;

	entityGrid: GridEntityManager<MM2GameEntity>;

	semisolidGrid: GridEntityManager<SemisolidPlatform>;

	bpb: number;

	/**
	 * Initializes the level object.
	 * @constructor
	 */
	constructor(targetGroups: TraditionalOptimizerTarget[][],
		bpb: number, setups: Setup[], levelWidth: number) {
		globalThis.levelWidth = levelWidth;
		this.width = globalThis.levelWidth;
		this.height = levelHeight;
		this.targets = targetGroups;
		this.overview = new Area<number>(this.width, this.height);
		this.isTrackOccupant = new Array(this.width);
		this.numberOfOccupants = new Array(this.width);
		this.entityCount = 0;
		this.powerupCount = 0;
		this.maxWidth = 0;
		this.resolution = 1;
		this.limitLine = null;
		globalThis.structures = [];
		globalThis.cells = [];
		globalThis.chunks = [];
		this.bpb = bpb;
		this.entityGrid = new GridEntityManager<MM2GameEntity>(this.width, this.height);
		this.semisolidGrid = new GridEntityManager<SemisolidPlatform>(this.width, this.height);
		for (let i = 0; i < numStructChunks; i++) globalThis.chunks[i] = [];
		// FIXME: Pushback limit of zero or negative for non-autoscroll scrolls
		setNoteStructureData(setups, Infinity);
	}

	/**
	 * Gets the type of tile in the specified location
	 * @param {number} x The x-coordinate of the tile.
	 * @param {number} y The y-coordinate of the tile.
	 * @returns {number} The value of the tile in the location.
	 */
	checkTile(x: number, y: number) {
		return this.overview.getTile(x, y, true);
	}

	checkBgTile(x: number, y: number) {
		return this.background.getTile(x, y, true);
	}

	checkFgTile(x: number, y: number) {
		return this.foreground.getTile(x, y, true);
	}

	/**
	 * Adds a group of optimization targets to the stored list.
	 * @param {TraditionalOptimizerTarget[]} group The list of targets to add.
	 */
	addTargetGroup(group: TraditionalOptimizerTarget[]) {
		this.targets.push(group);
	}

	/**
	 * Refreshes the level overview by plotting values from the stored note groups.
	 * @returns A promise that resolves when the generation completes or fails.
	 */
	build(): Promise<void> {
		return new Promise((resolve) => {
			this.overview = new Area<number>(globalThis.levelWidth, levelHeight);
			this.background = new Area<number>(globalThis.levelWidth, levelHeight);
			this.foreground = new Area<number>(globalThis.levelWidth, levelHeight);
			this.isTrackOccupant = new Array(globalThis.levelWidth);
			this.numberOfOccupants = new Array(globalThis.levelWidth);
			globalThis.structures = [];
			this.entityCount = 0;
			this.powerupCount = 0;
			this.conflictCount = 0;
			this.entityGrid.clearEntities();
			this.semisolidGrid.clearEntities();
			// this.width = 0;
			this.limitLine = null;
			const columnCounts = [];
			let i;
			let j;
			for (i = 0; i < globalThis.levelWidth; i++) {
				this.isTrackOccupant[i] = new Array<boolean[]>(levelHeight);
				this.numberOfOccupants[i] = new Array<number>(levelHeight);
				for (j = 0; j < levelHeight; j++) {
					this.isTrackOccupant[i][j] = new Array<boolean>(this.targets.length).fill(false);
					this.numberOfOccupants[i][j] = 0;
				}
			}
			this.resetSpatialData(true);
			// TODO: Use notegroup xShifts to draw notes offset from one another
			// But also have it so if shifted and non-shifted notes overlap, they are both visible
			for (i = 0; i < this.targets.length; i++) {
				for (j = 0; j < this.targets[i].length; j++) {
					const target = this.targets[i][j];
					const x = Math.floor((target.beats * this.bpb) + marginWidth);
					const y = target.y;
					if (!isVisible(x, y, marginWidth, 0)) {
						// TODO: Message for out of bounds notes, also run this as a pre-build check
						continue;
					}

					// Set note
					if (!isBuildMode) this.overview.setTile(x, y, 1);
					this.isTrackOccupant[x][y][i] = true;
					// TODO: Properly update this information after conflict resolution
					this.numberOfOccupants[x][y]++;

					// Set instrument
					// TODO: Different instruments
					const ins = target.entityType;
					if (y <= 26) {
						if (columnCounts[x] === undefined) {
							columnCounts[x] = { entities: 0, powerups: 0 };
						}
						if (MM2Instruments[ins].isPowerup) {
							this.powerupCount++;
							columnCounts[x].powerups++;
						} else {
							this.entityCount++;
							columnCounts[x].entities++;
						}
						// if (x > this.width) this.width = x;
						// if((this.powerupCount > 100 || this.entityCount > 100) &&
						// (this.limitLine === null)) this.limitLine = x + marginWidth + 1;
						if (!isBuildMode) this.overview.setTile(x, y, ins + 2);
						this.isTrackOccupant[x][y][i] = true;
						this.numberOfOccupants[x][y]++; // TODO: Also here
					}

					if (isBuildMode) {
						const newStruct = new NoteStructure(0, x, y, ins);
						newStruct.entities[0] = ins + 2;
						globalThis.structures.push(newStruct);
					}
				}
			}
			const curCount = { entities: 0, powerups: 0 };
			for (i = 0; i < columnCounts.length; i++) {
				if (columnCounts[i] === undefined) continue;
				if (columnCounts[i].entities !== undefined) curCount.entities += columnCounts[i].entities;
				if (columnCounts[i].powerups !== undefined) curCount.powerups += columnCounts[i].powerups;
				if ((curCount.entities > 100 || curCount.powerups > 100) && this.limitLine === null) {
					this.limitLine = i;
				}
			}

			// const that = this;
			globalThis.structures.forEach((struct) => { // First pass: Handle conflicts
				struct.checkForCollisions();
			});
			// let preSolveTime = new Date().getMilliseconds();
			handleAllConflicts();
			// if (isBuildMode)
			// console.log(`Solver finished in ${new Date().getMilliseconds() - preSolveTime} ms`);

			// resetSpatialData(false);
			this.conflictCount = 0;
			if (isBuildMode) {
				let lowestX = 27;
				// Second pass: Check for unhandled conflicts, etc after solver has finished
				globalThis.structures.forEach((struct) => {
					// TODO: Move structures back to an offset of 0 if possible, or any lesser offset
					if (struct.hasSemisolid) {
						this.semisolidGrid.addEntity({
							pos: { x: struct.x, y: struct.y },
							occupiedTiles: [{ x: struct.x, y: struct.y }],
						});
					}
					struct.checkForCollisions();
					if (struct.conflictingStructures.length > 0 || !struct.checkForLegality()) {
						this.markTile(struct.x, struct.y, 1);
						this.conflictCount++;
					}
					lowestX = Math.min(lowestX, struct.x);
				});
				// drawOffsetX = 27 - lowestX;
				globalThis.cells.forEach((cell) => cell.build());
				globalThis.cells.forEach((cell) => cell.members.forEach((struct) => {
					struct.checkForCollisions();
					if (struct.conflictingStructures.length > 0) {
						this.markTile(struct.x, struct.y, 1);
						this.conflictCount++;
					}
				}));
				// console.log(cells);

				// let offsetCount = 0;
				this.entityGrid.clearEntities();
				globalThis.structures.forEach((struct) => { // Third pass: Draw the structures
					if (struct.conflictingStructures.length === 0) this.drawStructure(struct);
					// if (struct.setup.offset !== 0) offsetCount++;
				});
				// console.log(`${offsetCount} offsets present`);

				/* forbiddenTiles.forEach((forbiddenTile) => {
					const markX = forbiddenTile.x + marginWidth;
					const markY = forbiddenTile.y;
					this.markTile(markX, markY, 5);
				}); */
			}

			// console.log('---');
			resolve();
		});
	}

	/* refreshStructures() {

	} */

	drawStructure(structure: NoteStructure) {
		for (let i = 0; i < structure.blueprint.width; i++) {
			for (let j = 0; j < structure.blueprint.height; j++) {
				const tile = structure.blueprint.get(i, j);
				if (tile === 0) continue;
				const x = (structure.x + structure.xOfs + i);
				const y = structure.y - structure.yOfs - j;
				// Don't replace note blocks with hard blocks
				if (this.overview.getTile(x, y, true) === 1 && tile === 1) continue;
				const isBG = getIsBG(tile);
				if (!isBG) this.overview.setTile(x, y, getLvlTile(tile));
				else this.background.setTile(x, y, getLvlTile(tile));
			}
		}
		for (let i = 0; i < structure.entities.length; i++) {
			const x = (structure.x - structure.xOfs - structure.entityPos[i].x);
			const y = structure.y - structure.yOfs - structure.entityPos[i].y;
			// this.overview.setTile(x, y, structure.entities[i]);
			// if (structure.entityProperties[0].parachute) this.foreground.setTile(x, y, 0);
			const type = entityIdToName(structure.entityType);
			if (!this.entityGrid.isTileOccupied({ x, y })) {
				this.entityGrid.addEntity({
					type,
					pos: { x, y },
					occupiedTiles: [{ x, y }],
					hasParachute: structure.entityProperties[0].parachute,
					hasWings: false,
					isBig: false,
				});
			}
		}
		// this.highlightCollisionBox(structure.collisionBox);
	}

	markTile(x: number, y: number, id = 2) {
		this.foreground.setTile(x, y, id);
	}

	highlightCollisionBox(colBox: CollisionBox) {
		const color = colBox.x % 2;
		for (let i = 0; i < colBox.w; i++) {
			for (let j = 0; j < colBox.h; j++) {
				this.markTile(colBox.x + i, colBox.y - j, color + 3);
			}
		}
	}

	// TODO: Reset chunks
	// eslint-disable-next-line class-methods-use-this
	resetSpatialData(deleteStructs: boolean) {
		if (deleteStructs) globalThis.structures = [];
		globalThis.cells = [];
		globalThis.chunks = [];
		this.entityGrid.clearEntities();
		this.semisolidGrid.clearEntities();
		for (let i = 0; i < numStructChunks; i++) globalThis.chunks[i] = [];
		if (!deleteStructs) {
			globalThis.structures.forEach((thisStruct) => {
				thisStruct.putInChunk();
			});
		}
	}
}

function isVisible(x: number, y: number, xOfs: number, yOfs: number) {
	return (x >= xOfs && x < xOfs + globalThis.levelWidth - 27 && y >= yOfs && y < yOfs + 27);
}

function getLvlTile(n: number) {
	if (n === 0) return 0;
	if (n < 3) return n + MM2Instruments.length + 1; // Building tiles come after all entities
	return 1;
}

function getIsBG(n: number) {
	if (n === 2) return true;
	return false;
}
