import React from 'react';
import TrackEditor from '../controls/note-task-controls/track-editor/TrackEditor';

// TODO: Track chooser and editor interface, do not let user proceed with errors

/**
 * The page used to edit tracks.
 */
function TrackEditPage() {
	return (
		<>
			<h1>Edit Your Tracks</h1>
			<p className="explanatory-text">Here is where you can edit your tracks to work in the game.
				Right now, the editor allows for small adjustments. If you need more advanced edits, a DAW like FL Studio or <a href="https://signal.vercel.app/">Signal</a> is recommended.
				Once the build requirements are satisfied, you can continue to building the level.
			</p>
			<TrackEditor />
		</>
	);
}

export default TrackEditPage;
