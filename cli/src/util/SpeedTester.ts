/**
 * Tests the speed of ongoing operations.
 */
export default class SpeedTester {
	private ticksBeforeCallback: number;

	private callback: (arg0: number, arg1: number, arg2: number) => void;

	private ticks: number;

	private startTime: number;

	/**
	 * Creates a new SpeedTester.
	 * @param ticksBeforeCallback Amount of ticks before the callback is called.
	 * The first parameter is the number of ticks per second.
	 * The second parameter is the number of milliseconds since the last callback.
	 * The third parameter is the total number of ticks.
	 * @param callback The callback function to call.
	 */
	constructor(ticksBeforeCallback: number, callback: (arg0: number,
		arg1: number, arg2: number) => void) {
		this.ticksBeforeCallback = ticksBeforeCallback;
		this.callback = callback;
		this.ticks = 0;
		this.startTime = Date.now();
	}

	/**
	 * Increments the tick counter. If the tick counter reaches
	 * the correct number of ticks, the callback will be called.
	 */
	tick() {
		this.ticks++;

		if (this.ticks >= 0 && this.ticks % this.ticksBeforeCallback === 0) {
			const endTime = Date.now();
			const timeDiff = endTime - this.startTime;
			const ticksPerSecond = (1000 * this.ticksBeforeCallback) / timeDiff;
			this.callback(ticksPerSecond, timeDiff, this.ticks);
			this.startTime = endTime;
		}
	}
}
