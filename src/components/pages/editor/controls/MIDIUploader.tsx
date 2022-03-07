import React, { useContext, useState } from 'react';
import Project from '@scripts/builder/project/Project';
import loadUserMidi from '@scripts/builder/project/MidiLoader';
import Files from 'react-files';
import EditorContext from '../EditorContext';

/**
 * A component that allows the user to replace the current MIDI file in the project.
 */
function MIDIUploader(props: {onChange: () => void}) {
	const ctx = useContext(EditorContext);
	const [fileName, setFileName] = useState(ctx.uploadedFileName);
	return (
		<>
			<Files
				className="files-dropzone"
				onChange={(files: any) => { handleFileInput(files); }}
				accepts={['.mid', '.midi']}
				maxFileSize={10000000}
				minFileSize={0}
				multiple={false}
			>
				Drop your file here or click to upload.
			</Files>
			<b><p className="files-dropzone-text">{`Uploaded file: ${fileName}`}</p></b>
		</>
	);

	/**
	 * Loads a MIDI file uploaded by the user into the context's project.
	 * @param files  An array of files from the file input element.
	 */
	async function handleFileInput(files: File[]) {
		const file = files[files.length - 1];

		ctx.uploadedFileName = file.name;
		setFileName(file.name);

		// Load first file
		const loadedMidi = await loadUserMidi(files[0]);

		// Reset project
		ctx.project = new Project();
		ctx.project.addMidi(loadedMidi);

		props.onChange();
	}
}

export default MIDIUploader;
