import { MCTag } from '@data/types/MCBrowserTypes';
import React from 'react';

/**
 * A component that displays the tags of a level.
 * @param props The props:
 * * tags: The tags to display.
 */
function TagDisplay(props: {
	tags: MCTag[]
}) {
	return (
		<div className="user-level-tag-container">
			{getTagElements(props.tags)}
		</div>
	);

	/**
	 * Generates elements for each tag for a level.
	 */
	function getTagElements(tags: MCTag[]) {
		return tags.map((tag) => <div className="user-level-tag" key={tag}>{tag}</div>);
	}
}

export default TagDisplay;
