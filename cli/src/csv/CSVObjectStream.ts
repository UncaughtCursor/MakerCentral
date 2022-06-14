/* eslint-disable no-underscore-dangle */
import { Readable } from 'stream';
import fs from 'fs';
import { unescape } from 'html-escaper';

export type ColumnFormat = {[key: string]: 'string' | 'int' | 'real'};

export type CSVObjectRow = {[key: string]: string | number};

/**
 * A stream for reading a CSV file. Returns stringified JSON for each row in the table.
 * Columns are delimited with the < character, rows are delimited with newlines,
 * a header with column titles is present, and strings are HTML-escaped.
 */
export default class CSVObjectStream extends Readable {
	private path: string;

	private readStarted: boolean;

	private fileReadStream: fs.ReadStream | null;

	private columnNames: string[] | null;

	private columnFormat: ColumnFormat;

	private buffer: string;

	/**
	 * Creates a new CSVObjectStream.
	 * @param path The path of the CSV file to read.
	 * @param columnFormat An object holding the name and type of every column.
	 */
	constructor(path: string, columnFormat: ColumnFormat) {
		super({
			encoding: 'utf8',
		});
		this.path = path;
		this.readStarted = false;
		this.fileReadStream = null;
		this.columnNames = null;
		this.columnFormat = columnFormat;
		this.buffer = '';
	}

	/**
	 * Reads rows of the CSV table as objects.
	 */
	_read() {
		if (this.readStarted) return;
		this.readStarted = true;

		this.fileReadStream = fs.createReadStream(this.path, {
			encoding: 'utf8',
		});
		this.fileReadStream.on('data', (chunk) => {
			this.buffer += chunk;
			const rowObjs = this.getRowObjects();
			rowObjs.forEach((rowObj) => {
				this.push(JSON.stringify(rowObj));
			});
		});
		this.fileReadStream.on('end', () => {
			const rowObjs = this.getRowObjects(true);
			rowObjs.forEach((rowObj) => {
				this.push(JSON.stringify(rowObj));
			});
			console.log('Stream done');
			this.push(null);
		});
	}

	/**
	 * Generates row objects based on a string holding a CSV file chunk.
	 * @param eof Whether or not the end of the file has been reached.
	 * @returns The generated objects.
	 */
	getRowObjects(eof?: boolean): CSVObjectRow[] {
		const rows: CSVObjectRow[] = [];

		// This check prevents rows from being processed prematurely
		const match = this.buffer.match(/\n+/g);
		const numNewlines = match === null ? 0 : match.length;
		if (numNewlines > 1 || eof) {
			const lastNewlinePos = this.buffer.lastIndexOf('\n');
			const lastValidRowPos = lastNewlinePos !== -1 ? lastNewlinePos : this.buffer.length;
			const str = !eof ? this.buffer.substring(0, lastValidRowPos + 1) : this.buffer;
			this.buffer = !eof ? this.buffer.substring(lastValidRowPos + 1) : '';

			const rowStrings = str.split('\n');

			rowStrings.forEach((rowStr) => {
				if (rowStr.length === 0) return;

				const columnStrings = rowStr.split('<');
				const parseHeader = this.columnNames === null;
				if (this.columnNames === null) this.columnNames = [];

				const row: CSVObjectRow = {};

				columnStrings.forEach((rawColStr, i) => {
					const colStr = unescape(rawColStr.replace('\r', ''));
					if (parseHeader) {
					this.columnNames!.push(colStr);
					} else {
						const columnName = this.columnNames![i];
						const val = (() => {
							switch (this.columnFormat[columnName]) {
							case 'int': return parseInt(colStr, 10);
							case 'real': return parseFloat(colStr);
							case 'string': return colStr;
							default: return colStr;
							}
						})();
						row[columnName] = val;
					}
				});
				if (!parseHeader) rows.push(row);
			});
		}

		return rows;
	}
}
