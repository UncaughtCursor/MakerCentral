import { addCoords, Coordinates2d } from '../util/Coordinates2d';
import { Track } from './TrackUtil';

/**
 * A structure used to store Tracks on a grid.
 */
export default class TrackMap {
	readonly width: number;

	readonly height: number;

	private occupancyGrid: Track[][][];

	private trackOccupiedTiles: Map<Track, Coordinates2d[]> = new Map();

	tracks: Track[] = [];

	/**
	 * Builds a TrackMap object.
	 * @param width The width of the area to store tracks in.
	 * @param height The height of the area to store tracks in.
	 */
	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.occupancyGrid = createArray3d(width, height);
	}

	/**
	 * Adds a track to the TrackMap.
	 * @param trk The track to be added.
	 */
	addTrack(trk: Track) {
		const collisionMap = trk.template.collisionMap;
		const occupiedTiles: Coordinates2d[] = [];
		for (let i = 0; i < collisionMap.length; i++) {
			const y = trk.pos.y + i;
			for (let j = 0; j < collisionMap[i].length; j++) {
				const x = trk.pos.x + j;
				// Ignore out-of-bounds entries
				if (x < 0 || x >= this.width || y < 0 || y >= this.height) continue;
				occupiedTiles.push({ x, y });
				if (collisionMap[i][j]) this.occupancyGrid[x][y].push(trk);
			}
		}
		this.trackOccupiedTiles.set(trk, occupiedTiles);
		this.tracks.push(trk);
	}

	/**
	 * Deletes a track from the TrackMap.
	 * @param trk The track to delete.
	 */
	deleteTrack(trk: Track) {
		const occupiedTiles = this.trackOccupiedTiles.get(trk)!;
		occupiedTiles.forEach((tileCoords) => {
			const entries = this.occupancyGrid[tileCoords.x][tileCoords.y];
			this.occupancyGrid[tileCoords.x][tileCoords.y] = entries.filter(
				(gridTrack) => gridTrack !== trk,
			);
		});
		this.tracks = this.tracks.filter((listTrk) => listTrk !== trk);
		this.trackOccupiedTiles.delete(trk);
	}

	/**
	 * Returns all tracks that occupy the specified tile.
	 * @param coords The coordinates to check.
	 * @returns The tracks that occupy the tile at the specified coordinates.
	 */
	getTracksAtTile(coords: Coordinates2d) {
		if (coords.x < 0 || coords.x >= this.width
			|| coords.y < 0 || coords.y >= this.height) return [];
		return this.occupancyGrid[coords.x][coords.y];
	}

	/**
	 * Determines if the specified tile is occupied by at least one track.
	 * @param coords The coordinates to check.
	 * @returns Whether or not a Track occupies the tile.
	 */
	isOccupied(coords: Coordinates2d) {
		return this.getTracksAtTile(coords).length > 0;
	}

	/**
	 * Retrieves the number of tracks in the TrackMap.
	 * @returns The number of tracks.
	 */
	getNumTracks() {
		return this.tracks.length;
	}

	/**
	 * Retrieves a Track from the track list at the specified index.
	 * @param index The index to retrieve from.
	 * @returns The retrieved track.
	 */
	getTrackAtIndex(index: number) {
		return this.tracks[index];
	}

	/**
	 * Retrieves the last track added to the TrackMap.
	 * @returns The last track.
	 */
	getLastTrack() {
		return this.tracks[this.tracks.length - 1];
	}

	/**
	 * Copies the contents of another TrackMap to this one at the specified position.
	 * The tracks' previous positions will be overwritten.
	 * @param otherMap The map to copy from.
	 * @param pos The position to copy to.
	 */
	copyOtherMapTo(otherMap: TrackMap, pos: Coordinates2d) {
		for (let i = 0; i < otherMap.getNumTracks(); i++) {
			const thisTrack = otherMap.getTrackAtIndex(i);
			thisTrack.pos = addCoords(pos, thisTrack.pos);
			thisTrack.paths.forEach((path) => {
				// eslint-disable-next-line no-param-reassign
				path.pos = addCoords(pos, path.pos);
			});
			this.addTrack(thisTrack);
		}
	}
}

/**
 * Creates an empty 3D array of a specified width and height.
 * @param width The width of the array.
 * @param height The height of the array.
 * @returns The created 3D array.
 */
function createArray3d(width: number, height: number): any[][][] {
	const arr: any[][][] = [];
	for (let i = 0; i < width; i++) {
		arr[i] = [];
		for (let j = 0; j < height; j++) {
			arr[i][j] = [];
		}
	}
	return arr;
}
