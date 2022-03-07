/* eslint-disable no-alert */
import React, { useState } from 'react';
import Files from 'react-files';

/**
 * A component that allows the user to upload images, automatically uploading them
 * to a Firebase cloud storage bucket and returning the URLs.
 * @param props The props:
 * * onUpload The function to execute once the images have have been uploaded.
 * Callback parameter is the array of image URLs.
 * * fileLimit (Optional) The number of files that can be uploaded at once.
 */
function LevelImageUploader(props: {
		onUpload: (arg0: string[]) => void,
		fileLimit?: number
	}) {
	return (
		<Files
			className="files-dropzone"
			onChange={(files: any) => { handleFileInput(files); }}
			onError={(error: any) => { alert(error.message); }}
			accepts={['.png', '.jpg', '.jpeg', '.webp']}
			maxFileSize={1000000}
			minFileSize={0}
		>
			Click or drop to upload up to {props.fileLimit!} images.
		</Files>
	);

	/**
	 * Loads a MIDI file uploaded by the user into the context's project.
	 * @param files  An array of files from the file input element.
	 */
	async function handleFileInput(files: File[]) {
		// TODO: Upload to the cloud
		props.onUpload(new Array<string>(files.length).fill(''));
	}
}

LevelImageUploader.defaultProps = {
	fileLimit: 1,
};

export default LevelImageUploader;
