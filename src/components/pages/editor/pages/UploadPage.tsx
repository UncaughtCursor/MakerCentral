import React, { useContext, useEffect, useState } from 'react';
import TriggerButton from '@components/pages/controls/TriggerButton';
import EditorContext from '../EditorContext';
import MIDIUploader from '../controls/MIDIUploader';

/**
 * The page to upload files.
 */
function UploadPage() {
	// TODO: Proper loading event, block other pages until file is loaded
	const ctx = useContext(EditorContext);
	const [showContinue, setShowContinue] = useState(ctx.project.projectMidis.length > 0);
	useEffect(() => {
		// eslint-disable-next-line require-jsdoc
		async function setupPage() {
			// Setup MIDI
			// const loadedMidi = await loadPublicMidi(testMidiPath);
			// ctx.project.addMidi(loadedMidi);
			console.log(ctx);
		}

		setupPage();
	}, []);

	return (
		<div>
			<h1>Choose Your Music Source</h1>
			<p>Upload a MIDI file to build from.</p>
			<br />
			<MIDIUploader onChange={() => { setShowContinue(true); }} />
			<br />
			<div style={showContinue ? {} : { display: 'none' }}>
				<TriggerButton text="Continue" type="blue" onClick={() => { ctx.func.setPage(1); }} />
			</div>
		</div>
	);
}

export default UploadPage;
