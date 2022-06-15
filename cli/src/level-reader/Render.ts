import path from 'path';
import savePixels from 'save-pixels';
import ndarray, { NdArray } from 'ndarray';
import fs from 'fs';
import {
	LevelFileArea, Ground, LevelFileData, LevelObject, ObjectID,
} from '../../../data/LevelDataTypes';
import { getObjectColor } from './RenderData';

interface Coordinates2D {
  x: number;
  y: number;
}

type PixelGrid = NdArray;

const tileWidthPx = 16;

/**
 * Renders a level with the object IDs as pixel values.
 * @param level The level to render.
 * @returns A 3D NdArray of the rendering.
 */
export function renderLevelIDs(level: LevelFileData): NdArray[] {
	const overworld = renderAreaIDs(level.overworld);
	const subworld = renderAreaIDs(level.subworld);

	return [overworld, subworld];
}

/**
 * Renders an area with the object IDs as pixel values.
 * @param area The area to render.
 * @returns A 3D NdArray of the rendering.
 */
function renderAreaIDs(area: LevelFileArea): NdArray {
	const gridSize = {
		x: area.boundaryRight / tileWidthPx,
		y: area.boundaryTop / tileWidthPx,
	};
	const pixelValues = getNewImageGrid(gridSize.x, gridSize.y);

	plotGround(area.ground, pixelValues);
	plotObjects(area.objects, pixelValues);

	return pixelValues;
}

export function renderLevel(level: LevelFileData, filePath: string) {
	const basename = path.basename(filePath, '.png');
	const dir = path.dirname(filePath);
	renderArea(level.overworld, `${dir}/${basename}-overworld.png`);
	renderArea(level.subworld, `${dir}/${basename}-subworld.png`);
}

function renderArea(area: LevelFileArea, filePath: string) {
	const gridSize = {
		x: area.boundaryRight / tileWidthPx,
		y: area.boundaryTop / tileWidthPx,
	};
	const pixelValues = getNewImageGrid(gridSize.x, gridSize.y);

	plotGround(area.ground, pixelValues);
	plotObjects(area.objects, pixelValues);

	savePixels(pixelValues, 'png').pipe(fs.createWriteStream(filePath));
}

function plotGround(ground: Ground[], grid: PixelGrid, plotID?: boolean) {
	const groundColor = [127, 127, 127];

	ground.forEach((groundTile) => {
		const properGroundCoords = {
			x: groundTile.x,
			y: (groundTile.y + 1) % grid.shape[1],
		};
		setColorOnGrid(
			grid,
			properGroundCoords,
			!plotID ? groundColor : new Array(3).fill(ObjectID.Ground),
		);
	});
}

function plotObjects(objects: LevelObject[], grid: PixelGrid, plotID?: boolean) {
	objects.forEach((obj) => {
		const coords = {
			x: obj.x / 160 - 0.5,
			y: obj.y / 160 - 0.5,
		};
		const color = getObjectColor(obj.objId);
		if (color !== null) {
			drawRectOnGrid(
				grid,
				obj.width,
				obj.height,
				coords,
				!plotID ? color : new Array(3).fill(obj.objId),
			);
		}
	});
}

function getNewImageGrid(widthPx: number, heightPx: number): PixelGrid {
	const grid = ndarray(new Array(widthPx * heightPx * 3).fill(0), [
		widthPx,
		heightPx,
		3,
	]);
	return grid;
}

function drawRectOnGrid(
	grid: NdArray,
	width: number,
	height: number,
	bottomLeftCoords: Coordinates2D,
	color: number[],
) {
	for (let i = 0; i < width; i++) {
		for (let j = 0; j < height; j++) {
			const pos = {
				x: bottomLeftCoords.x + i,
				y: bottomLeftCoords.y + j,
			};
			setColorOnGrid(grid, pos, color);
		}
	}
}

function setColorOnGrid(grid: NdArray, coords: Coordinates2D, color: number[]) {
	color.forEach((channelVal, i) => {
		grid.set(coords.x, grid.shape[1] - coords.y, i, channelVal);
	});
}
