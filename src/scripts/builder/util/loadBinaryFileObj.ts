/**
 * Async function that loads a file from a File object.
 * @param file The file object.
 * @returns A Uint8Array containing the binary data.
 */
export default async function loadBinaryFileObj(file: File): Promise<Uint8Array> {
	return new Promise<Uint8Array>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as ArrayBuffer;
			resolve(new Uint8Array(result));
		};
		reader.onerror = (err) => {
			reject(err);
		};

		reader.readAsArrayBuffer(file);
	});
}
