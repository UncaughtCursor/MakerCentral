import ImageNames from '../../../data/ImageNames.json';

let isLoaded: boolean = false;
const loadedImages: Map<string, HTMLImageElement> = new Map();

/**
 * Retrieves an image from the set of loaded images.
 * @param name The name of the image. In subdirectories, this is "[subdir]/[name]".
 * @returns The loaded image in the form of an HTML image element.
 */
export function getImage(name: string): HTMLImageElement {
	if (!isLoaded) throw (new Error('Images have not been loaded yet!'));
	return loadedImages.get(name)!;
}

/**
 * Loads all images listed in data/ImageNames.json from the img/ directory at the project's root.
 */
export async function loadImages() {
	for (let i = 0; i < ImageNames.length; i++) {
		const imageName = ImageNames[i];
		const loadedImage = await loadImage(`${process.env.PUBLIC_URL}/img/${imageName}.png`);
		loadedImages.set(imageName, loadedImage);
	}
	isLoaded = true;
}

/**
 * Loads a specific image into an HTMLImageElement.
 * @param path The path of the image to be loaded.
 * @returns A promise holding the loaded image in the form of an HTML image element.
 */
function loadImage(path: string): Promise<HTMLImageElement> {
	return new Promise(((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			resolve(img);
		};
		img.onerror = () => {
			console.error(`Failed to load: ${path}`);
			reject(img);
		};
		img.src = path;
	}));
}
