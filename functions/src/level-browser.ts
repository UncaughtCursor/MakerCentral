import * as functions from 'firebase-functions';
import {
	DBDifficulty, DBGameStyle, DBTag, DBTheme,
} from './data/types/DBTypes';
import {
	MCDifficulties,
	MCDifficulty,
	MCGameStyle,
	MCGameStyles,
	MCLevelDocData, MCRawLevelDoc, MCRawUserDoc, MCTag,
	MCTheme, MCThemes, MCUserDocData, MCWorldDocData, MCWorldLevelPreview, MCWorldPreview,
} from './data/types/MCBrowserTypes';
import { db } from '.';

export const getLevel = functions.https.onCall(async (data: {
	levelId: string,
}): Promise<MCLevelDocData> => {
	const level = (await db.doc(`levels-raw/${data.levelId}`).get()).data() as MCRawLevelDoc | undefined;
	if (level === undefined) throw new Error(`No level found with ID ${data.levelId}`);

	const difficulty = DBDifficulty[level.difficulty] as keyof typeof DBDifficulty;
	const gameStyle = DBGameStyle[level.gamestyle] as keyof typeof DBGameStyle;
	const theme = DBTheme[level.theme] as keyof typeof DBTheme;
	const tags: MCTag[] = (() => {
		const tagsArr: MCTag[] = [];

		if (level.tag1 !== DBTag.None) tagsArr.push(convertDBTagToMC(level.tag1)!);
		if (level.tag2 !== DBTag.None && level.tag2 !== level.tag1) {
			tagsArr.push(convertDBTagToMC(level.tag2)!);
		}

		return tagsArr;
	})();

	return {
		id: level.course_id,
		uploadTime: level.uploaded * 1000,
		name: level.name,
		addedTime: -1,
		makerName: level.uploader.name,
		makerId: level.uploader.makerId,
		difficulty: difficulty !== 'Super expert' ? difficulty : 'Super Expert',
		clearRate: level.clear_rate / 100,
		gameStyle,
		theme: theme !== 'Ghost House' ? theme : 'Ghost house',
		numLikes: level.likes,
		numPlays: level.unique_players_and_versus,
		likeToPlayRatio: level.likes / level.unique_players_and_versus,
		numComments: level.num_comments,
		description: level.description,
		tags,
		isPromotedByPatron: false,
	};
});

export const getUser = functions.https.onCall(async (data: {
	userId: string,
}): Promise<MCUserDocData> => {
	const user = (await db.doc(`users-raw/${data.userId}`).get()).data() as MCRawUserDoc | undefined;
	if (user === undefined) throw new Error(`No user found with ID ${data.userId}`);

	const world: MCWorldPreview | null = user.super_world !== null ? {
		numLevels: user.super_world.levels,
		numWorlds: user.super_world.worlds,
		avgPlays: user.super_world.aggregated_properties.avg_plays,
		avgLikes: user.super_world.aggregated_properties.avg_likes,
	} : null;

	return {
		id: user.code,
		name: user.name,
		likes: user.likes,
		makerPoints: user.maker_points,
		world,
	};
});

export const getWorld = functions.https.onCall(async (data: {
	userId: string,
}): Promise<MCWorldDocData | null> => {
	const user = (await db.doc(`users-raw/${data.userId}`).get()).data() as MCRawUserDoc | undefined;
	if (user === undefined) throw new Error(`No user found with ID ${data.userId}`);

	const world = user.super_world;
	if (world === null) return null;

	const worldLevels: MCWorldLevelPreview[] = world.level_info.map((levelInfo) => ({
		id: levelInfo.course_id,
		name: levelInfo.name,
		numPlays: levelInfo.plays,
		numLikes: levelInfo.likes,
	}));

	return {
		makerId: user.code,
		numLevels: world.levels,
		numWorlds: world.worlds,
		levels: worldLevels,
		created: world.created,
		avgUploadTime: world.aggregated_properties.avg_upload_time,
		avgClearRate: world.aggregated_properties.avg_clear_rate,
		avgDifficulty: DBProportionToMCProportion<DBDifficulty, MCDifficulty>(
			world.aggregated_properties.avg_difficulty,
			(val) => MCDifficulties[val],
		),
		avgGameStyle: DBProportionToMCProportion<DBGameStyle, MCGameStyle>(
			world.aggregated_properties.avg_gamestyle,
			(val) => MCGameStyles[val],
		),
		avgTheme: DBProportionToMCProportion<DBTheme, MCTheme>(
			world.aggregated_properties.avg_theme,
			(val) => MCThemes[val],
		),
		avgTags: DBProportionToMCProportion<DBTag, MCTag>(
			world.aggregated_properties.avg_tags,
			(val) => convertDBTagToMC(val),
		),
		avgLikes: world.aggregated_properties.avg_likes,
		avgPlays: world.aggregated_properties.avg_plays,
		avgLikeToPlayRatio: world.aggregated_properties.avg_like_to_play_ratio,
		isPromotedByPatron: false,
	};
});

/**
 * Converts a level tag from the database to a level tag for MakerCentral.
 * @param tag The level tag from the database.
 * @returns The MakerCentral tag.
 */
function convertDBTagToMC(tag: DBTag): MCTag | null {
	const tagStr = DBTag[tag];
	switch (tagStr) {
	case 'Art': return 'Pixel Art';
	case 'Auto mario': return 'Auto';
	case 'Autoscroll': return 'Autoscroll';
	case 'Boss battle': return 'Boss Fight';
	case 'Link': return 'Link';
	case 'Multiplayer versus': return 'Multiplayer';
	case 'Music': return 'Music';
	case 'None': return null;
	case 'Puzzle solving': return 'Puzzle';
	case 'Shooter': return 'Shooter';
	case 'Short and sweet': return 'Short';
	case 'Single player': return 'One Player Only';
	case 'Speedrun': return 'Speedrun';
	case 'Standard': return 'Standard';
	case 'Technical': return 'Technical';
	case 'Themed': return 'Themed';
	default: return null;
	}
}

/**
 * Converts a DB proportion to a MC proportion.
 * @param DBObj The proportion to convert.
 * @param converter The function to convert each DB type to the MC type.
 * If it returns null, the key will be excluded from the result.
 * @returns The MC proportion.
 */
function DBProportionToMCProportion<DBType extends number, MCType extends string>(
	DBObj: {[key in DBType]: number},
	converter: (num: DBType) => MCType | null,
): {[key in MCType]: number} {
	const newObj: {[key in MCType]: number} = {} as any;
	Object.keys(DBObj).forEach((key) => {
		const num = parseInt(key, 10) as DBType;
		const MCKey = converter(num);
		if (MCKey !== null) newObj[MCKey] = DBObj[num];
	});
	return newObj;
}
