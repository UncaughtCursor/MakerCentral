import AppFrame from '@components/AppFrame';
import LevelCategoryFeed from '@components/pages/browser/LevelCategoryFeed';
import { MakerCentralTag, userLevelTags } from '@scripts/browser/BrowserUtil';
import { where } from 'firebase/firestore/lite';
import Page404 from 'pages/404';
import React from 'react';

/**
 * Displays the page for a level category.
 * @param props The props:
 * * name: The category name. Must be the name of an established level tag.
 */
function CategoryPage(props: {
	categoryName: string,
}) {
	if (!userLevelTags.includes(props.categoryName as MakerCentralTag)) {
		return <Page404 />;
	}

	const tag = props.categoryName as MakerCentralTag;

	return (
		<AppFrame
			title={`${tag} Levels - MakerCentral`}
			description={`Browse the latest ${tag.toLowerCase()} levels submitted to MakerCentral's level gallery!`}
		>
			<h1>{tag} Levels</h1>
			<LevelCategoryFeed
				extraQueryConstraints={[
					where('tags', 'array-contains', props.categoryName),
				]}
				usesArrayContains
			/>
		</AppFrame>
	);
}

/**
 * Obtains the server-side props needed to render the page.
 * @param context The server context.
 */
export function getServerSideProps(context: { params: {
	name: string,
}}) {
	return {
		props: {
			categoryName: context.params.name,
		},
	};
}

export default CategoryPage;
