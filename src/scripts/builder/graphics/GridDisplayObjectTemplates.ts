import { GridDisplayObjectTemplate } from './GridDisplayUtil';

// eslint-disable-next-line import/prefer-default-export
export const gridDisplayObjectTemplates: Map<string, GridDisplayObjectTemplate> = new Map();

gridDisplayObjectTemplates.set('straightH', {
	imageName: 'tracks/straightH',
	occupiedTileMap: [
		[true, true, true],
	],
});

gridDisplayObjectTemplates.set('straightV', {
	imageName: 'tracks/straightV',
	occupiedTileMap: [
		[true],
		[true],
		[true],
	],
});

gridDisplayObjectTemplates.set('diagDU', {
	imageName: 'tracks/diagDU',
	occupiedTileMap: [
		[false, false, true],
		[false, true, false],
		[true, false, false],
	],
});

gridDisplayObjectTemplates.set('diagUD', {
	imageName: 'tracks/diagUD',
	occupiedTileMap: [
		[true, false, false],
		[false, true, false],
		[false, false, true],
	],
});

gridDisplayObjectTemplates.set('curve03', {
	imageName: 'tracks/curve03',
	occupiedTileMap: [
		[true, true, true],
		[false, true, true],
		[false, false, true],
	],
});

gridDisplayObjectTemplates.set('curve36', {
	imageName: 'tracks/curve36',
	occupiedTileMap: [
		[false, false, true],
		[false, true, true],
		[true, true, true],
	],
});

gridDisplayObjectTemplates.set('curve69', {
	imageName: 'tracks/curve69',
	occupiedTileMap: [
		[true, false, false],
		[true, true, false],
		[true, true, true],
	],
});

gridDisplayObjectTemplates.set('curve90', {
	imageName: 'tracks/curve90',
	occupiedTileMap: [
		[true, true, true],
		[true, true, false],
		[true, false, false],
	],
});

gridDisplayObjectTemplates.set('cap', {
	imageName: 'tracks/cap',
	occupiedTileMap: [
		[false],
	],
});

gridDisplayObjectTemplates.set('noteblock', {
	imageName: 'tiles/noteblock',
	occupiedTileMap: [
		[true],
	],
});

gridDisplayObjectTemplates.set('block', {
	imageName: 'tiles/block',
	occupiedTileMap: [
		[true],
	],
});

gridDisplayObjectTemplates.set('cloud', {
	imageName: 'tiles/cloud',
	occupiedTileMap: [
		[true],
	],
});

gridDisplayObjectTemplates.set('info', {
	imageName: 'tiles/info',
	occupiedTileMap: [
		[false],
	],
});

gridDisplayObjectTemplates.set('test', {
	imageName: 'test',
	occupiedTileMap: [
		[false],
	],
});

gridDisplayObjectTemplates.set('semisolid', {
	imageName: 'tiles/semisolid',
	occupiedTileMap: [
		[true, true, true],
		[true, true, true],
		[true, true, true],
	],
});

gridDisplayObjectTemplates.set('wingedNoteBlock', {
	imageName: 'tracks/wingedNoteBlock',
	occupiedTileMap: [
		[false],
	],
});

gridDisplayObjectTemplates.set('upArrow', {
	imageName: 'tracks/upArrow',
	occupiedTileMap: [
		[false],
	],
});

gridDisplayObjectTemplates.set('downArrow', {
	imageName: 'tracks/downArrow',
	occupiedTileMap: [
		[false],
	],
});

gridDisplayObjectTemplates.set('trackApparatus', {
	imageName: 'tracks/trackApparatus',
	occupiedTileMap: [
		[false],
	],
});
