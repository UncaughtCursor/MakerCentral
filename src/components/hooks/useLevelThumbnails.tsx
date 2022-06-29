import React, { useState, useEffect } from 'react';
import useCloudFn from './useCloudFn';

export type LevelThumbnailStates = { [levelID: string]: LevelThumbnailState };

export interface LevelThumbnailState {
	state: 'Loading' | 'Loaded' | 'Not Uploaded' | 'Error' | 'Removed';
	url: string | null;
}

/**
 * Generates a set of level thumbnails if any are missing.
 * @param initState The initial state of the thumbnails.
 * @returns The state of the thumbnails.
 */
function useLevelThumbnails(initState: LevelThumbnailStates): LevelThumbnailStates {
	// We only care about non-uploaded levels.
	const nonUploadedLevelIds = Object.keys(initState).filter((levelID) => initState[levelID].state === 'Not Uploaded');

	const thumbnailFnState = useCloudFn<{ levelIDs: string[] }, { [levelID: string]: string | 'Error' | 'Removed' }>(
		'generateThumbnailsForLevelIDs',
		nonUploadedLevelIds.length > 0 ? {
			levelIDs: nonUploadedLevelIds,
		} : null,
	);

	// Initialize the output object to be a copy of initState.
	const outputObj: LevelThumbnailStates = { ...initState };

	// Map the level IDs to their current states.
	for (const levelID of nonUploadedLevelIds) {
		const state = (() => {
			if (thumbnailFnState.value === null) {
				if (thumbnailFnState.state === 'Loading') {
					return 'Loading';
				} if (thumbnailFnState.state === 'Error') {
					return 'Error';
				}
				console.error('This should never happen.');
				return 'Error';
			}
			switch (thumbnailFnState.value[levelID]) {
			case 'Error':
				return 'Error';
			case 'Removed':
				return 'Removed';
			default:
				return thumbnailFnState.state;
			}
		})();
		outputObj[levelID] = {
			state,
			url: thumbnailFnState.state === 'Loaded' ? thumbnailFnState.value![levelID] : null,
		};
	}

	return outputObj;
}

export default useLevelThumbnails;
