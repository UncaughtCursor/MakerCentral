/* eslint-disable class-methods-use-this */
import Area from '@scripts/builder/optimization/traditional/Area';
import TraditionalLevel from '@scripts/builder/optimization/traditional/TraditionalLevel';
import { SemisolidPlatform } from '../optimization/SemisolidPlatform';
import { levelHeight } from '../optimization/traditional/util';
import { gridDisplayObjectTemplates } from './GridDisplayObjectTemplates';
import { GridDisplayObject, GridDisplayObjectTemplate } from './GridDisplayUtil';
import GridEntityManager from './GridEntityManager';

/**
 * A class used to display track loops.
 */
export default class TraditionalDisplayManager {
	/**
     * Compiles the GridDisplayObjects that comprise the displayed level.
     * @param level The traditional level to display.
     * @returns The created GridDisplayObjects.
     */
	getTileObjects(level: TraditionalLevel): GridDisplayObject[] {
		const objs: GridDisplayObject[] = [];
		objs.push(...getTileObjectsForArea(level.background));
		objs.push(...getSemisolidObjects(level.semisolidGrid));
		objs.push(...getTileObjectsForArea(level.overview));
		// TODO: Draw markers for the foreground instead
		objs.push(...getTileObjectsForArea(level.foreground));
		return objs;
	}
}

/**
 * Compiles the GridDisplayObjects used in an Area.
 * @param area The Area to compile GridDisplayObjects for.
 * @returns The compiled GridDisplayObjects.
 */
function getTileObjectsForArea(area: Area<number>) {
	const objs: GridDisplayObject[] = [];
	let id = 0;

	for (let i = 0; i < area.w; i++) {
		for (let j = 0; j < area.h; j++) {
			const objTemp = getObjectTemplateForTileId(area.getTile(i, j, false));
			if (objTemp !== null) {
				const thisObj: GridDisplayObject = {
					template: objTemp,
					label: 'Tile',
					id,
					pos: { x: i, y: area.h - j - 1 },
					occupiedTiles: [
						{ x: i, y: area.h - j - 1 },
					],
				};
				objs.push(thisObj);
				id++;
			}
		}
	}
	return objs;
}

/**
 * Retrieves the appropriate GridDisplayObjectTemplate for the tile ID.
 * @param id The tile ID or null.
 * @returns The corresponding GridDisplayObjectTemplate,
 * the test object if there is no corresponding template, or null if the input is null.
 */
function getObjectTemplateForTileId(id: number | null): GridDisplayObjectTemplate | null {
	if (id === null) return null;
	switch (id) {
	case 1: {
		return <GridDisplayObjectTemplate> gridDisplayObjectTemplates.get('noteblock');
	}
	case 50: {
		return <GridDisplayObjectTemplate> gridDisplayObjectTemplates.get('block');
	}
	case 51: {
		return <GridDisplayObjectTemplate> gridDisplayObjectTemplates.get('cloud');
	}
	default: {
		return <GridDisplayObjectTemplate> gridDisplayObjectTemplates.get('test');
	}
	}
}

/**
 * Returns a set of semisolid GridDisplayObjects for each semisolid contained in a grid of them.
 * @param semisolidGrid The semisolid grid to create GDOs from.
 * @returns The created GDOs.
 */
function getSemisolidObjects(
	semisolidGrid: GridEntityManager<SemisolidPlatform>,
): GridDisplayObject[] {
	const semisolidTemplate = gridDisplayObjectTemplates.get('semisolid')!;
	return semisolidGrid.entityList.map((semisolid) => ({
		template: semisolidTemplate,
		label: 'Semisolid',
		id: -1,
		pos: { x: semisolid.pos.x - 1, y: levelHeight - semisolid.pos.y - 1 },
		// FIXME: Occupy the full 9 tiles
		occupiedTiles: [
			{ x: semisolid.pos.x - 1, y: levelHeight - semisolid.pos.y - 1 },
		],
	}));
}
