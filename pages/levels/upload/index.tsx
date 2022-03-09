import AppFrame from '@components/AppFrame';
import Gate from '@components/main/Gate';
import ImageUploader from '@components/pages/browser/LevelImageUploader';
import TagSelector from '@components/pages/browser/TagSelector';
import ChecksWidget, { CheckResult } from '@components/pages/controls/ChecksWidget';
import SelectInput from '@components/pages/controls/SelectInput';
import TextArea from '@components/pages/controls/TextArea';
import TextField from '@components/pages/controls/TextField';
import TriggerButton from '@components/pages/controls/TriggerButton';
import {
	difficulties, Difficulty, GameStyle, gameStyles, UserLevel, UserLevelTag, userLevelTags,
} from '@scripts/browser/BrowserUtil';
import {
	functions, getUser, randomString, storage,
} from '@scripts/site/FirebaseUtil';
import { httpsCallable } from 'firebase/functions';
import {
	getDownloadURL, ref, uploadBytes, UploadResult,
} from 'firebase/storage';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

interface UserLevelInformation {
	name: string;
	levelCode: string;
	thumbnailIndex: number;
	imageLocalUrls: string[];
	shortDescription: string;
	description: string;
	difficulty: Difficulty;
	gameStyle: GameStyle;
	tags: UserLevelTag[];
}

const defaultLevel: UserLevelInformation = {
	name: '',
	levelCode: '',
	thumbnailIndex: 0,
	imageLocalUrls: [],
	shortDescription: '',
	description: '',
	difficulty: 'Normal',
	gameStyle: 'SMB1',
	tags: [],
};

// Code validation:
// 9 alphanumeric characters
// Last character is F, G, or H
// O, I and Z are not used

/**
 * The page used for editing and uploading levels.
 */
function LevelUploadPage() {
	const [level, setLevel] = useState(defaultLevel);
	const router = useRouter();
	const inputChecks = getValidationChecks();
	const passedInputChecks = inputChecks.reduce((acc, val) => acc && val.passed, true);
	return (
		<AppFrame>
			<Gate requireEA={false} showLogout={false}>
				<div>
					<h1>Upload a Level</h1>
					<form style={{
						display: 'inline-flex',
						margin: '0 auto',
						gap: '20px',
						flexDirection: 'column',
						backgroundColor: 'var(--bg-dark)',
						padding: '20px',
						borderRadius: '20px',
						width: '90vw',
						maxWidth: '700px',
					}}
					>
						<h4>General Info</h4>
						<div style={{ margin: '0 auto' }}>
							<div style={{ display: 'flex', gap: '8px' }}>
								<TextField
									label="Level Name"
									value={level.name}
									widthPx={250}
									onChange={(text) => {
										setLevel({
											...level,
											name: text,
										});
									}}
									maxLength={62} /* 2 full lines on desktop */
								/>
								<TextField
									label="Course ID"
									value={level.levelCode}
									widthPx={85}
									onChange={(text) => {
										setLevel({
											...level,
											levelCode: text,
										});
									}}
									maxLength={11}
								/>
							</div>
							<TextField
								label="Preview Text"
								value={level.shortDescription}
								widthPx={355}
								onChange={(text) => {
									setLevel({
										...level,
										shortDescription: text,
									});
								}}
								maxLength={82} /* 2 full lines on desktop */
							/>
							<TextArea
								label="Description"
								maxLength={750}
								value={level.description}
								onChange={(text) => {
									setLevel({
										...level,
										description: text,
									});
								}}
								widthPx={359}
								heightPx={125}
							/>
						</div>
						<h4>Images</h4>
						<div>
							<ImageUploader
								onChange={(imgUrls, thumbnailIdx) => {
									setLevel({
										...level,
										imageLocalUrls: imgUrls,
										thumbnailIndex: thumbnailIdx,
									});
								}}
								fileLimit={3}
							/>
						</div>
						<h4>Gameplay Details</h4>
						<div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
							<SelectInput
								label="Difficulty"
								choices={difficulties}
								initSelectedIndex={difficulties.indexOf(level.difficulty)}
								onSelect={(_, val) => {
									setLevel({
										...level,
										difficulty: val as Difficulty,
									});
								}}
							/>
							<SelectInput
								label="Game Style"
								choices={gameStyles}
								initSelectedIndex={gameStyles.indexOf(level.gameStyle)}
								onSelect={(_, val) => {
									setLevel({
										...level,
										gameStyle: val as GameStyle,
									});
								}}
							/>
						</div>
						<div style={{ maxWidth: '360px', margin: '0 auto' }}>
							<TagSelector
								label="Tags (Up to 5)"
								tags={userLevelTags as unknown as string[]}
								initialTags={level.tags}
								limit={5}
								onChange={(tags: string[]) => {
									setLevel({
										...level,
										tags: tags as UserLevelTag[],
									});
								}}
							/>
						</div>
					</form>
					<div style={{
						display: 'flex',
						justifyContent: 'center',
					}}
					>
						<ChecksWidget
							title="Requirements"
							results={inputChecks}
							passed={passedInputChecks}
							showPassed={false}
						/>
					</div>
					<div style={{ display: passedInputChecks ? '' : 'none', marginTop: '10px' }}>
						<TriggerButton
							text="Publish"
							type="blue"
							onClick={publishLevel}
						/>
					</div>
				</div>
			</Gate>
		</AppFrame>
	);

	/**
	 * Generates the check results to show to the user.
	 * @returns The results.
	 */
	function getValidationChecks(): CheckResult[] {
		return [
			{
				label: 'Have a title',
				passed: level.name.length > 0,
				note: 'Title is blank.',
			},
			{
				label: 'Have a valid level code',
				passed: isValidLevelCode(level.levelCode),
				note: 'This level code is definitely not valid.',
			},
			{
				label: 'Have preview text',
				passed: level.shortDescription.length > 0,
				note: 'Preview text field is blank.',
			},
			{
				label: 'Have a description',
				passed: level.description.length > 0,
				note: 'Description is blank.',
			},
			{
				label: 'Have at least one image',
				passed: level.imageLocalUrls.length > 0,
				note: 'You don\'t have any images set.',
			},
			{
				label: 'Have at least one tag',
				passed: level.tags.length > 0,
				note: 'You don\'t have any tags set.',
			},
		];
	}

	/**
	 * Publishes a level based on the user-submitted data.
	 */
	async function publishLevel() {
		const now = Date.now();
		const user = getUser()!;

		// Upload the images to Firebase storage
		const globalUrls = new Array<string>(level.imageLocalUrls.length).fill('');
		await Promise.all(level.imageLocalUrls.map(
			// eslint-disable-next-line no-async-promise-executor
			(localUrl, i) => new Promise(async (resolve, reject) => {
				// Get blob to upload
				const blob = await fetch(localUrl).then((r) => r.blob());

				// Establish image reference in cloud storage
				const imgId = randomString(24);
				const imgRef = ref(storage, `/level-img/${imgId}`);

				// Upload
				try {
					await uploadBytes(imgRef, blob);
					globalUrls[i] = await getDownloadURL(imgRef);
					resolve();
				} catch (e) {
					console.error(e);
					resolve();
				}
			}) as Promise<void>,
		));

		try {
			const publishFn = httpsCallable(functions, 'publishLevel');
			const res = await publishFn({ level, globalUrls });
			const levelId = res.data as string;
			console.log(levelId);
			router.push(`/levels/view/${levelId}`);
		} catch (e) {
			// eslint-disable-next-line no-alert
			alert('An error occurred while attempting to upload the level.');
			console.error(e);
		}
	}

	/**
	 * Determines if the level code can possibly be valid.
	 * Valid level codes contain 9 alphanumeric characters,
	 * end with an F, G, or H, and do not contain the characters O, I, or Z.
	 * @param code The code to validate
	 * @returns Whether or not the code is valid.
	 */
	function isValidLevelCode(code: string) {
		const alphanumericRegex = /([A-Z0-9])\w+/g;
		const alphanumericChunks = code.toUpperCase().match(alphanumericRegex);
		if (alphanumericChunks === null) return false;
		const normalizedCode = alphanumericChunks.join('');

		if (normalizedCode.length !== 9) return false;
		const forbiddenCharsRegex = /[OIZ]/g;
		const lastChar = normalizedCode.charAt(8);
		return !forbiddenCharsRegex.test(normalizedCode)
	&& (lastChar === 'F' || lastChar === 'G' || lastChar === 'H');
	}
}

export default LevelUploadPage;
