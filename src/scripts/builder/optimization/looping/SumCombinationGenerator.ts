/**
 * A class that takes a list of factors to generate
 * combinations of them for a given sum that has the minimum weight.
 */
export default class SumCombinationGenerator {
	private readonly factors: number[];

	private sumCombinations!: number[][][];

	private availableTotals!: number[]

	/**
	 * Creates a new SumCombinationGenerator from a list of factors.
	 * @param factors The list of factors to initialize the SumCombinationGenerator with.
	 * @param cacheLimit The value to pre-calculate solutions up to.
	 */
	constructor(factors: number[], cacheLimit: number) {
		this.factors = factors;
		this.cacheResultsTo(cacheLimit);
	}

	/**
	 * Retrieves the combinations of sums for the given number.
	 * @param n A number to retrieve the combinations for.
	 * @returns The combinations for the given number or null if there are no combinations.
	 * Returns an empty array for zero.
	 */
	getCombinations(n: number): number[][] {
		return this.sumCombinations[n];
	}

	/**
	 * Retrieves all the combinations of sums calculated.
	 * @returns The combinations.
	 */
	getAllCombinations(): number[][][] {
		return this.sumCombinations;
	}

	/**
	 * Returns a list of numbers that have solutions.
	 * @returns The list of numbers that have solutions.
	 */
	getAvailableTotals() {
		return this.availableTotals;
	}

	/**
	 * Generates all combinations of sums up to the given number.
	 * @param n The number to pre-calculate the combinations up to.
	 */
	cacheResultsTo(n: number) {
		// Initialize solutions
		this.sumCombinations = [];
		this.availableTotals = [];
		for (let i = 0; i < (n + 1); i++) {
			this.sumCombinations[i] = [];
		}

		// Fill in trivial combinations for factors' entries
		this.factors.forEach((factor, i) => {
			this.sumCombinations[factor] = [new Array(this.factors.length).fill(0)];
			this.sumCombinations[factor][0][i] = 1;
		});

		// Calculate all solutions from 1 up through n except for the factors
		for (let i = 1; i < (n + 1); i++) {
			if (this.factors.findIndex((factor) => factor === i) !== -1) continue;
			this.sumCombinations[i] = this.generateCombinations(i);
		}

		// Push indices of non-empty entries to the availableTotals array
		for (let i = 0; i < this.sumCombinations.length; i++) {
			if (this.sumCombinations[i].length > 0) this.availableTotals.push(i);
		}
	}

	/**
	 * A function that finds all sets of multiples of the provided factors that adds up
	 * to the given sum.
	 * @param n The sum to find combinations for.
	 * @returns The combinations of the provided factors or null if no combination is found.
	 */
	private generateCombinations(n: number) {
		const combinations: number[][] = [];
		for (let i = 0; i < this.factors.length; i++) {
			const thisFactor = this.factors[i];
			const lesserNumber = n - thisFactor;
			const thisCombinationSet = this.sumCombinations[lesserNumber];
			if (thisCombinationSet !== null && thisCombinationSet !== undefined) {
				appendCombinations(combinations, thisCombinationSet, i);
			}
		}
		return eliminateDuplicateNumberArrays(combinations);
	}
}

/**
 * Eliminates duplicate numerical arrays within another array.
 * @param arr The array to eliminate duplicates from.
 * @returns A new array with the duplicates removed.
 */
function eliminateDuplicateNumberArrays(arr: number[][]) {
	// Convert the array of arrays into a set of strings, eliminating dupes
	const stringSet = new Set(arr.map((subArr) => JSON.stringify(subArr)));
	// Convert the set of strings back into an array of arrays and return it
	return Array.from(stringSet, (str) => JSON.parse(str));
}

/**
 * Appends a set of combinations onto the provided array of existing combinations,
 * adding 1 to the appended combinations at the specified index.
 * @param array The array to append combinations onto.
 * @param append The array containing the combinations to be appended.
 * @param idx The index of the appended combinations to increment.
 */
function appendCombinations(arr: number[][], append: number[][], idx: number) {
	for (let i = 0; i < append.length; i++) {
		const entry = cloneNumberArray(append[i]);
		entry[idx]++;
		arr.push(entry);
	}
}

/**
 * Clones an array of numbers.
 * @param arr The array to clone.
 * @returns The cloned array.
 */
function cloneNumberArray(arr: number[]) {
	const newArr: number[] = [];
	for (let i = 0; i < arr.length; i++) {
		newArr[i] = arr[i];
	}
	return newArr;
}
