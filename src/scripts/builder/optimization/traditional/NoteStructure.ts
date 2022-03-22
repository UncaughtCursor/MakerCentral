/* eslint-disable require-jsdoc */
import { Coordinates2d } from '@scripts/builder/util/Coordinates2d';
import { marginWidth, noteHeightLimit, Setup } from './AlphaOptimizer';
import Blueprint from './Blueprint';
import { createCell } from './Cell';
import Structure from './Structure';
import {
	getBlueprint, getColBox, getStructTemplate, levelHeight, MM2Instruments, stdBuildRules,
} from './util';

let buildSetups: Setup[] = [];
let levelPushBackLimit = Infinity;

export default class NoteStructure extends Structure {
	hasSemisolid!: boolean;

	setup: Setup;

	entityType: number;

	conflictingStructures: NoteStructure[];

	buildRules: any;

	mergedStructures: NoteStructure[];

	canBeInCell!: boolean;

	blueprint!: Blueprint;

	entityPos!: Coordinates2d[];

	yOfs!: number;

	entityProperties!: {
        parachute: boolean;
    }[];

	hasFall!: boolean;

	hasParachute!: boolean;

	constructor(type: number, x: number, y: number, entityType: number, id: number) {
		super(type, x, y, id);

		// https://stackoverflow.com/questions/54977979/object-assign-with-inheritance-not-working-in-typescript
		Object.assign(this, getStructTemplate(type));

		this.type = type;
		this.efX = x;
		this.x = x;
		this.y = y;

		this.collisionBox.moveTo(this.x + this.xOfs, this.y);
		this.chunkIndex = null;
		this.entities = [];
		this.cell = null;
		this.hasModifiedBlueprint = false;
		this.conflictingStructures = [];
		this.isNote = false;
		this.originalX = this.x;
		this.putInChunk();

		this.updateXFromEfX();
		this.isNote = true;
		this.entityType = entityType;
		this.buildRules = {}; // MM2Instruments[entityType].buildRules;
		Object.assign(this.buildRules, stdBuildRules, MM2Instruments[entityType].buildRules);
		this.mergedStructures = [];
		this.conflictingStructures = [];
		this.setup = buildSetups[0];
		this.hasSemisolid = this.setup.usesSemisolid;
	}

	// TODO: Prevent entities from going off the top or further left than x = 27
	checkCollisionWith(otherStruct: NoteStructure) {
		// Account for cell height gain
		const options: any = {};
		options.thisHeight = this.getEffectiveHeight();
		options.otherHeight = otherStruct.getEffectiveHeight();

		// Get collision distances
		const dists = this.collisionBox.getCollisionDistWith(otherStruct.collisionBox, options);
		if (dists.xdist === 0 && dists.ydist < -1) { // Merge into a cell
			return this.checkCellCollision(otherStruct, true);
		}
		if (dists.xdist === 0 && dists.ydist === -1) {
			return false; // Structures are next to each other, but don't need to be merged
		}
		if (this.x === otherStruct.x && this.y === otherStruct.y && this.canMergeWith(otherStruct)) {
			return this.mergeIntoStruct(otherStruct);
		}
		if (this.x === otherStruct.x && dists.ydist === 0) {
			// Check for double hit exceptions
			if (this.setup.structType !== otherStruct.setup.structType) return false;

			let bottomHeight;
			if (this.y > otherStruct.y) bottomHeight = otherStruct.getEffectiveHeight();
			else bottomHeight = this.getEffectiveHeight();
			if (bottomHeight > 3) return false;
		}

		return this.collisionBox.getCollisionWith(otherStruct.collisionBox, options);
	}

	checkCellCollision(otherStruct: NoteStructure, doAdd: boolean) {
		if (!this.buildRules.canBeInCell || !this.buildRules.canBeInCell) return true;
		// TODO: Allow semisolids in cells
		if (this.hasSemisolid || otherStruct.hasSemisolid) return true;
		/* let tID = this.id;
            let oID = otherStruct.id;
            console.log(tID + ' @ ' + this.collisionBox.x + ' <-> '
			// + oID + ' @ ' + otherStruct.collisionBox.x); */
		const highestPairPoint = Math.max(
			this.collisionBox.y + this.collisionBox.h,
			otherStruct.collisionBox.y + otherStruct.collisionBox.h,
		);
		let highestPoint: number;
		let isAcceptable = true;
		let thisCell = this.cell;
		const otherCell = otherStruct.cell;

		// Make sure all structures can be expanded and put into cells
		let isSameCell;
		if (thisCell === null || otherCell === null) isSameCell = false;
		else isSameCell = (otherCell.id === thisCell.id);
		if (isSameCell) return false;
		if (thisCell !== null) {
			highestPoint = Math.max(highestPairPoint, thisCell.highestPoint);
			if (otherCell !== null) highestPoint = Math.max(highestPoint, otherCell.highestPoint);
			for (let i = 0; i < thisCell.members.length; i++) {
				isAcceptable = isAcceptable
                    && thisCell.members[i].isExtendableUpwardsTo(highestPoint)
                    && thisCell.members[i].canBeInCell;
			}
		}
		if (otherCell !== null && !isSameCell) {
			highestPoint = Math.max(highestPairPoint, otherCell.highestPoint);
			if (thisCell !== null) highestPoint = Math.max(highestPoint, thisCell.highestPoint);
			if (!isSameCell) {
				for (let i = 0; i < otherCell.members.length; i++) {
					isAcceptable = isAcceptable
                        && otherCell.members[i].isExtendableUpwardsTo(highestPoint)
                        && otherCell.members[i].canBeInCell;
				}
			}
		}
		isAcceptable = isAcceptable && this.canBeInCell && otherStruct.canBeInCell;
		if (thisCell === null && otherCell === null) highestPoint = highestPairPoint;
		isAcceptable = isAcceptable && (this.isExtendableUpwardsTo(highestPoint!)
		&& otherStruct.isExtendableUpwardsTo(highestPoint!));

		// Conflict if there is an issue
		if (!isAcceptable) return true;

		// Else, add to the cell
		if (!doAdd) return false;
		if (thisCell === null && otherCell !== null) {
			otherStruct.cell!.add(this);
			thisCell = otherCell;
		} else if (thisCell !== null && otherCell === null) {
			this.cell!.add(otherStruct);
		} else if (thisCell !== null && otherCell !== null && thisCell.id !== otherCell.id) {
			thisCell.mergeWith(otherCell);
			thisCell.add(otherStruct);
		} else if (thisCell === null && otherCell === null) {
			const newCell = createCell();
			newCell.add(this);
			newCell.add(otherStruct);
			thisCell = newCell;
		}

		return false;
	}

	mergeIntoStruct(otherStruct: NoteStructure) {
		// Prevent duplicate merges
		const foundIndex = this.mergedStructures.findIndex((struct) => struct.id === otherStruct.id);
		if (foundIndex !== -1) return false;

		// console.log(`Merge between struct ${this.id} and struct ${otherStruct.id}`);
		const thisTop = this.collisionBox.y + this.collisionBox.h;
		const otherTop = otherStruct.collisionBox.y + otherStruct.collisionBox.h;
		if (thisTop > otherTop) {
			if (otherStruct.isExtendableUpwardsTo(thisTop)) {
				otherStruct.extendUpwardsBy(thisTop - otherTop);
			} else {
				console.log('oof');
				return true;
			}
		} else if (thisTop < otherTop) {
			if (this.isExtendableUpwardsTo(otherTop)) {
				this.extendUpwardsBy(otherTop - thisTop);
			} else {
				console.log('oof');
				return true;
			}
		}

		this.mergedStructures.push(otherStruct);
		otherStruct.mergedStructures.push(this);
		return false;
	}

	unmergeFromStruct(otherStruct: NoteStructure) {
		// console.log(`Unmerge between struct ${this.id} and struct ${otherStruct.id}`);
		let foundIndex = this.mergedStructures.findIndex((struct) => struct.id === otherStruct.id);
		this.mergedStructures.splice(foundIndex, 1);
		foundIndex = otherStruct.mergedStructures.findIndex((struct) => struct.id === this.id);
		otherStruct.mergedStructures.splice(foundIndex, 1);

		// Assumed: This structure's blueprint is getting reset

		// Reset height of the other structure and adapt it to its other members
		otherStruct.changeToType(otherStruct.type);
		let newTop = otherStruct.collisionBox.y + otherStruct.collisionBox.h;
		otherStruct.mergedStructures.forEach((struct) => {
			newTop = Math.max(newTop, struct.collisionBox.y + struct.collisionBox.h);
		});
		otherStruct.extendUpwardsBy(newTop - (otherStruct.collisionBox.y + otherStruct.collisionBox.h));
	}

	trimSide(isRightSide: boolean, numBlocks: number) {
		let x;
		if (isRightSide) x = 2;
		else x = 0;
		for (let i = 0; i < numBlocks; i++) {
			if (1 + i > this.blueprint.height) break;
			this.blueprint.set(x, 1 + i, 0);
		}
	}

	extendUpwardsBy(numBlocks: number, isCopyMode = false) {
		if (numBlocks <= 0) return;
		if (!isCopyMode) {
			for (let i = 0; i < numBlocks; i++) {
				this.shearInsertRow(3, 1, [1, 0, 1]);
			}
		} else {
			for (let i = 0; i < numBlocks; i++) {
				this.insertCopyRow(2, this.blueprint.height - 1);
			}
		}
		this.collisionBox.h += numBlocks;
		this.entityPos[0].y += numBlocks;
		this.yOfs -= numBlocks;
		this.hasModifiedBlueprint = true;
	}

	// Specialized function for note blueprints to splice middle rows at y1, but the sides at y2
	shearInsertRow(y1: number, y2: number, row: number[]) {
		for (let i = 0; i < row.length; i++) {
			if (i === 0 || i === row.length - 1) this.blueprint.grid[i].splice(y2, 0, row[i]);
			else this.blueprint.grid[i].splice(y1, 0, row[i]);
		}
		this.blueprint.height++;
		this.hasModifiedBlueprint = true;
	}

	// [Unused] Specialized function for note blueprints that
	// inserts a copy of the walls of the row at y1 to y2.
	insertCopyRow(y1: number, y2: number) {
		const row = [];
		for (let i = 0; i < this.blueprint.width; i++) {
			// Only clone the walls, empty space otherwise
			if (i !== 0 && i !== this.blueprint.width - 1) row.push(0);
			else row.push(this.blueprint.get(i, y1));
		}
		for (let i = 0; i < row.length; i++) {
			this.blueprint.grid[i].splice(y2, 0, row[i]);
		}
		this.blueprint.height++;
		this.hasModifiedBlueprint = true;
	}

	isExtendableUpwardsTo(yPos: number) {
		// return (Math.abs(yPos - this.collisionBox.y) <= noteHeightLimit);
		if (yPos >= this.collisionBox.y) {
			return yPos - this.collisionBox.y <= noteHeightLimit;
		}
		return this.collisionBox.y - yPos <= noteHeightLimit - 3;
	}

	moveBySetup(setup: Setup) {
		// First, remove all references to collisions with this structure
		this.conflictingStructures.forEach((otherStruct) => {
			const foundIndex = otherStruct.conflictingStructures.findIndex(
				(thisStruct) => (thisStruct.id === this.id),
			);
			otherStruct.conflictingStructures.splice(foundIndex, 1);
		});

		// Remove merged structures
		while (this.mergedStructures.length > 0) {
			this.unmergeFromStruct(this.mergedStructures[0]);
		}

		// Change structure type to the appropriate setup
		this.changeToType(setup.structType);

		// Change semisolid status to that of the setup
		this.hasSemisolid = setup.usesSemisolid;

		// Move structure
		const efXOfs = setup.offset - this.setup.offset;

		this.efX += efXOfs;
		this.updateXFromEfX();
		this.collisionBox.x = this.x;
		this.setup = setup;
		this.conflictingStructures = [];

		// Remove from cell // TODO: Add to new cell
		// TODO: Cells that get merged are not handled properly? (Might not be a necessary fix)
		const curCell = this.cell;
		if (curCell !== null) curCell.removeStructure(this);

		// Update Chunk
		this.updateChunkLocation();
	}

	changeToType(typeNum: number) {
		const template = getStructTemplate(typeNum)!;
		this.blueprint = getBlueprint(typeNum)!;
		const prevLoc = { x: this.collisionBox.x, y: this.collisionBox.y };
		this.collisionBox = getColBox(typeNum)!;
		this.collisionBox.x = prevLoc.x;
		this.collisionBox.y = prevLoc.y;
		this.yOfs = -this.collisionBox.h;
		this.entityProperties = template.entityProperties;
		[this.entityPos[0]] = template.entityPos;
		this.canBeInCell = template.canBeInCell;
		this.hasFall = template.hasFall;
		this.hasParachute = template.hasParachute;
		this.type = typeNum;
	}

	tryAllSetups() {
		// FIXME: Worse performance when 2 block drop cell merge is enabled
		// Try to move a note to all available setups. Return the success,
		// as well as all available nodes to traverse.
		const origSetup = this.setup;
		let availableMoves = [];
		let conflictAmount = Infinity;
		let isForbidden = false; // TODO: Rework forbid system
		for (let i = 0; i < buildSetups.length; i++) {
			if (buildSetups[i].offset === origSetup.offset) continue;
			this.moveBySetup(buildSetups[i]);
			isForbidden = this.isInForbiddenTile();
			this.checkForCollisions();
			if (!this.checkForLegality()) continue;
			const conflicts = this.conflictingStructures;
			conflictAmount = Math.min(conflictAmount, this.conflictingStructures.length);
			if (!isForbidden) availableMoves.push({ setup: buildSetups[i], structs: conflicts });
			if (this.conflictingStructures.length === 0 && !isForbidden) {
				return { success: true, availableMoves: [] };
			}
		}
		availableMoves = availableMoves.filter((move) => move.structs.length === conflictAmount);

		// If unsuccessful...
		this.moveBySetup(origSetup);
		return { success: false, availableMoves, minConflicts: conflictAmount };
	}

	canMergeWith(otherStruct: NoteStructure) {
		// Must be able to parachute stack
		if (!this.buildRules.canParachuteStack
			|| !otherStruct.buildRules.canParachuteStack) return false;

		// Can't be same setup
		if (this.setup.structType === otherStruct.setup.structType) return false;

		// Can't have one be semisolid and the other not
		if (this.hasSemisolid !== otherStruct.hasSemisolid) return false;

		const thisTemplate = getStructTemplate(this.setup.structType)!;
		const otherTemplate = getStructTemplate(otherStruct.setup.structType)!;

		// Anything with a parachute is fine
		if (thisTemplate.entityProperties[0].parachute) return true;
		if (otherTemplate.entityProperties[0].parachute) return true;

		// If they are over 2 blocks apart vertically, that's fine too
		return Math.abs(thisTemplate.entityPos[0].y - otherTemplate.entityPos[0].y) > 2;
	}

	getEffectiveHeight() {
		let cellHeight = 0;
		if (this.cell !== null) {
			cellHeight = this.cell.highestPoint - this.collisionBox.y;
		}
		return Math.max(this.collisionBox.h, cellHeight);
	}

	checkForLegality() {
		let isLegal = true;
		if (this.hasSemisolid) isLegal = isLegal && this.buildRules.canHaveSemisolid;
		if (this.hasFall) {
			isLegal = isLegal
		&& (this.buildRules.canFallNextToWall && this.buildRules.canFreeFall);
		}
		if (this.hasParachute) isLegal = isLegal && this.buildRules.canParachute;
		const thisEntityPos = this.getEntityPos();
		isLegal = isLegal && (thisEntityPos.y < levelHeight);
		isLegal = isLegal && (thisEntityPos.x >= marginWidth - levelPushBackLimit);
		isLegal = isLegal && (thisEntityPos.x < globalThis.levelWidth);
		isLegal = isLegal && (!this.hasSemisolid || this.y >= 2);
		return isLegal;
	}

	updateXFromEfX() { // TODO: New system for this in the future
		// this.x = Math.ceil(this.efX);
		this.x = Math.round(this.efX);

		// Determine if a semisolid needs to be used
		// if (this.efX % 1 !== 0) this.hasSemisolid = true;
		// else this.hasSemisolid = false;
	}

	getEntityPos() {
		const ePos = { x: 0, y: 0 };
		ePos.x = this.x + this.entityPos[0].x + this.xOfs;
		ePos.y = this.y - this.entityPos[0].y - this.yOfs;
		return ePos;
	}
}

export function setNoteStructureData(setups: Setup[], pushBackLimit: number) {
	levelPushBackLimit = pushBackLimit;
	buildSetups = setups;
}
