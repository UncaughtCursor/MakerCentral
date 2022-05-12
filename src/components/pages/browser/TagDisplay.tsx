import { MakerCentralTag } from '@scripts/browser/BrowserUtil';
import React from 'react';

/**
 * A component that displays the tags of a level.
 * @param props The props:
 * * tags: The tags to display.
 */
function TagDisplay(props: {
	tags: MakerCentralTag[]
}) {
	return (
		<div className="user-level-tag-container">
			{getTagElements(props.tags)}
		</div>
	);

	/**
	 * Generates elements for each tag for a level.
	 */
	function getTagElements(tags: MakerCentralTag[]) {
		return tags.map((tag) => <div className="user-level-tag" key={tag}>{tag}</div>);
	}
}

export default TagDisplay;
