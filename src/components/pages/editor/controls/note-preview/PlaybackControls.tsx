import TriggerButton from '@components/pages/controls/TriggerButton';
import React, { useContext, useState } from 'react';
import EditorContext from '../../EditorContext';

interface PlaybackControlsProps {
	isPlaying: boolean,
	isSoloToggleVisible: boolean,
	onPlay: (arg0: boolean) => void,
	onStop: () => void,
	onSoloToggle: (arg0: boolean) => void,
}

/**
 * Renders the playback controls used in controlling playback.
 */
function PlaybackControls(props: PlaybackControlsProps) {
	const [isSolo, setIsSolo] = useState(true);
	const ctx = useContext(EditorContext);

	// Stop transposing preview after the third page, before "Choose Your Tracks"
	const isTransposed = false; // ctx.currentPage <= 2;
	return (
		<div className="playback-container">
			<TriggerButton type="flush" text={props.isPlaying ? 'Stop' : 'Play'} onClick={handlePlayButtonClick} />
			<div className="solo-toggle-container" style={{ display: `${props.isSoloToggleVisible ? '' : 'none'}` }}>
				<input type="checkbox" className="solo-toggle" checked={isSolo} onChange={handleSoloToggle} id="solo-playback-checkbox" />
				{/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
				<label htmlFor="solo-playback-checkbox" className="solo-toggle-label">Only Play Selected Track</label>
			</div>
		</div>
	);

	/**
	 * Updates playback state when the play/pause button is clicked.
	 */
	function handlePlayButtonClick() {
		// Activate functionality before switching state
		if (!props.isPlaying) props.onPlay(isTransposed);
		else props.onStop();
	}

	/**
	 * Triggers whenever the solo checkbox is clicked.
	 */
	function handleSoloToggle() {
		setIsSolo(!isSolo);
		props.onSoloToggle(isSolo);
	}
}

export default PlaybackControls;
