import React from 'react';
import './TrackList.css';
import TrackListEntry from './TrackListEntry';

/**
 * A vertical list of selectable tracks.
 * @param props The props.
 * * props.title The title of the list.
 * * props.entries The entries of tracks to display as name and id number pairs.
 * * props.onEntryClick The function to call when a track is clicked.
 */
function TrackList(props: {
	title: string,
	entries: {
		name: string,
		id: number,
	}[],
	selectedIndex: number,
	onEntryClick: (arg0: number) => void,
}) {
	return (
		<div>
			<h4 className="track-list-title">{props.title}</h4>
			<div className="track-list">
				{getEntryElements()}
			</div>
		</div>

	);

	/**
	 * Generates each entry in the list of tracks.
	 * @returns The created elements.
	 */
	function getEntryElements(): React.ReactNode {
		if (props.entries.length > 0) {
			return props.entries.map((entry, i) => (
				<TrackListEntry
					name={entry.name}
					trackId={entry.id}
					isSelected={props.selectedIndex === i}
					onClick={() => props.onEntryClick(i)}
					key={entry.id}
				/>
			));
		}
		return [
			<div
				className="track-list-non-selectable"
				key="Empty"
			>(Empty)
			</div>,
		];
	}
}

export default TrackList;
