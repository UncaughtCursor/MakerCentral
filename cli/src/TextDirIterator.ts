import fs from 'fs';

/**
 * Iterates over the text files in a directory.
 */
export default class TextDirIterator {
	private dir: string;

	private fileNames: string[];

	/**
	 * Creates a new TextDirIterator.
	 * @param dir The path to the directory to read text files from.
	 */
	constructor(dir: string) {
		this.dir = dir;
		this.fileNames = fs.readdirSync(dir);
	}

	/**
	 * Iterates over the text files.
	 * @param cb A callback to be called with the data for every file in the directory.
	 * @param startIndexOrNameArr (Optional) The zero-indexed file index to start at
	 * or an array of file names to iterate over.
	 * It returns a Promise that resolves when the work is done.
	 */
	async iterate(cb: (data: string, i: number, fileName: string) => Promise<void>,
		startIndexOrNameArr: number | string[] = 0): Promise<void> {
		if (Array.isArray(startIndexOrNameArr)) {
			for (let i = 0; i < startIndexOrNameArr.length; i++) {
				const fileName = startIndexOrNameArr[i];
				const data = fs.readFileSync(`${this.dir}/${fileName}`, 'utf8');
				await cb(data, i, fileName);
			}
		} else {
			for (let i = startIndexOrNameArr; i < this.fileNames.length; i++) {
				const fileName = this.fileNames[i];
				const data = fs.readFileSync(`${this.dir}/${fileName}`, 'utf8');
				await cb(data, i, fileName);
			}
		}
	}
}
