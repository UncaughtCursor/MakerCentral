import { EntityType } from '@data/MakerConstants';
import { Coordinates2d } from '../util/Coordinates2d';

export interface MM2GameEntity {
	type: EntityType,
	pos: Coordinates2d,
	occupiedTiles: Coordinates2d[],
	hasWings: boolean,
	hasParachute: boolean,
	isBig: boolean
}
