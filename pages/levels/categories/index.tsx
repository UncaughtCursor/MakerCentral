import AppFrame from '@components/AppFrame';
import { userLevelTags } from '@scripts/browser/BrowserUtil';
import Link from 'next/link';
import React, { ReactNode } from 'react';

/**
 * Displays an index of level categories to choose.
 */
function CategoryIndexPage() {
	return (
		<AppFrame
			title="Categories - Music Level Studio Levels"
			description="Browse different categories of user-submitted Mario Maker 2 levels!"
		>
			<h1>Level Categories</h1>
			<div className="level-category-link-container">
				{getCategoryLinks()}
			</div>
		</AppFrame>
	);

	/**
	 * Generates the links to each level category.
	 * @returns The generated links.
	 */
	function getCategoryLinks(): ReactNode {
		return userLevelTags.map((tag) => (
			<Link href={`/levels/categories/${tag}`}>
				<a className="level-category-link">
					{tag}
				</a>
			</Link>
		));
	}
}

export default CategoryIndexPage;
