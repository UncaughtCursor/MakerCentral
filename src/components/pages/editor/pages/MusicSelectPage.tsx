import React from 'react';
import SongBoundaryChooser from '../controls/note-task-controls/SongBoundaryChooser';

/**
 * The page to select the section of music to use.
 */
function MusicSelectPage() {
	return (
		<div>
			<h1>Select Your Music</h1>
			<p className="explanatory-text">We&apos;ll begin the music-building process by first
				selecting some music to build in-game.
			</p>
			<p className="explanatory-text">Below is a preview of the MIDI file that you selected. Don&apos;t worry about fitting
				it into the in-game level grid yet; all you need to do in this step is to select the
				part of the song that you want to use.
			</p>
			<SongBoundaryChooser />
			<br />
		</div>
	);
}

export default MusicSelectPage;
