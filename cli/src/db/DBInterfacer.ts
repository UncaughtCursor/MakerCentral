/* eslint-disable no-loop-func */
import { Database } from 'sqlite3';
import { DBLevel, DBUser } from './DBTypes';

export const dbPath = 'E:/decompressed/dump.db';
export const db = new Database(dbPath);

const minDataId = 3000000;

export interface DBLevelIterationOptions {
	limit?: number;
	importantOnly?: boolean;
	batchSize?: number;
	onBatchDone?: (...args: any[]) => Promise<void>,
	offset?: number;
	onAllDone?: (...args: any[]) => any,
}

const defaultDBLevelIterationOptions: DBLevelIterationOptions = {
	batchSize: 100,
	limit: Infinity,
	importantOnly: false,
	onBatchDone: () => new Promise((resolve) => { resolve(); }),
	offset: 0,
	onAllDone: () => {},
};

export interface DBUserIterationOptions {
	batchSize?: number;
	onBatchDone?: (...args: any[]) => Promise<void>,
	onAllDone?: (...args: any[]) => any,
}

const defaultDBUserIterationOptions: DBUserIterationOptions = {
	batchSize: 100000,
	onBatchDone: () => new Promise((resolve) => { resolve(); }),
	onAllDone: () => {},
};

/**
 * Executes a function for each level in the database, utilizing batching.
 * @param fn The function to execute,
 * taking the level data and current iteration number as parameters.
 * @param options (Optional) The options.
 * - batchSize: The size of the number of levels to process at once.
 * - limit: The number of levels to iterate through.
 * - importantOnly: Whether or not to only iterate through
 * levels with 25 likes or more.
 * - onBatchDone: A function to execute after a batch is finished processing.
 * The callbacks will pause until this function's promise has resolved.
 * - offset: The number of batches already done.
 * - onAllDone: A function to execute after all levels are finished processing.
 */
export async function forEachLevel(
	fn: (level: DBLevel, i: number) => Promise<void>,
	options?: DBLevelIterationOptions,
) {
	const usedOptions = { ...defaultDBLevelIterationOptions };
	if (options !== undefined) Object.assign(usedOptions, options);

	const numBatches = usedOptions.limit! !== undefined
		? usedOptions.limit / usedOptions.batchSize!
		: Infinity;

	let numLevelsProcessed = usedOptions.offset! * usedOptions.batchSize!;
	let numBatchesDone = usedOptions.offset!;
	let lastNumResults = Infinity;
	let maxDataIdSeen = minDataId;

	while (numBatchesDone < numBatches && lastNumResults === usedOptions.batchSize!) {
		const sql = `SELECT * FROM level
		${usedOptions.importantOnly ? 'WHERE likes>=25 AND ' : 'WHERE '}
		data_id>${maxDataIdSeen - 1000}
		LIMIT ${usedOptions.batchSize!}`;
		console.log(sql);

		const levels = await (() => new Promise<DBLevel[]>((resolve) => {
			console.log('Querying...');
			console.log(`Min Data ID = ${maxDataIdSeen - 1000}`);
			db.all(sql, (err, res) => {
				if (err) console.error(err);
				console.log('Query ended...');
				resolve(res as DBLevel[]);
			});
		}))();

		numLevelsProcessed += levels.length;
		numBatchesDone++;
		lastNumResults = levels.length;

		console.log('Processing batch...');
		for (let j = 0; j < levels.length; j++) {
			if (j % 10 === 0) console.log(`Item ${j} / ${levels.length} in batch`);
			maxDataIdSeen = Math.max(maxDataIdSeen, levels[j].data_id);
			await fn(levels[j], numLevelsProcessed - levels.length + j);
		}

		await usedOptions.onBatchDone!();
	}

	usedOptions.onAllDone!();
}

/**
 * Executes a function for each user in the database, utilizing batching.
 * @param fn The function to execute,
 * taking the level data and current iteration number as parameters.
 * @param options (Optional) The options.
 * - batchSize: The size of the batches.
 * - onBatchDone: A function to execute after a batch of users are finished processing.
 * - onAllDone: A function to execute after all users are finished processing.
 */
export async function forEachUser(
	fn: (user: DBUser, i: number) => Promise<void>,
	options?: DBUserIterationOptions,
) {
	const usedOptions = { ...defaultDBUserIterationOptions };
	if (options !== undefined) Object.assign(usedOptions, options);

	let numUsersProcessed = 0;
	let numBatchesDone = 0;
	let lastNumResults = Infinity;

	while (lastNumResults === usedOptions.batchSize!) {
		const sql = `SELECT * FROM user
		LIMIT ${usedOptions.batchSize!}
		OFFSET ${numBatchesDone * usedOptions.batchSize!}`;
		console.log(sql);

		const users = await (() => new Promise<DBUser[]>((resolve) => {
			console.log('Querying...');
			db.all(sql, (err, res) => {
				if (err) console.error(err);
				console.log('Query ended...');
				resolve(res as DBUser[]);
			});
		}))();

		numUsersProcessed += users.length;
		lastNumResults = users.length;
		numBatchesDone++;

		console.log(users.length);

		console.log('Processing batch...');

		for (let j = 0; j < users.length; j++) {
			await fn(users[j], numUsersProcessed - users.length + j);
		}

		await usedOptions.onBatchDone!();
	}

	usedOptions.onAllDone!();
}
