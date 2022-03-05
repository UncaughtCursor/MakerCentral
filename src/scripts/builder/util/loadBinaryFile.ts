/**
 * An async function that loads a binary file from the specified path into a Uint8Array.
 * @param src The path to the binary file.
 * @returns A Promise holding the Uint8Array containing the contents of the binary file.
 */
export default function loadBinaryFile(src: string): Promise<Uint8Array> {
	return new Promise<Uint8Array>((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.open('GET', src, true);
		request.responseType = 'arraybuffer';
		request.onerror = () => reject(new Error(`Unable to load file with source: ${src}`));
		request.onload = () => {
			const arraybuffer = request.response;
			resolve(arraybuffer);
		};
		request.send();
	});
}
