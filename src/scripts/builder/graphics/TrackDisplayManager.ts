/* eslint-disable class-methods-use-this */
import { MM2GameEntity } from '../optimization/MM2GameEntity';
import { isReflectedPath, Track } from '../tracks/TrackUtil';
import { addCoords, Coordinates2d } from '../util/Coordinates2d';
import hasProperty from '../util/hasProperty';
import { gridDisplayObjectTemplates } from './GridDisplayObjectTemplates';
import { GridDisplayObject, GridDisplayObjectTemplate } from './GridDisplayUtil';

const noteTemplate = gridDisplayObjectTemplates.get('wingedNoteBlock')!;
const upArrowTemplate = gridDisplayObjectTemplates.get('upArrow')!;
const downArrowTemplate = gridDisplayObjectTemplates.get('downArrow')!;
const apparatusTemplate = gridDisplayObjectTemplates.get('trackApparatus')!;

/**
 * A class used to display track loops.
 */
export default class TrackDisplayManager {
	/**
	 * Compiles the GridDisplayObjects that comprise the track layout.
	 * @param tracks The tracks to display.
	 */
	getTrackObjects(tracks: Track[]) {
		const objs: GridDisplayObject[] = [];
		const capTemp = <GridDisplayObjectTemplate> gridDisplayObjectTemplates.get('cap');
		tracks.forEach((trk, id) => {
			// Only create grid display objects for non-air tracks
			if (!hasProperty('spawnedTrackAttachment', trk.template)) {
				const trkObjTemplate = <GridDisplayObjectTemplate> gridDisplayObjectTemplates.get(
					trk.template.name,
				);
				const trkObj = {
					template: trkObjTemplate,
					label: 'Track',
					id,
					pos: trk.pos,
					occupiedTiles: getObjectOccupiedTiles(trk.pos, trkObjTemplate.occupiedTileMap),
				};

				const capObjs: GridDisplayObject[] = [];
				if (trk.hasCaps) {
					for (let i = 0; i < trk.paths.length; i++) {
						const path = trk.paths[i];
						if (isReflectedPath(path)) {
							const capCoords = path.pos;
							capObjs.push({
								template: capTemp,
								label: 'Track Cap',
								id,
								pos: capCoords,
								occupiedTiles: getObjectOccupiedTiles(capCoords, capTemp.occupiedTileMap),
							});
						}
					}
				}

				objs.push(trkObj);
				capObjs.forEach((capObj) => {
					objs.push(capObj);
				});
			}
		});
		return objs;
	}

	/**
	 * Compiles the GridDisplayObjects that comprise the note block layout.
	 * @param notePlacements An array of objects describing the notes to place.
	 * @returns The generated GridDisplayObjects.
	 */
	getNoteObjects(notePlacements: {
		trk: Track;
		nextAttachPointIdx: 0 | 1;
	}[]): GridDisplayObject[] {
		const objs: GridDisplayObject[] = [];

		// 1st Pass: Display note blocks
		notePlacements.forEach((notePlacement) => {
			const trk = notePlacement.trk;
			// Note block GDO
			objs.push({
				template: noteTemplate,
				id: -2,
				label: 'Note',
				pos: { x: trk.pos.x - 1, y: trk.pos.y + 1 },
				occupiedTiles: [{ x: trk.pos.x - 1, y: trk.pos.y + 1 }],
			});
		});

		// 2nd Pass: Display arrows on top of everything
		notePlacements.forEach((notePlacement) => {
			const trk = notePlacement.trk;
			const dir = notePlacement.nextAttachPointIdx === 0 ? 'up' : 'down';

			// Arrow GDO
			const arrowTemplate = dir === 'up' ? upArrowTemplate : downArrowTemplate;
			objs.push({
				template: arrowTemplate,
				id: -2,
				label: 'Note Arrow',
				pos: { x: trk.pos.x - 1, y: trk.pos.y + 1 },
				occupiedTiles: [{ x: trk.pos.x - 1, y: trk.pos.y + 1 }],
			});
		});
		return objs;
	}

	/**
	 * Creates a setup GridDisplayObject for every entity.
	 * @param entities The list of entities placed.
	 * @returns The created GDOs.
	 */
	getApparatusObjects(entities: MM2GameEntity[]): GridDisplayObject[] {
		return entities.map((entity) => ({
			template: apparatusTemplate,
			id: -3,
			label: 'Apparatus',
			pos: { x: entity.pos.x - 1, y: entity.pos.y + 4 },
			occupiedTiles: [{ x: entity.pos.x - 1, y: entity.pos.y + 4 }],
		}));
	}
}

// TODO: Move to utility module
/**
 * Generates a list of occupied tiles from the top left corner point
 * and tile occupation map (true = occupied).
 * @param topLeft The xy coordinates of the top left corner.
 * @param occupiedTileMap The tile occupation map.
 * @returns The list of occupied tiles.
 */
function getObjectOccupiedTiles(topLeft: Coordinates2d, occupiedTileMap: boolean[][]) {
	const occupiedTiles: Coordinates2d[] = [];
	for (let i = 0; i < occupiedTileMap[0].length; i++) {
		for (let j = 0; j < occupiedTileMap.length; j++) {
			if (occupiedTileMap[j][i]) {
				occupiedTiles.push(addCoords(topLeft, { x: i, y: j }));
			}
		}
	}
	return occupiedTiles;
}
