/**
 * Creates a surface-level copy of a 1D array.
 * @param arr The array to be copied.
 * @returns A copy of the array.
 */
export default function copyArray1d(arr: any[]) {
	const newArr: any[] = [];
	arr.forEach((element) => {
		newArr.push(element);
	});
	return newArr;
}
