import { TrackOptimizationResult } from '@scripts/builder/optimization/looping/DeltaOptimizer';
import { TraditionalOptimizationResult } from '@scripts/builder/optimization/traditional/AlphaOptimizer';
import React, { useContext, useState } from 'react';
import * as Images from '@scripts/builder/graphics/Images';
import { GridDisplayObject } from '@scripts/builder/graphics/GridDisplayUtil';
import TrackDisplayManager from '@scripts/builder/graphics/TrackDisplayManager';
import TraditionalDisplayManager from '@scripts/builder/graphics/TraditionalDisplayManager';
import { Coordinates2d } from '@scripts/builder/util/Coordinates2d';
import { levelHeight } from '@scripts/builder/optimization/traditional/util';
import GridDisplay from './GridDisplay';
import EditorContext from '../../EditorContext';
import GridDisplayMessage, { GridDisplayMessageData } from './GridDisplayMessage';
import MM2GridEntityDisplay from './MM2GameEntityDisplay';
import MarginDisplay from './MarginDisplay';

const widthTiles = 240;
const heightTiles = 27;
const tileLengthPx = 16;

interface LevelDisplayState {
	selectedTile: Coordinates2d | null,
}

/**
 * Displays a MM2 optimization result on a level grid.
 * @param props The props:
 * * optResult: The latest result generated by an MM2 optimizer.
 */
function LevelDisplay() {
	// TODO: Entity display using DOM shapes and letters, DOM composite tile icon,
	// DOM grid message system showing tooltips
	// Save GDMessages in optimization results

	const [state, setState] = useState({
		selectedTile: null,
	} as LevelDisplayState);
	const ctx = useContext(EditorContext);
	const buildInst = ctx.project.buildInstances[0];

	const msgMap = new Map<string, GridDisplayMessageData>();
	const entities = buildInst.optResult!.entityGrid.entityList;
	entities.forEach((entity) => {
		if (!entity.isBig) {
			const text = entity.hasParachute ? `${entity.type} (Parachuting)` : entity.type;
			msgMap.set(JSON.stringify({ x: entity.pos.x, y: levelHeight - entity.pos.y - 1 }), {
				text,
			});
		} else {
			// Put multiple message boxes for big enemies
			const text = entity.hasParachute ? `Big ${entity.type} (Parachuting)` : `Big ${entity.type}`;
			for (let i = 0; i < 4; i++) {
				const xOfs = i % 2;
				const yOfs = i <= 1 ? 0 : 1;
				msgMap.set(JSON.stringify({
					x: entity.pos.x + xOfs,
					y: levelHeight - (entity.pos.y - yOfs) - 1,
				}), {
					text,
				});
			}
		}
	});
	if (buildInst.optResult !== null) {
		if (buildInst.optResult.type === 'traditional') {
			const semisolids = (buildInst.optResult as TraditionalOptimizationResult)
				.level.semisolidGrid.entityList;
			semisolids.forEach((semisolid) => {
				const text = 'Note block in front of semisolid platform\'s top layer';
				msgMap.set(JSON.stringify({ x: semisolid.pos.x, y: levelHeight - semisolid.pos.y - 1 }), {
					text,
				});
			});
		}
	}

	return (
		<>
			<GridDisplay
				widthTiles={widthTiles}
				heightTiles={heightTiles}
				objects={getResultDisplayObjs()}
				onTileInspect={(tileCoords: Coordinates2d) => {
					setState({
						...state,
						selectedTile: tileCoords,
					});
				}}
				onMouseOut={() => {
					setState({
						...state,
						selectedTile: null,
					});
				}}
				backgroundDrawFn={renderBackground}
				canvasClassName="level-display-canvas"
				containerClassName="level-display-container"
			>
				<GridDisplayMessage
					messageMap={msgMap}
					selectedTile={state.selectedTile}
				/>
				<MarginDisplay />
				{/* FIXME: Add entities to track optimizer */}
				<MM2GridEntityDisplay
					entityGrid={buildInst.optResult!.entityGrid}
				/>
			</GridDisplay>
			<br />
		</>
	);

	/**
	 * Generates and displays GridDisplayObjects for the last optimization result.
	 */
	function getResultDisplayObjs(): GridDisplayObject[] {
		switch (buildInst.buildMode) {
		case 'looping': {
			const res = buildInst.optResult as TrackOptimizationResult;
			const trkDisplay = new TrackDisplayManager();

			const tracks = [];
			for (let i = 0; i < res!.trkMap.getNumTracks(); i++) {
				tracks.push(res!.trkMap.getTrackAtIndex(i));
			}

			const objs: GridDisplayObject[] = [];
			objs.push(...trkDisplay.getApparatusObjects(res!.entityGrid.entityList));
			objs.push(...trkDisplay.getTrackObjects(tracks));
			objs.push(...trkDisplay.getNoteObjects(res!.notePlacements));

			return objs;
		}
		case 'traditional': {
			const res = buildInst.optResult as TraditionalOptimizationResult;
			const objs: GridDisplayObject[] = [];

			const tileDisplay = new TraditionalDisplayManager();
			objs.push(...tileDisplay.getTileObjects(res.level));

			return objs;
		}
		default: {
			return [];
		}
		}
	}

	/**
	 * Draws the background on the display canvas.
	 * @param renderCtx The rendering context to draw on.
	 */
	function renderBackground(renderCtx: CanvasRenderingContext2D) {
		const fillWidth = widthTiles * tileLengthPx;
		const fillHeight = heightTiles * tileLengthPx;

		const pattern = renderCtx.createPattern(Images.getImage('bg/horizontal'), 'repeat-x')!;

		// eslint-disable-next-line no-param-reassign
		renderCtx.fillStyle = pattern;
		renderCtx.fillRect(0, 0, fillWidth, fillHeight);
	}
}

export default LevelDisplay;
