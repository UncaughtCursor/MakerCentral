/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import { GridDisplayObject } from '@scripts/builder/graphics/GridDisplayUtil';
import React, {
	ReactNode, SyntheticEvent, useEffect, useRef,
} from 'react';
import * as Images from '@scripts/builder/graphics/Images';
import { Coordinates2d, scaleCoords } from '@scripts/builder/util/Coordinates2d';

interface GridDisplayProps {
	widthTiles: number,
	heightTiles: number,
	objects: GridDisplayObject[],
	onTileInspect?: (arg0: Coordinates2d) => void,
	onMouseOut?: () => void,
	backgroundDrawFn?: (arg0: CanvasRenderingContext2D) => void,
	tileLengthPx?: number,
	canvasClassName?: string,
	containerClassName?: string,
	children?: ReactNode,
}

/**
 * Displays a set of predefined images in a grid-based display.
 * @param props The props:
 * * [TODO]
 */
function GridDisplay(props: GridDisplayProps) {
	const widthPx = props.widthTiles * props.tileLengthPx!;
	const heightPx = props.heightTiles * props.tileLengthPx!;

	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const ctx = canvasRef.current!.getContext('2d')!;

		ctx.clearRect(0, 0, widthPx, heightPx);

		props.backgroundDrawFn!(ctx);

		props.objects.forEach((object) => {
			drawDisplayObject(object, ctx);
		});
	});

	const handleMouseEvt = (e: SyntheticEvent<HTMLCanvasElement, MouseEvent>) => {
		const canvasCoords = getMouseEventCanvasCoords(
			e.nativeEvent, e.target as HTMLCanvasElement,
		);
		const rawTileCoords = scaleCoords(canvasCoords, (1 / props.tileLengthPx!));
		const tileCoords = {
			x: Math.floor(rawTileCoords.x),
			y: Math.floor(rawTileCoords.y),
		};
		props.onTileInspect!(tileCoords);
	};

	return (
		<div className={props.containerClassName!}>
			{props.children}
			<canvas
				onClick={handleMouseEvt}
				onMouseMove={handleMouseEvt}
				onMouseOut={props.onMouseOut}
				className={props.canvasClassName!}
				width={widthPx}
				height={heightPx}
				ref={canvasRef}
			/>
		</div>
	);

	/**
	 * Draws a display object on the canvas.
	 * @param object The display object to draw.
	 * @param ctx The canvas 2d rendering context to draw on.
	 */
	function drawDisplayObject(object: GridDisplayObject, ctx: CanvasRenderingContext2D) {
		ctx.drawImage(Images.getImage(object.template.imageName), object.pos.x * props.tileLengthPx!,
			object.pos.y * props.tileLengthPx!);
	}

	/**
	 * Obtains the pixel coordinates of a mouse event on a canvas element.
	 * @param evt The mouse event.
	 * @param canvas The canvas element that the mouse event was on.
	 * @returns The pixel coordinates that the event took place at.
	 */
	function getMouseEventCanvasCoords(evt: MouseEvent, canvas: HTMLCanvasElement): Coordinates2d {
		const boundRect = canvas.getBoundingClientRect();

		// Calculate the ratios of the element's size versus pixel size
		const scaleX = boundRect.width / canvas.width;
		const scaleY = boundRect.height / canvas.height;

		// Divide by those scaling factors to obtain original pixel coordinates
		const x = Math.floor((evt.clientX - boundRect.left) / scaleX);
		const y = Math.floor((evt.clientY - boundRect.top) / scaleY);

		return { x, y };
	}
}

GridDisplay.defaultProps = {
	tileLengthPx: 16,
	canvasClassName: '',
	containerClassName: '',
	backgroundDrawFn: () => {},
	onTileInspect: () => {},
	onMouseOut: () => {},
	children: <></>,
};

export default GridDisplay;
