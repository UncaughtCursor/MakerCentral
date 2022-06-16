/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import chunk from 'chunk';
import { db, storage } from './FirebaseUtil';
import { loadRawLevelDocs } from './LevelStats';
import {
	generalOutDir, levelOutDir, thumbOutDir, userOutDir,
} from './LevelConvert';
import { saveJSON } from './util/Util';
import TextDirStream from './TextDirStream';
import { MCRawLevelDoc, MCRawUserDoc } from '../../data/types/MCBrowserTypes';
import SpeedTester from './util/SpeedTester';
import TextDirIterator from './TextDirIterator';

const levelCollectionPath = 'levels-raw';
const userCollectionPath = 'users-raw';
const worldCollectionPath = 'worlds-raw';
const thumbnailCloudPath = 'game-level-thumb';

/**
 * Uploads completed levels to Firebase.
 */
export async function uploadLevels() {
	const levelsPerChunk = 1000;
	const spdTest = new SpeedTester(levelsPerChunk, (spd, _, total) => {
		console.log(`${total} levels done; ${spd} per second`);
	});
	const levelTextStream = new TextDirStream(levelOutDir);
	levelTextStream.on('data', (text: string) => {
		const levels = JSON.parse(text) as MCRawLevelDoc[];
		console.log('Chunk received.');

		levelTextStream.pause();

		(async () => {
			const levelChunks = chunk(levels, levelsPerChunk);
			for (let i = 0; i < levelChunks.length; i++) {
				const levelChunk = levelChunks[i];

				const promises: Promise<void>[] = [];

				for (let j = 0; j < levelChunk.length; j++) {
					const level = levelChunk[j];
					const docLoc = `${levelCollectionPath}/${level.course_id}`;

					const upload = async () => {
						let success = false;
						while (!success) {
							try {
								await db.doc(docLoc).set(level);
								success = true;
							} catch (e) {
								console.error(e);
								success = false;
							}
						}
					};
					const promise = upload();
					promise.then(() => {
						spdTest.tick();
					});
					promises.push(promise);
				}

				await Promise.all(promises);
			}
		})().then(() => {
			levelTextStream.resume();
		});
	});
}

/**
 * Uploads completed users to Firebase.
 */
export async function uploadUsers() {
	const usersPerChunk = 1000;
	const spdTest = new SpeedTester(usersPerChunk, (spd, _, total) => {
		console.log(`${total} users done; ${spd} per second`);
	});
	const userTextIterator = new TextDirIterator(userOutDir);
	userTextIterator.iterate(async (text: string) => {
		const users = JSON.parse(text) as MCRawUserDoc[];
		console.log('Chunk received.');

		const userChunks = chunk(users, usersPerChunk);
		for (let i = 0; i < userChunks.length; i++) {
			const userChunk = userChunks[i];

			const promises: Promise<void>[] = [];

			for (let j = 0; j < userChunk.length; j++) {
				const user = userChunk[j];
				const docLoc = `${userCollectionPath}/${user.code}`;

				const upload = async () => {
					let success = false;
					while (!success) {
						try {
							await db.doc(docLoc).set(user);
							success = true;
						} catch (e) {
							console.error(e);
							success = false;
						}
					}
				};
				const promise = upload();
				promise.then(() => {
					spdTest.tick();
				});
				promises.push(promise);
			}

			await Promise.all(promises);
		}
	});
}

interface UploadResult {
	id: string;
	success: boolean;
	err: any | null;
}

/**
 * Uploads all thumbnails to Firebase cloud storage.
 */
export async function uploadThumbnails() {
	console.log('Getting file list...');
	const fileNames: string[] = await (() => new Promise((resolve) => {
		fs.readdir(thumbOutDir, (err: Error | null, files: string[]) => {
			if (err) console.error(err);
			resolve(files);
		});
	}))();

	console.log(`Uploading ${fileNames.length} files`);

	const thumbsPerBatch = 1000;

	let lastTime = Date.now();
	let numUploadsComplete = 0;
	let numBatchesDone = 0;
	const results: UploadResult[] = [];

	while (fileNames.length > 0) {
		const thisBatchNames = fileNames.splice(0, thumbsPerBatch);
		console.log(`Batch #${numBatchesDone + 1}`);

		// eslint-disable-next-line no-loop-func
		const promises: Promise<UploadResult>[] = thisBatchNames.map(async (fileName) => {
			const path = `${thumbOutDir}/${fileName}`;
			try {
				await storage.bucket().upload(path, {
					destination: `${thumbnailCloudPath}/${fileName}`,
				});

				numUploadsComplete++;

				if (numUploadsComplete % thumbsPerBatch === 0) {
					const curTime = Date.now();
					const elapsedTimeSec = (curTime - lastTime) / 1000;
					const uploadRate = thumbsPerBatch / elapsedTimeSec;
					lastTime = curTime;

					console.log(`${numUploadsComplete} thumbnails uploaded`);
					console.log(`${uploadRate} thumbnails per second\n`);
				}

				return {
					id: fileName,
					success: true,
					err: null,
				};
			} catch (err) {
				console.error(err);
				return {
					id: fileName,
					success: false,
					err,
				};
			}
		});

		numBatchesDone++;

		results.push(...(await Promise.all(promises)));
	}

	console.log('Done uploading, saving results...');
	saveJSON(`${generalOutDir}/thumb-upload-results.json`, results);

	console.log('Done');
}
