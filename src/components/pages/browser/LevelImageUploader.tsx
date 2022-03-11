/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
/* eslint-disable no-alert */
import React, { useState } from 'react';
import Files from 'react-files';
import CloseIcon from '@mui/icons-material/Close';

/**
 * A component that allows the user to upload images. Returns local URLs.
 * @param props The props:
 * * onUpload The function to execute once the images have have been uploaded.
 * Callback parameters are the array of image URLs and the index of the selected
 * level thumbnail.
 * * fileLimit (Optional) The number of files that can be uploaded at once.
 * * forcedImgUrls (Optional) Image URL state to force or null if none.
 * * forcedThumbnailIdx (Optional) Thumbnail index state to force or null if none.
 */
function LevelImageUploader(props: {
		onChange: (arg0: string[], arg1: number) => void,
		fileLimit?: number,
		forcedImgUrls?: string[] | null,
		forcedThumbnailIdx?: number | null,
	}) {
	const [imgUrls, setImgUrls] = useState([] as string[]);
	const [thumbnailIdx, setThumbnailIdx] = useState(0);

	const usedImgUrls = props.forcedImgUrls !== null ? props.forcedImgUrls! : imgUrls;
	const usedThumbnailIdx = props.forcedThumbnailIdx !== null
		? props.forcedThumbnailIdx! : thumbnailIdx;

	return (
		<div>
			<div style={{
				display: usedImgUrls.length >= props.fileLimit! ? 'none' : '',
				marginBottom: '20px',
			}}
			>
				<Files
					className="files-dropzone"
					onChange={(files: any) => { handleFileInput(files); }}
					onError={(error: any) => { alert(error.message); }}
					accepts={['.png', '.jpg', '.jpeg', '.webp']}
					maxFileSize={1000000}
					minFileSize={0}
					maxFiles={props.fileLimit!}
				>
					Click or drop to upload up to {props.fileLimit!} images.
				</Files>
			</div>
			<p style={{ marginTop: '0' }}>Upload up to 3 images to include.
				It is recommended to include at least on in-game screenshot.
			</p>
			<p>Click on an image to select it as the level thumbnail.</p>
			<div style={{
				display: 'flex',
				gap: '20px',
				justifyContent: 'center',
				flexWrap: 'wrap',
			}}
			>
				{getImageElements()}
			</div>
		</div>
	);

	/**
	 * Loads a MIDI file uploaded by the user into the context's project.
	 * @param files  An array of files from the file input element.
	 */
	async function handleFileInput(files: File[]) {
		const urls: string[] = files.map((file: File) => URL.createObjectURL(file));
		const newUrls = usedImgUrls.concat(urls).slice(0, props.fileLimit!);
		setImgUrls(newUrls);
		props.onChange(newUrls, usedThumbnailIdx);
	}

	/**
	 * Returns a set of image elements with the option to delete them.
	 * @returns The created elements.
	 */
	function getImageElements() {
		return usedImgUrls.map((imgUrl, i) => (
			<div style={{ position: 'relative' }}>
				<div
					style={{
						position: 'absolute',
						scale: '1.25',
						top: '5px',
						left: 'calc(100% - 28px)',
						cursor: 'pointer',
					}}
					onClick={() => {
						removeImageUrl(imgUrl);
					}}
					onKeyPress={() => {
						removeImageUrl(imgUrl);
					}}
					tabIndex={i}
					role="button"
				>
					<CloseIcon style={{
						color: 'var(--text-color)',
						filter: 'drop-shadow(rgb(0, 0, 0) 0px 0px 2px)',
					}}
					/>
				</div>
				<img
					src={imgUrl}
					alt={imgUrl}
					style={{
						aspectRatio: '16 / 9',
						height: '100px',
						border: i === usedThumbnailIdx ? '2px solid var(--hl-med)' : '2px solid var(--bg-norm)',
						borderRadius: '4px',
						cursor: 'pointer',
						transition: 'border-color 0.1s',
					}}
					onClick={() => {
						setThumbnailIdx(i);
						props.onChange(usedImgUrls, i);
					}}
					onKeyDown={() => {
						setThumbnailIdx(i);
						props.onChange(usedImgUrls, i);
					}}
					tabIndex={i}
					role="radio"
					aria-checked={i === usedThumbnailIdx}
				/>
			</div>
		));

		/**
		 * Removes a URL from the current list of image URLs.
		 * @param url The URL to remove.
		 */
		function removeImageUrl(url: string) {
			const newUrls = usedImgUrls.filter((imgUrl) => imgUrl !== url);
			const newThumbnailIdx = Math.min(usedThumbnailIdx, newUrls.length - 1);
			setImgUrls(newUrls);
			setThumbnailIdx(newThumbnailIdx);
			props.onChange(newUrls, newThumbnailIdx);
		}
	}
}

LevelImageUploader.defaultProps = {
	fileLimit: 1,
	forcedImgUrls: null,
	forcedThumbnailIdx: null,
};

export default LevelImageUploader;
