import { QueryConstraint } from 'firebase/firestore/lite';
import { useMediaQuery } from 'react-responsive';
import React from 'react';

export interface LevelCategory {
	name: string;
	icon: JSX.Element;
	queryConstraints: QueryConstraint[];
	useWeekQueue: boolean;
}

/**
 * A control that lets the user choose which level sort they want.
 * @param props The props:
 * * categories: The categories that are selectable.
 * * selectedIndex: The index of the currently selected category.
 * * onChange: The function to execute when the category is changed.
 */
function LevelCategoryPicker(props: {
	categories: LevelCategory[],
	selectedIndex: number,
	onChange: (arg0: number) => void,
}) {
	const isCompact = useMediaQuery({ query: '(max-width: 470px)' });
	return (
		<div
			className="level-category-container"
			style={{
				gap: isCompact ? '3px' : '0',
			}}
		>
			{getCategoryButtons()}
		</div>
	);

	/**
	 * Generates a button for each level category.
	 * @returns The generated buttons.
	 */
	function getCategoryButtons() {
		return props.categories.map((category, i) => {
			let style = {};
			switch (i) {
			case 0: {
				if (!isCompact) style = { borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' };
				break;
			}
			case props.categories.length - 1: {
				if (!isCompact) style = { borderBottomRightRadius: '10px', borderTopRightRadius: '10px' };
			}
			}
			if (isCompact) style = { ...style, width: '140px', borderRadius: '10px' };
			return (
				<div
					className={i === props.selectedIndex
						? 'level-category-button-selected' : 'level-category-button'}
					style={style}
					role="button"
					tabIndex={i}
					onClick={() => { props.onChange(i); }}
					onKeyPress={() => { props.onChange(i); }}
				>
					{category.icon}
					<p>{category.name}</p>
				</div>
			);
		});
	}
}

export default LevelCategoryPicker;
