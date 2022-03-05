/**
 * Converts an object to a map, using the object's property names as string keys.
 * @param data The data to convert to a map.
 * @returns The map.
 */
export default function objToMap(data: any) {
	const map: Map<string, any> = new Map();
	const keys: string[] = Object.keys(data);
	keys.forEach((key) => {
		map.set(key, data[key]);
	});
	return map;
}
