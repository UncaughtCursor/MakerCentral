const mapSizeLimit = (2 ** 24) - 2;

/**
 * A Map that can hold more than 2^24 entries.
 * Missing some methods compared to the original Map.
 */
export default class BigMap<K, V> {

	private maps: Map<K, V>[];

    /**
     * Creates a new BigMap.
     */
    constructor() {
        this.maps = [new Map<K, V>()];
    }

    /**
     * Determines if the BigMap has an entry for the given key.
	 * @param key The key to check.
	 * @returns True if the entry exists.
     */
    has(key: K) {
        for (let map of this.maps) {
            if (map.has(key)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Gets a value from the map.
	 * @param key The key of the entry.
	 * @returns The value or undefined if it is not present.
     */
    get(key: K): V | undefined {
        for (let map of this.maps) {
            if (map.has(key)) {
                return map.get(key);
            }
        }
        return undefined;
    }
    
	/**
	 * Sets a value.
	 * @param key The key to set the value under.
	 * @param value The value to set.
	 */
    set(key: K, value: V) {
        for (let map of this.maps) {
            if (map.has(key)) {
                map.set(key, value);
            }
        }
        let map = this.maps[this.maps.length - 1];
        if (map.size > mapSizeLimit) {
            map = new Map();
            this.maps.push(map);
        }
        map.set(key, value);
    }

	/**
	 * Clears the BigMap.
	 */
    clear() {
        this.maps.forEach((m) => m.clear());
        this.maps.length = 1;
    }

    /**
	 * Obtains the number of entries in the BigMap.
	 * @returns The number of entries.
	 */
    size(): number {
        return this.maps.reduce((o, map) => (o + map.size), 0);
    }
}