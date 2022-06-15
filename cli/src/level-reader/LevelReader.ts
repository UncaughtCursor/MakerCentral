/* eslint-disable no-control-regex */
import fs from 'fs';
import path from 'path';
import { encryption } from 'partrick';
import zlib from 'zlib';
import {
	LevelFileArea, AutoscrollSpeed, AutoscrollType, BoundaryType,
	ClearCondition, ClearConditionCategory, ClearPipe, ClearPipeNode,
	LevelDataGameStyle, GameVersion, GenericNode, GenericNodeGroupObject, Ground,
	Icicle, LevelFileData, LevelObject, LiquidMode, LiquidSpeed, ObjectID, Orientation,
	SnakeBlock, SnakeBlockNode, Sound, Theme, Track,
} from '../../../data/LevelDataTypes';
import { downloadLevelData } from '../APIInterfacer';

/**
 * Given a course ID, returns the level's internal course data.
 * @param code The course ID.
 * @returns A promise containing the level data.
 */
export async function parseLevelDataFromCode(code: string): Promise<LevelFileData> {
	const fileName = `tmp/${code}.bcd`;
	await downloadLevelData(code, fileName);
	return parseLevelFromBCDFile(fileName);
}

/**
 * Given a BCD (binary course data) file path,
 * create a ZCD (zipped course data) file in the same directory with the same name.
 * This compresses the data significantly.
 * @param inFilePath The path of the input file.
 */
export function createZCDLevelFileFromBCD(inFilePath: string) {
	const baseName = path.basename(inFilePath, '.bcd');
	const dir = path.dirname(inFilePath);
	const outFilePath = `${dir}/${baseName}.zcd`;

	const encrypted = fs.readFileSync(inFilePath);
	const decrypted = encryption.decryptCourse(encrypted) as Buffer;
	const compressed = zlib.deflateRawSync(decrypted, { level: 9 });
	fs.createWriteStream(outFilePath).write(compressed);
}

/**
 * Given a ZCD (zipped course data) file, return the underlying level data.
 * @param fileName The path of the ZCD file.
 * @returns The parsed data.
 */
export function parseLevelFromZCDFile(fileName: string): LevelFileData {
	const compressed = fs.readFileSync(fileName);
	const decompressed = zlib.inflateRawSync(compressed);
	return parseLevelBuffer(decompressed);
}

/**
 * Given a Buffer of level data from the database, return the underlying level data.
 * @param data The level data.
 * @returns The parsed data.
 */
export function parseLevelFromDBBuffer(data: Buffer): LevelFileData {
	const decompressed = zlib.inflateSync(data);
	return parseLevelBuffer(decompressed);
}

/**
 * Given a BCD (binary course data) file, return the underlying level data.
 * @param fileName The path of the BCD file.
 * @returns The parsed data.
 */
export function parseLevelFromBCDFile(fileName: string): LevelFileData {
	const encrypted = fs.readFileSync(fileName);
	const decrypted = encryption.decryptCourse(encrypted) as Buffer;
	return parseLevelBuffer(decrypted);
}

let filePos = 0;

/**
 * Given the buffer of a decrypted course data binary, parse the level data.
 * @param buffer The buffer containing the data.
 * @returns The parsed level data.
 */
export function parseLevelBuffer(buffer: Buffer): LevelFileData {
	filePos = 0;

	const level: LevelFileData = {
		startY: readLE(buffer, 'uint8'),
		goalY: readLE(buffer, 'uint8'),
		goalX: readLE(buffer, 'int16'),
		timer: readLE(buffer, 'int16'),
		clearConditionMagnitude: readLE(buffer, 'int16'),
		year: readLE(buffer, 'int16'),
		month: readLE(buffer, 'int8'),
		day: readLE(buffer, 'int8'),
		hour: readLE(buffer, 'int8'),
		minute: readLE(buffer, 'int8'),
		autoscroll: AutoscrollSpeed[readLE(buffer, 'uint8')] as keyof typeof AutoscrollSpeed,
		clearConditionCategory: ClearConditionCategory[readLE(buffer, 'uint8')] as keyof typeof ClearConditionCategory,
		clearCondition: ClearCondition[readLE(buffer, 'int32')] as keyof typeof ClearCondition,
		unkGameVersion: readLE(buffer, 'int32'),
		unkManagementFlags: readLE(buffer, 'int32'),
		clearAttempts: readLE(buffer, 'int32'),
		clearTime: readLE(buffer, 'int32'),
		creationId: readLE(buffer, 'uint32'),
		unkUploadId: readLEBig(buffer, 'int64'),
		gameVersion: GameVersion[readLE(buffer, 'int32')] as keyof typeof GameVersion,
		unk1: skipLE(189),
		gameStyle: LevelDataGameStyle[readLE(buffer, 'int16')] as keyof typeof LevelDataGameStyle,
		unk2: readLE(buffer, 'uint8'),
		name: readUTF16LE(buffer, 66).replace(/\u0000+/g, ''),
		description: readUTF16LE(buffer, 202).replace(/\u0000+/g, ''),
		overworld: readArea(buffer),
		subworld: readArea(buffer),
	};
	return level;
}

function readArea(buffer: Buffer): LevelFileArea {
	const header = {
		theme: Theme[readLE(buffer, 'uint8')] as keyof typeof Theme,
		autoscrollType: AutoscrollType[readLE(buffer, 'uint8')] as keyof typeof AutoscrollType,
		boundaryType: BoundaryType[readLE(buffer, 'uint8')] as keyof typeof BoundaryType,
		orientation: Orientation[readLE(buffer, 'uint8')] as keyof typeof Orientation,
		liquidEndHeight: readLE(buffer, 'uint8'),
		liquidMode: LiquidMode[readLE(buffer, 'uint8')] as keyof typeof LiquidMode,
		liquidSpeed: LiquidSpeed[readLE(buffer, 'uint8')] as keyof typeof LiquidSpeed,
		liquidStartHeight: readLE(buffer, 'uint8'),
		boundaryRight: readLE(buffer, 'int32'),
		boundaryTop: readLE(buffer, 'int32'),
		boundaryLeft: readLE(buffer, 'int32'),
		boundaryBottom: readLE(buffer, 'int32'),
		unkFlag: readLE(buffer, 'int32'),
		objectCount: readLE(buffer, 'int32'),
		soundEffectCount: readLE(buffer, 'int32'),
		snakeBlockCount: readLE(buffer, 'int32'),
		clearPipeCount: readLE(buffer, 'int32'),
		piranhaCreeperCount: readLE(buffer, 'int32'),
		exclamationMarkBlockCount: readLE(buffer, 'int32'),
		trackBlockCount: readLE(buffer, 'int32'),
		unk1: readLE(buffer, 'int32'),
		groundCount: readLE(buffer, 'int32'),
		trackCount: readLE(buffer, 'int32'),
		icicleCount: readLE(buffer, 'int32'),
	};

	const area = {
		...header,
		objects: readObjects(buffer, header.objectCount),
		sounds: readSounds(buffer, header.soundEffectCount),
		snakes: readSnakeBlocks(buffer, header.snakeBlockCount),
		clearPipes: readClearPipes(buffer, header.clearPipeCount),
		piranhaCreepers: readGenericNodeGroupObject(buffer, 20, header.piranhaCreeperCount),
		exclamationBlocks: readGenericNodeGroupObject(buffer, 10, header.exclamationMarkBlockCount),
		trackBlocks: readGenericNodeGroupObject(buffer, 10, header.trackBlockCount),
		ground: readGround(buffer, header.groundCount),
		tracks: readTracks(buffer, header.trackCount),
		icicles: readIcicles(buffer, header.icicleCount),
	};

	skipLE(3516);

	return area;
}

function readObjects(buffer: Buffer, numObjects: number): LevelObject[] {
	const objectsLength = 2600;
	const objects: LevelObject[] = [];

	for (let i = 0; i < objectsLength; i++) {
		objects.push({
			x: readLE(buffer, 'int32'),
			y: readLE(buffer, 'int32'),
			unk1: readLE(buffer, 'int16'),
			width: readLE(buffer, 'uint8'),
			height: readLE(buffer, 'uint8'),
			flags: readLE(buffer, 'int32'),
			cflags: readLE(buffer, 'int32'),
			ex: readLE(buffer, 'int32'),
			objId: ObjectID[readLE(buffer, 'int16')] as keyof typeof ObjectID,
			cid: readLE(buffer, 'int16'),
			lid: readLE(buffer, 'int16'),
			sid: readLE(buffer, 'int16'),
		});
	}

	return objects.slice(0, numObjects);
}

function readSounds(buffer: Buffer, numSounds: number): Sound[] {
	const soundsLength = 300;
	const sounds: Sound[] = [];

	for (let i = 0; i < soundsLength; i++) {
		sounds.push({
			id: readLE(buffer, 'uint8'),
			x: readLE(buffer, 'uint8'),
			y: readLE(buffer, 'uint8'),
			unk1: readLE(buffer, 'uint8'),
		});
	}

	return sounds.slice(0, numSounds);
}

function readSnakeBlocks(buffer: Buffer, numSnakeBlocks: number) {
	const snakeBlocksLength = 5;
	const snakeBlocks: SnakeBlock[] = [];

	for (let i = 0; i < snakeBlocksLength; i++) {
		const index = readLE(buffer, 'uint8');
		const nodeCount = readLE(buffer, 'uint8');
		const unk1 = readLE(buffer, 'uint16');
		const nodes = readSnakeBlockNodes(buffer, nodeCount);

		snakeBlocks.push({
			index,
			nodeCount,
			unk1,
			nodes,
		});
	}

	return snakeBlocks.slice(0, numSnakeBlocks);
}

function readSnakeBlockNodes(buffer: Buffer, numNodes: number): SnakeBlockNode[] {
	const nodesLength = 120;
	const nodes: SnakeBlockNode[] = [];

	for (let i = 0; i < nodesLength; i++) {
		nodes.push({
			index: readLE(buffer, 'uint16'),
			direction: readLE(buffer, 'uint16'),
			unk1: readLE(buffer, 'uint32'),
		});
	}

	return nodes.slice(0, numNodes);
}

function readClearPipes(buffer: Buffer, numPipes: number) {
	const clearPipesLength = 200;
	const clearPipes: ClearPipe[] = [];

	for (let i = 0; i < clearPipesLength; i++) {
		const index = readLE(buffer, 'uint8');
		const nodeCount = readLE(buffer, 'uint8');
		const unk1 = readLE(buffer, 'uint16');
		const nodes = readClearPipeNodes(buffer, nodeCount);

		clearPipes.push({
			index,
			nodeCount,
			unk1,
			nodes,
		});
	}

	return clearPipes.slice(0, numPipes);
}

function readClearPipeNodes(buffer: Buffer, numNodes: number) {
	const nodesLength = 36;
	const nodes: ClearPipeNode[] = [];

	for (let i = 0; i < nodesLength; i++) {
		nodes.push({
			type: readLE(buffer, 'uint8'),
			index: readLE(buffer, 'uint8'),
			x: readLE(buffer, 'uint8'),
			y: readLE(buffer, 'uint8'),
			width: readLE(buffer, 'uint8'),
			height: readLE(buffer, 'uint8'),
			unk1: readLE(buffer, 'uint8'),
			direction: readLE(buffer, 'uint8'),
		});
	}

	return nodes.slice(0, numNodes);
}

function readGenericNodeGroupObject(buffer: Buffer, nodesLength: number, numObjects: number): GenericNodeGroupObject[] {
	const objectsLength = 10; // Only for the objects currently covered
	const objects: GenericNodeGroupObject[] = [];

	for (let i = 0; i < objectsLength; i++) {
		const unk1 = readLE(buffer, 'uint8');
		const index = readLE(buffer, 'uint8');
		const nodeCount = readLE(buffer, 'uint8');
		const unk2 = readLE(buffer, 'uint8');
		const nodes = readGenericNodes(buffer, nodesLength, nodeCount);

		objects.push({
			unk1,
			index,
			nodeCount,
			unk2,
			nodes,
		});
	}

	return objects.slice(0, numObjects);
}

function readGenericNodes(buffer: Buffer, nodesLength: number, numNodes: number): GenericNode[] {
	const nodes: GenericNode[] = [];

	for (let i = 0; i < nodesLength; i++) {
		nodes.push({
			unk1: readLE(buffer, 'uint8'),
			direction: readLE(buffer, 'uint8'),
			unk2: readLE(buffer, 'uint16'),
		});
	}

	return nodes.slice(0, numNodes);
}

function readGround(buffer: Buffer, numGround: number): Ground[] {
	const groundLength = 4000;
	const ground: Ground[] = [];

	for (let i = 0; i < groundLength; i++) {
		ground.push({
			x: readLE(buffer, 'uint8'),
			y: readLE(buffer, 'uint8'),
			id: readLE(buffer, 'uint8'),
			backgroundId: readLE(buffer, 'uint8'),
		});
	}

	return ground.slice(0, numGround);
}

function readTracks(buffer: Buffer, numTracks: number): Track[] {
	const tracksLength = 1500;
	const tracks: Track[] = [];

	for (let i = 0; i < tracksLength; i++) {
		tracks.push({
			unk1: readLE(buffer, 'uint16'),
			flags: readLE(buffer, 'uint8'),
			x: readLE(buffer, 'uint8'),
			y: readLE(buffer, 'uint8'),
			type: readLE(buffer, 'uint8'),
			lid: readLE(buffer, 'uint16'),
			unk2: readLE(buffer, 'uint16'),
			unk3: readLE(buffer, 'uint16'),
		});
	}

	return tracks.slice(0, numTracks);
}

function readIcicles(buffer: Buffer, numIcicles: number): Icicle[] {
	const icicleCount = 300;
	const icicles: Icicle[] = [];

	for (let i = 0; i < icicleCount; i++) {
		icicles.push({
			x: readLE(buffer, 'uint8'),
			y: readLE(buffer, 'uint8'),
			type: readLE(buffer, 'uint8'),
			unk1: readLE(buffer, 'uint8'),
		});
	}

	return icicles.slice(0, numIcicles);
}

type ReadLETypes = 'uint8' | 'int8' | 'uint16' | 'int16' | 'uint32' | 'int32';
type ReadLEBigTypes = 'uint64' | 'int64';

function readLE(buffer: Buffer, type: ReadLETypes): number {
	const numBytes = (() => {
		switch (type) {
		case 'int8':
		case 'uint8':
			return 1;
		case 'int16':
		case 'uint16':
			return 2;
		case 'int32':
		case 'uint32':
			return 4;
		}
	})();

	const value = (() => {
		switch (type) {
		case 'int8':
			return buffer.readInt8(filePos);
		case 'uint8':
			return buffer.readUInt8(filePos);
		case 'int16':
			return buffer.readInt16LE(filePos);
		case 'uint16':
			return buffer.readUint16LE(filePos);
		case 'int32':
			return buffer.readInt32LE(filePos);
		case 'uint32':
			return buffer.readUInt32LE(filePos);
		default:
			return 0;
		}
	})();

	filePos += numBytes;

	return value;
}

function readLEBig(buffer: Buffer, type: ReadLEBigTypes): bigint {
	const numBytes = 8;

	const value = (() => {
		switch (type) {
		case 'int64':
			return buffer.readBigInt64LE(filePos);
		case 'uint64':
			return buffer.readBigUInt64LE(filePos);
		default:
			return BigInt(0);
		}
	})();

	filePos += numBytes;

	return value;
}

function readUTF16LE(buffer: Buffer, numBytes: number): string {
	const value = buffer.toString('utf16le', filePos, filePos + numBytes);

	filePos += numBytes;

	return value;
}

function skipLE(numBytes: number): number {
	filePos += numBytes;

	return 0;
}
