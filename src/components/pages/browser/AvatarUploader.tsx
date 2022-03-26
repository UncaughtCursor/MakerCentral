import { uploadFiles } from '@scripts/site/FirebaseUtil';
import React, { useState } from 'react';
import Files from 'react-files';

/**
 * An avatar uploading tool.
 * @param props The props:
 * * label: The label for the tool.
 * * initialImageUrl: The initial URL to be displayed.
 * * onUpload: The function to execute when an image is uploaded.
 */
function AvatarUploader(props: {
	label: string,
	initialImageUrl: string | null,
	onUpload: (url: string) => void,
}) {
	const [imageUrl, setImageUrl] = useState(props.initialImageUrl);

	return (
		<div>
			<h3>{props.label}</h3>
			<Files
				className="files-dropzone"
				onChange={(files: File[]) => { handleFileInput(files); }}
				accepts={['.png', '.jpg', '.jpeg', '.webp']}
				maxFileSize={1000000}
				minFileSize={0}
				multiple={false}
			>
				Drop your file here or click to upload.
			</Files>
			<div
				style={{
					display: imageUrl !== null ? '' : 'none',
					marginTop: '20px',
				}}
			>
				<img
					src={imageUrl !== null ? imageUrl : undefined}
					alt="Your avatar"
					style={{
						width: '50%',
						border: '3px solid var(--bg-lite)',
						borderRadius: '3px',
						aspectRatio: '1 / 1',
					}}
				/>
			</div>
		</div>
	);

	/**
	 * Generates a url for the file uploaded.
	 * @param files The array containing the file.
	 */
	async function handleFileInput(files: File[]) {
		const file = files[0];
		const url = URL.createObjectURL(file);
		const [globalUrl] = await uploadFiles([url], '/avatars/');
		setImageUrl(globalUrl);
		props.onUpload(globalUrl);
	}
}

export default AvatarUploader;
