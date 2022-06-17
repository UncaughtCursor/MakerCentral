/* eslint-disable no-underscore-dangle */
import { Readable } from 'stream';
import fs from 'fs';

/**
 * A stream for reading a directory of text files.
 */
export default class TextDirStream extends Readable {
	private dirPath: string;

	private fileNames: string[];

	private fileIndex: number;

	/**
	 * Creates a new TextDirStream.
	 * @param dirPath The path of the directory to read from.
	 */
	constructor(dirPath: string) {
		super({
			encoding: 'utf8',
		});
		this.dirPath = dirPath;
		this.fileNames = fs.readdirSync(dirPath);
		this.fileIndex = 0;
	}

	/**
	 * Reads a new file into the stream.
	 */
	_read(): void {
		if (this.fileIndex < this.fileNames.length) {
			const fileName = `${this.dirPath}/${this.fileNames[this.fileIndex]}`;
			this.push(fs.readFileSync(fileName, 'utf8'));
			this.fileIndex++;
		} else {
			this.push(null);
		}
	}
}
