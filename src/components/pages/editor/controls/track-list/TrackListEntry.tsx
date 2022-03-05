import React from 'react';

/**
 * An entry in a track list.
 * @param props The props.
 * * props.name The name of the track.
 * * props.trackId The id of the track.
 */
function TrackListEntry(props: {
	name: string,
	trackId: number,
	isSelected: boolean,
	onClick: (arg0: number) => void,
}) {
	return (
		<div
			role="menuitem"
			className={props.isSelected ? 'selected-track-list-entry'
				: 'track-list-entry'}
			onClick={handleClick}
		>
			{props.name}
		</div>
	);

	/**
	 * Triggers whenever the entry is clicked.
	 */
	function handleClick() {
		props.onClick(props.trackId);
	}
}

export default TrackListEntry;
