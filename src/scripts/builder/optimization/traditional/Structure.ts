/* eslint-disable require-jsdoc */
import { Coordinates2d } from '@scripts/builder/util/Coordinates2d';
import { blocksPerChunk, marginWidth, numStructChunks } from './AlphaOptimizer';
import Cell from './Cell';
import CollisionBox from './CollisionBox';
import NoteStructure from './NoteStructure';
import { getStructTemplate } from './util';

let forbiddenTiles: Coordinates2d[] = [];

/**
 * A structure made of tiles and entities to be placed in the level somewhere.
 */
export default class Structure {
	type: number;

	efX: number;

	y: number;

	id: number;

	chunkIndex: number | null;

	entities: number[];

	cell: Cell | null;

	hasModifiedBlueprint: boolean;

	conflictingStructures: Structure[];

	isNote: boolean;

	x: number;

	collisionBox!: CollisionBox;

	xOfs!: number;

	originalX: number;

	constructor(type: number, x: number, y: number, id?: number) {
		Object.assign(this, getStructTemplate(type));

		this.type = type;
		this.efX = x;
		this.x = x;
		this.y = y;

		this.collisionBox.moveTo(this.x + this.xOfs, this.y);
		if (id === undefined) this.id = globalThis.structures.length;
		else this.id = id;
		this.chunkIndex = null;
		this.entities = [];
		this.cell = null;
		this.hasModifiedBlueprint = false;
		this.conflictingStructures = [];
		this.isNote = false;
		this.originalX = this.x;
		this.putInChunk();

		globalThis.structures.push(this as unknown as NoteStructure);
	}

	checkForCollisions() {
		this.conflictingStructures = [];
		for (let j = 0; j < 3; j++) {
			if (this.chunkIndex! + j - 1 < 0 || this.chunkIndex! + j - 1 >= numStructChunks) continue;
			for (let k = 0; k < globalThis.chunks[this.chunkIndex! + j - 1].length; k++) {
				const otherStruct = globalThis.chunks[this.chunkIndex! + j - 1][k];
				if (this.id === otherStruct.id) continue;
				if (this.checkCollisionWith(otherStruct)) this.conflictingStructures.push(otherStruct);
			}
		}
	}

	checkCollisionWith(otherStruct: Structure) { // TODO: Multiple collision box support
		return this.collisionBox.getCollisionWith(otherStruct.collisionBox);
	}

	putInChunk() {
		this.chunkIndex = Math.floor(this.x / blocksPerChunk);
		if (this.chunkIndex < 0) this.chunkIndex = 0;
		if (this.chunkIndex > 29) this.chunkIndex = 29;
		globalThis.chunks[this.chunkIndex].push(this as unknown as NoteStructure);
	}

	updateChunkLocation() { // TODO: Generalize for all structures or move to NoteStructure class
		const curChunk = this.chunkIndex!;
		const newChunk = Math.floor(this.x / blocksPerChunk);

		if (newChunk !== curChunk) {
			// Remove a reference to the structure in the current chunk
			const foundIndex = globalThis.chunks[curChunk].findIndex(
				(thisStruct) => (thisStruct.id === this.id),
			);
			globalThis.chunks[curChunk].splice(foundIndex, 1);

			// Add to the new chunk
			this.putInChunk();
		}

		this.originalX = this.x;
	}

	isInForbiddenTile() {
		const thisX = this.x - marginWidth;
		const thisY = this.y;
		for (let j = 0; j < forbiddenTiles.length; j++) {
			if (thisX === forbiddenTiles[j].x && thisY === forbiddenTiles[j].y) {
				return true;
			}
		}
		return false;
	}
}

export function setStructureData(theseStructs: NoteStructure[],
	theseChunks: NoteStructure[][], theseForbiddenTiles: Coordinates2d[]) {
	globalThis.structures = theseStructs;
	globalThis.chunks = theseChunks;
	forbiddenTiles = theseForbiddenTiles;
}
