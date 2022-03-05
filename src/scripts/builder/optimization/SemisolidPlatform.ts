import { Coordinates2d } from '../util/Coordinates2d';

export interface SemisolidPlatform {
	pos: Coordinates2d,
	occupiedTiles: Coordinates2d[],
}
