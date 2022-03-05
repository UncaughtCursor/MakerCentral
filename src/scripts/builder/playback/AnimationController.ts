// eslint-disable-next-line @typescript-eslint/no-unused-vars
let func = (frame: number) => {};
let animRequestId = -1;
let startTime = -1;

// TODO: Add an ending condition function

/**
 * Starts the animation.
 * @param animFunction The function to execute on every frame.
 */
export function startAnimation(animFunction: (frame: number) => void) {
	func = animFunction;
	startTime = Date.now();
	animRequestId = window.requestAnimationFrame(performAnimationStep);
}

/**
 * Stops the animation.
 */
export function stopAnimation() {
	if (animRequestId !== -1) window.cancelAnimationFrame(animRequestId);
}

/**
 * Performs a step in the animation, calling the assigned function on every frame.
 */
function performAnimationStep() {
	const frameCount = Math.floor((Date.now() - startTime) / (50 / 3));
	func(frameCount);
	animRequestId = window.requestAnimationFrame(performAnimationStep);
}
