import fs from 'fs';

/**
 * Prints all elements of a list to the console.
 * @param list The list to print.
 */
export function printList<T>(list: T[]) {
	list.forEach((item) => {
		console.log(item);
	});
}

/**
 * Prints the specified property of all items in a list.
 * @param list The list.
 * @param property The property name.
 */
export function printPropertyInList(list: {[key: string]: any}[], property: string) {
	list.forEach((item) => {
		console.log(item[property]);
	});
}

/**
 * Pauses for the specified amount of time.
 * @param ms The length of the pause in milliseconds.
 * @returns A Promise that revolves when the time is up.
 */
export function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

/**
 * Loads the data contained in a JSON file.
 * @param path The path of the JSON file.
 * @returns The data contained.
 */
export function loadJSON(path: string): any {
	return JSON.parse(fs.readFileSync(path, 'utf8'));
}

/**
 * Saves data in a JSON file.
 * @param path The path of the JSON file.
 * @param data The data to save.
 */
export function saveJSON(path: string, data: any) {
	fs.writeFileSync(path, JSON.stringify(data));
}
