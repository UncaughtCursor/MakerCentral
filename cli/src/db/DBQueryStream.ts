/* eslint-disable no-underscore-dangle */
import { Readable } from 'stream';
import { escape } from 'html-escaper';
import { getDB } from './DBInterfacer';

/**
 * An object that puts the results of a query into a CSV read stream.
 * Columns are delimited with the < character and strings are HTML-escaped.
 */
export default class DBQueryStream extends Readable {
	private query: string;

	private fieldNames: string[];

	private chunkSize: number;

	private chunksProcessed: number;

	/**
	 * Creates a new DBQueryStream.
	 * @param query The SQL query to execute. Must not have LIMIT or OFFSET keywords.
	 * @param chunkSize The number of rows to collect before pushing to the stream.
	 * Default 10000.
	 */
	constructor(query: string, chunkSize: number = 10000) {
		super();
		this.query = query;
		this.fieldNames = [];
		this.chunkSize = chunkSize;
		this.chunksProcessed = 0;
	}

	/**
	 * Begins streaming readable data.
	 */
	_read() {
		const thisSql = `${this.query} LIMIT ${this.chunkSize + 1} OFFSET ${this.chunksProcessed * this.chunkSize}`;
		getDB().all(thisSql, (err: Error | null, res: any[]) => {
			if (err) console.error(err);

			if (this.fieldNames.length === 0) {
				this.fieldNames = Object.keys(res[0]);
				this.push(`${this.fieldNames.join('<')}\n`);
			}

			const rowsStr = res.slice(0, this.chunkSize).reduce((str, rowRaw) => {
				const row: string[] = this.fieldNames.reduce((arr, key) => {
					const fieldValue = rowRaw[key];
					return arr.concat(escape(`${fieldValue}`));
				}, [] as string[]);
				return `${str}${row.join('<')}\n`;
			}, '');
			this.chunksProcessed++;

			this.push(rowsStr);

			if (res.length < this.chunkSize + 1) {
				console.log('Stream done');
				this.push(null);
			}
		});
	}
}
