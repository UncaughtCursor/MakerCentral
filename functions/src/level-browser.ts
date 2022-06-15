import * as functions from 'firebase-functions';
import {
	DBDifficulty, DBGameStyle, DBTag, DBTheme,
} from './data/types/DBTypes';
import {
	MCLevelDocData, MCRawLevelDoc, MCRawUserDoc, MCTag, MCUserDocData,
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
		docVer: 0,
	};
});

export const getUser = functions.https.onCall(async (data: {
	userId: string,
}): Promise<MCUserDocData> => {
	const user = (await db.doc(`users-raw/${data.userId}`).get()).data() as MCRawUserDoc | undefined;
	if (user === undefined) throw new Error(`No user found with ID ${data.userId}`);

	return {
		id: user.code,
		pid: user.pid,
		name: user.name,
		likes: user.likes,
		makerPoints: user.maker_points,
		docVer: 0,
	};
});

/* export const getWorld = functions.https.onCall(async (data: {
	userId: string,
}): Promise<MCSuperWorldDoc> => {
	const user = (await db.doc(`worlds-raw/${data.userId}`).get()).data()
		as MCRawSuperWorldDoc | undefined;
	if (user === undefined) throw new Error(`No user found with ID ${data.userId}`);

	return {
		... TODO
	};
}); */

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
