/**
 * Returns the nearest number divisible by the specified divisor.
 * @param n The number to round.
 * @param divisor The divisor to round according to.
 * @returns The rounded number.
 */
export default function roundNumberToNearestDivisibleBy(n: number, divisor: number): number {
	return Math.round(n / divisor) * divisor;
}
