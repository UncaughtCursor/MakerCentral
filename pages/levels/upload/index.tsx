import AppFrame from '@components/AppFrame';
import Gate from '@components/main/Gate';
import SelectInput from '@components/pages/controls/SelectInput';
import TextArea from '@components/pages/controls/TextArea';
import TextField from '@components/pages/controls/TextField';
import {
	difficulties, Difficulty, GameStyle, gameStyles, UserLevelTag,
} from '@scripts/browser/BrowserUtil';
import React, { useState } from 'react';

interface UserLevelInformation {
	name: string;
	levelCode: string;
	thumbnailUrl: string;
	imageUrls: string[];
	shortDescription: string;
	description: string;
	difficulty: Difficulty;
	gameStyle: GameStyle;
	tags: UserLevelTag[];
	editedTime: number;
}

const defaultLevel: UserLevelInformation = {
	name: '',
	levelCode: '',
	thumbnailUrl: '',
	imageUrls: [],
	shortDescription: '',
	description: '',
	difficulty: 'Normal',
	gameStyle: 'SMB1',
	tags: [],
	editedTime: Date.now(),
};

/**
 * The page used for editing and uploading levels.
 */
function LevelUploadPage() {
	const [level, setLevel] = useState(defaultLevel);
	return (
		<AppFrame>
			<Gate requireEA={false} showLogout={false}>
				<div>
					<h1>Upload</h1>
					<form style={{
						display: 'inline-flex',
						margin: '0 auto',
						gap: '20px',
						flexDirection: 'column',
					}}
					>
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
						{ /* TODO: Image Upload */ }
						<TextField
							label="Preview Text"
							value={level.shortDescription}
							widthPx={356}
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
							widthPx={363}
							heightPx={125}
						/>
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
					</form>
				</div>
			</Gate>
		</AppFrame>
	);
}

export default LevelUploadPage;
