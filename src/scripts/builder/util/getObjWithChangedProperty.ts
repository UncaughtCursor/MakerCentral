/**
 * Returns a shallow copy of an object with a changed property.
 * @param obj The object to copy.
 * @param propertyName The name of the property to change.
 * @param propertyValue The new value of the property.
 * @returns A new copy of the object with the modified property.
 */
export default function getObjWithChangedProperty(
	obj: any, propertyName: string, propertyValue: any,
): any {
	const copy = JSON.parse(JSON.stringify(obj));
	copy[propertyName] = propertyValue;
	return copy;
}
