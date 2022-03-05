import { UserLevelTag } from '@scripts/browser/BrowserUtil';
import React from 'react';
import './TagDisplay.css';

/**
 * A component that displays the tags of a level.
 * @param props The props:
 * * tags: The tags to display.
 */
function TagDisplay(props: {
	tags: UserLevelTag[]
}) {
	return (
		<div className="user-level-tag-container">
			{getTagElements(props.tags)}
		</div>
	);

	/**
	 * Generates elements for each tag for a level.
	 */
	function getTagElements(tags: UserLevelTag[]) {
		return tags.map((tag) => <div className="user-level-tag" key={tag}>{tag}</div>);
	}
}

export default TagDisplay;
