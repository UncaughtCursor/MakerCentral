/**
 * Reads and parses a JSON file.
 * @param path The path of the JSON file.
 * @returns A Promise with the object from the parsed JSON data.
 */
export default function readJson(path: string): Promise<any> {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.overrideMimeType('text/html');
		request.onreadystatechange = () => {
			if (request.readyState === 4) {
				if (request.status === 200) {
					let response: any;
					try {
						response = JSON.parse(request.responseText);
						resolve(response);
					} catch (err) {
						reject(err);
					}
				} else {
					reject(request.statusText);
				}
			}
		};
		request.open('GET', path, true);
		request.send();
	});
}
