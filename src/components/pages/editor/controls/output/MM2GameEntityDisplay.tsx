import { EntityData } from '@data/MakerConstants';
import GridEntityManager from '@scripts/builder/graphics/GridEntityManager';
import { MM2GameEntity } from '@scripts/builder/optimization/MM2GameEntity';
import { levelHeight } from '@scripts/builder/optimization/traditional/util';
import React, { ReactElement } from 'react';

/**
 * Displays entities on a grid using DOM elements.
 * @param props The props:
 * * entityGrid: The grid of entities to display.
 */
function MM2GridEntityDisplay(props: {
	entityGrid: GridEntityManager<MM2GameEntity>,
}) {
	const gridEntityElements = getGridEntityElements();
	return (
		<div className="game-entity-container">
			{gridEntityElements}
		</div>
	);

	/**
	 * Obtains the elements to be displayed on the level grid to represent entities.
	 */
	function getGridEntityElements() {
		const elements: ReactElement[] = [];
		props.entityGrid.entityList.forEach((entity) => {
			const color = EntityData[entity.type].color;
			const initials = getEntityNameInitials(EntityData[entity.type].name);
			const pxSize = !entity.isBig ? '14px' : '30px';
			elements.push(
				<div
					className={`game-entity-icon${entity.hasParachute ? ' parachuting' : ''}`}
					style={{
						top: `${(levelHeight - entity.pos.y - 1) * 16}px`,
						left: `${entity.pos.x * 16}px`,
						width: pxSize,
						height: pxSize,
						backgroundColor: color,
						fontSize: entity.isBig ? '32px' : '16px',
						lineHeight: entity.isBig ? '28px' : '13px',
					}}
					key={`${entity.type}-${entity.pos.x}-${entity.pos.y}`}
				>
					<p>{initials}</p>
				</div>,
			);
		});
		return elements;
	}
}

/**
 * Obtains the initials of an entity name. It is two characters long at most.
 */
function getEntityNameInitials(name: string) {
	let initials = '';
	for (let i = 0; i < name.length; i++) {
		const chr = name.charAt(i);
		if (/[A-Z]/.test(chr)) {
			// Only use capital letters as part of initials
			initials = `${initials}${chr}`;
		}
		// Exit if the initials are 1 or more characters long
		// TODO: Support 2 character long initials
		if (initials.length >= 1) return initials;
	}
	return initials;
}

export default MM2GridEntityDisplay;
