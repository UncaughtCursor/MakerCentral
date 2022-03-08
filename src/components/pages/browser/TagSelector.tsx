import React, { useState } from 'react';

/**
 * A component that allows for tags to be selected.
 * @param props The props:
 * * label: A text label to accompany the control.
 * * tags: The tags to display.
 * * onChange: The callback function for when the array of tags changes.
 * * initialTags (Optional): The array of tags that are already selected.
 * * limit (Optional): The limit for the number of tags that can be put on the level.
 */
function TagSelector(props: {
	label: string,
	tags: string[],
	onChange: (arg0: string[]) => void,
	initialTags?: string[],
	limit?: number
}) {
	const [tagList, setTagList] = useState(props.initialTags!);
	return (
		<div>
			<p style={{ fontSize: '14px', margin: '5px' }}>{props.label}</p>
			<div className="user-level-tag-container">
				{getTagElements(props.tags)}
			</div>
		</div>
	);

	/**
	 * Generates elements for each tag for a level.
	 */
	function getTagElements(tags: string[]) {
		const newTagsDisabled = tagList.length >= props.limit!;
		return tags.map((tag, i) => {
			const isSelected = tagList.includes(tag);
			if (isSelected) {
				return (
					<div
						className="user-level-tag-selected"
						key={tag}
						role="button"
						tabIndex={i}
						onClick={() => {
							// Remove tag from array when clicked if the tag is selected
							const newTags = tagList.filter((thisTag) => (thisTag !== tag));
							setTagList(newTags);
							props.onChange(newTags);
						}}
						onKeyPress={() => {
							// Remove tag from array when clicked if the tag is selected
							const newTags = tagList.filter((thisTag) => (thisTag !== tag));
							setTagList(newTags);
							props.onChange(newTags);
						}}
					>{tag}
					</div>
				);
			}
			if (!newTagsDisabled) {
				return (
					<div
						className="user-level-tag-selectable"
						key={tag}
						role="button"
						tabIndex={i}
						onClick={() => {
							// Add tag to array when clicked if the tag is selected
							const newTags = tagList.concat(tag);
							setTagList(newTags);
							props.onChange(newTags);
						}}
						onKeyPress={() => {
							// Add tag to array when clicked if the tag is selected
							const newTags = tagList.concat(tag);
							setTagList(newTags);
							props.onChange(newTags);
						}}
					>{tag}
					</div>
				);
			}
			return (
				<div
					className="user-level-tag-disabled"
					key={tag}
				>{tag}
				</div>
			);
		});
	}
}

TagSelector.defaultProps = {
	initialTags: [] as string[],
	limit: Infinity,
};

export default TagSelector;
