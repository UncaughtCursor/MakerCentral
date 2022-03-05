/**
 * Returns if a property exists in an object.
 * (TypeScript workaround; see https://github.com/microsoft/TypeScript/issues/21732)
 * @param property
 * @param object
 * @returns
 */
export default function hasProperty<K extends string, T extends object>(
	property: K, object: T,
): object is T & Record<K, unknown> {
	return property in object;
}
