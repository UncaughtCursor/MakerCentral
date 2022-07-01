import fs from 'fs';

/**
 * Streams a text file until a certain string is found.
 * @param path The path to the file to stream.
 * @param terminationSequence The string to terminate the stream on.
 * @returns A promise containing the text until the termination sequence
 * or null if the sequence was not found.
 */
export default function streamFileUntil(path: string, terminationSequence: string): Promise<string | null> {
	return new Promise((resolve, reject) => {
		const stream = fs.createReadStream(path, { encoding: 'utf8' });
		let data = '';

		stream.on('data', (chunk) => {
			data += chunk;
			const index = data.indexOf(terminationSequence);
			if (index !== -1) {
				stream.close();
				resolve(data.substring(0, index));
			}
		});

		stream.on('error', (err) => {
			reject(err);
		});

		stream.on('end', () => {
			resolve(null);
		});
	});
}