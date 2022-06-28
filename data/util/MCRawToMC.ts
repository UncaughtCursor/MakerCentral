/* eslint-disable import/prefer-default-export */
import {
	DBDifficulty, DBGameStyle, DBTag, DBTheme,
} from '../types/DBTypes';
import {
	MCDifficulties, MCDifficulty, MCGameStyle, MCGameStyles,
	MCLevelDocData, MCTag, MCTheme, MCThemes, MCUserDocData,
	MCWorldDocData, MCWorldLevelPreview, MCWorldPreview,
} from '../types/MCBrowserTypes';
import {
	MCRawLevelDoc, MCRawUserDoc, MCRawWorldLevelPreview,
} from '../types/MCRawTypes';

/**
 * Converts a raw MakerCentral level document to a client-side level document.
 * @param rawLevelDoc The raw level document.
 * @returns The client-side level document.
 */
export function MCRawLevelDocToMCLevelDoc(level: MCRawLevelDoc): MCLevelDocData {
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
}

/**
 * Converts a raw MakerCentral user document to a client-side user document.
 * @param user The raw user document.
 * @returns The client-side user document.
 */
export function MCRawUserDocToMCUserDoc(user: MCRawUserDoc): MCUserDocData {
	// Convert tag proportions to MC tag proportions.
	const MCTagProportions: {[key in MCTag]: number} | null = user.super_world !== null
		? DBProportionToMCProportion(
			user.super_world.aggregated_properties.avg_tags,
			(val) => convertDBTagToMC(val),
		)
		: null;

	// Extract into an array every tag with a proportion greater than 20%.
	const prominentTags: MCTag[] = MCTagProportions !== null
		? (Object.keys(MCTagProportions) as MCTag[])
			.filter((tag: MCTag) => MCTagProportions[tag] >= 0.15)
		: [];

	const world: MCWorldPreview | null = user.super_world !== null ? {
		numLevels: user.super_world.levels,
		numWorlds: user.super_world.worlds,
		avgPlays: user.super_world.aggregated_properties.avg_plays,
		avgLikes: user.super_world.aggregated_properties.avg_likes,
		avgClearRate: user.super_world.aggregated_properties.avg_clear_rate,
		prominentTags,
		showcasedLevelIds: getShowcasedLevelIds(user.super_world.level_info),
	} : null;

	return {
		id: user.code,
		name: user.name,
		likes: user.likes,
		levels: user.uploaded_levels,
		makerPoints: user.maker_points,
		world,
	};
}

/**
 * Converts a raw MakerCentral user document to a client-side world document.
 * @param user The raw user document.
 * @returns The client-side world document or null if the user has no world.
 */
export function MCRawUserToMCWorldDoc(user: MCRawUserDoc): MCWorldDocData | null {
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
		makerName: user.name,
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
}

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

/**
 * Gets the IDs of the top 4 most popular levels in a world.
 * @param level_info The level previews of the world.
 */
function getShowcasedLevelIds(level_info: MCRawWorldLevelPreview[]): string[] {
	const sortedLevels = level_info.sort((a, b) => b.likes - a.likes);
	return sortedLevels.slice(0, 4).map((level) => level.course_id);
}
