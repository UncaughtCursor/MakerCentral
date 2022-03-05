import { Coordinates2d } from '../util/Coordinates2d';

export interface GridDisplayObjectTemplate {
	imageName: string,
	occupiedTileMap: boolean[][]
}

export interface GridDisplayObject {
	template: GridDisplayObjectTemplate,
	label: string,
	id: number,
	pos: Coordinates2d,
	occupiedTiles: Coordinates2d[]
}
