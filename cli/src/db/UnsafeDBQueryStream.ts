/* eslint-disable no-underscore-dangle */
import { Readable } from 'stream';
import { escape } from 'html-escaper';
import { db } from './DBInterfacer';

/**
 * An object that puts the results of a query into a CSV read stream.
 * Columns are delimited with the < character and strings are HTML-escaped.
 * UNSAFE: This stream is faster, but does not have any way of handling backpressure.
 * This may cause out-of-memory errors with large queries.
 */
export default class UnsafeDBQueryStream extends Readable {
	private query: string;

	private resultsRead: number;

	private readStarted: boolean;

	private fieldNames: string[];

	private rowsBeforePush: number;

	private pushQueue: string;

	private pushQueueLength: number;

	/**
	 * Creates a new UnsafeDBQueryStream.
	 * @param query The SQL query to execute.
	 * @param rowsBeforePush The number of rows to collect before pushing to the stream.
	 * Default 100.
	 */
	constructor(query: string, rowsBeforePush: number = 100) {
		super();
		this.query = query;
		this.resultsRead = 0;
		this.readStarted = false;
		this.fieldNames = [];
		this.rowsBeforePush = rowsBeforePush;
		this.pushQueue = '';
		this.pushQueueLength = 0;
	}

	/**
	 * Begins streaming readable data.
	 */
	_read() {
		if (this.readStarted) return;
		this.readStarted = true;

		db.each(this.query, (err, res) => {
			if (err) console.error(err);

			if (this.fieldNames.length === 0) {
				this.fieldNames = Object.keys(res);
				this.addToPushQueue(`${this.fieldNames.join('<')}\n`);
			}

			const row: string[] = this.fieldNames.reduce((arr, key) => {
				const fieldValue = res[key];
				return arr.concat(escape(`${fieldValue}`));
			}, [] as string[]);

			this.addToPushQueue(`${row.join('<')}\n`);
			this.resultsRead++;
		}, (err) => {
			if (err) console.error(err);
			this.emptyPushQueue();

			console.log('Stream done');
			console.log(`${this.resultsRead} rows processed`);
			this.push(null);
		});
	}

	/**
	 * Queues a row for data pushing.
	 * @param rowStr The row.
	 */
	private addToPushQueue(rowStr: string) {
		this.pushQueue += rowStr;
		this.pushQueueLength++;

		if (this.pushQueueLength >= this.rowsBeforePush) this.emptyPushQueue();
	}

	/**
	 * Empties the row queue by pushing all of the data.
	 */
	private emptyPushQueue() {
		console.log(this.pushQueueLength);
		if (this.pushQueueLength > 0) {
			this.push(this.pushQueue, 'utf8');
			console.log('pushed');
		}
		this.pushQueue = '';
		this.pushQueueLength = 0;
	}
}
