import { storage } from "./FirebaseUtil";
import fs from "fs";
import path from "path";

/**
 * Downloads the contents of a directory from the Firebase Storage bucket to a local directory.
 * @param storageDirPath The path to the directory in the Firebase Storage bucket. 
 * @param localDirPath The path to the local directory to download the contents to.
 */
export async function downloadStorageDir(storageDirPath: string, localDirPath: string) {
	const bucket = storage.bucket();
	const delimiter = '/';
	const prefix = `${storageDirPath}${delimiter}`;

	const [files] = await bucket.getFiles({
		delimiter,
		prefix,
	});

	fs.mkdirSync(localDirPath, { recursive: true });

	for (const file of files) {
		const maxTries = 30;
		const baseName = path.basename(file.name);
		console.log(`Downloading ${baseName}...`);
		for (let i = 0; i < maxTries; i++) {
			try {
				await file.download({
					destination: `${localDirPath}/${baseName}`,
				});
				break;
			} catch (e) {
				console.log(`Error downloading ${baseName}`, e);
				console.log(`Retrying ${i + 1} of ${maxTries}...`);
			}
		}
	}
	console.log('Download complete.');
}