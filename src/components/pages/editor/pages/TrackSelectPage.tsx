import React, { useState, useContext } from 'react';
import ContinueButton from '../controls/ContinueButton';
import TrackChooser from '../controls/note-task-controls/TrackChooser';
import EditorContext from '../EditorContext';

/**
 * The page to select the tracks to use.
 */
function TrackSelectPage() {
	const ctx = useContext(EditorContext);
	const [showContinue, setShowContinue] = useState(ctx.project.buildInstances[0].tracks.length > 0);
	return (
		<div>
			<h1>Choose Your Tracks</h1>
			<p className="explanatory-text">Now it&apos;s time to choose which MIDI tracks to use. This includes any tracks that you want
				to edit or make copies of.
			</p>
			<p className="explanatory-text">The tracks are now transposed so that they fit into a Mario Maker 2 level as well as possible, marked by the two green lines. Keep in mind
				that some tracks will not fit entirely into the level grid. You may need to edit these
				tracks in the next section to make them work. If the
				main melody has this issue, then this song might not be a good fit for a music level.
			</p>
			<p className="explanatory-text">Remember, this is still Mario Maker 2; including too many notes will make the level impossible to build.
				It&apos;s recommended that you have one track for the melody and one track for
				the backing instruments.
			</p>
			<TrackChooser onInputChange={(isValid: boolean) => { setShowContinue(isValid); }} />
			<br />
			<div style={showContinue ? {} : { display: 'none' }}>
				<ContinueButton />
				<br />
				<br />
			</div>
		</div>
	);
}

export default TrackSelectPage;
