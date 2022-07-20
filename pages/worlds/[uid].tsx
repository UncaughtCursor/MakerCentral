import AppFrame from '@components/AppFrame';
import { LevelThumbnailStates } from '@components/hooks/useLevelThumbnailStates';
import ProportionChart, { ProportionChartProportion } from '@components/pages/browser/ProportionChart';
import SuperWorldThumbnail from '@components/pages/browser/SuperWorldThumbnail';
import TagDisplay from '@components/pages/browser/TagDisplay';
import { CloudFunction } from '@data/types/FirebaseUtilTypes';
import { MCTag, MCWorldDocData } from '@data/types/MCBrowserTypes';
import { functions, getLevelThumbnailUrl } from '@scripts/site/FirebaseUtil';
import { httpsCallable } from 'firebase/functions';
import Page404 from 'pages/404';
import React from 'react';
import ChartColors from '@data/ChartColors.json';
import SuperWorldLevelListings from '@components/pages/browser/SuperWorldLevelListings';

interface SuperWorldPageProps {
	world: MCWorldDocData | null,
	thumbnailUrls: { [levelId: string]: string },
}

/**
 * The page used to display a super world.
 * @param props The props:
 * * world The world data.
 * * thumbnailUrls The URLs of the thumbnails of the levels in the world.
 */
function SuperWorldPage(props: SuperWorldPageProps) {
	const world = props.world;
	if (world === null) {
		return <Page404 />;
	}

	const worldName = `Super ${world.makerName} World`;
	const totalLikes = Math.round(world.avgLikes * world.numLevels);
	const totalPlays = Math.round(world.avgPlays * world.numLevels);
	const featuredTags: MCTag[] = (Object.keys(world.avgTags) as MCTag[])
		.filter((tag: MCTag) => world.avgTags[tag] >= 0.15);

	const topFourLevelIds = world.levels.slice(0).sort((a, b) => b.numLikes - a.numLikes)
		.slice(0, 4).map((level) => level.id);
	const embedThumbnailUrl = props.thumbnailUrls[topFourLevelIds[0]];
	const topFourLevelIdMap: { [levelId: string]: string } = {};
	topFourLevelIds.forEach((levelId) => {
		topFourLevelIdMap[levelId] = props.thumbnailUrls[levelId];
	});

	const initThumbnailStates: LevelThumbnailStates = {};
	for (const levelId of Object.keys(props.thumbnailUrls)) {
		initThumbnailStates[levelId] = {
			state: props.thumbnailUrls[levelId] === undefined || props.thumbnailUrls[levelId] === ''
				? 'Not Uploaded' : 'Loaded',
			url: props.thumbnailUrls[levelId] !== undefined ? props.thumbnailUrls[levelId] : null,
		};
	}

	// const thumbnails = useLevelThumbnails(initThumbnailStates);

	const formattedWorldCode = `${props.world!.makerId.substring(0, 3)}-${props.world!.makerId.substring(3, 6)}-${props.world!.makerId.substring(6, 9)}`;

	const difficultyProportion = getProportionChartData(
		props.world!.avgDifficulty,
		ChartColors.difficulty,
	);
	const gameStyleProportion = getProportionChartData(
		props.world!.avgGameStyle,
		ChartColors.gameStyle,
	);
	const themeProportion = getProportionChartData(
		props.world!.avgTheme,
		ChartColors.theme,
	);
	const tagProportion = getProportionChartData(
		props.world!.avgTags,
		ChartColors.tag,
	);

	return (
		<AppFrame
			title={`${worldName} - MakerCentral Levels`}
			description={`${props.world!.makerName}'s super world with ${props.world!.numLevels} levels. Prominent tags: ${featuredTags.join(', ')}.`}
			imageUrl={embedThumbnailUrl}
		>
			<div className="level-page-content">
				<div className="level-page-header">
					{/* TODO: Bookmarking worlds */}
					{/* <BookmarkButton
						level={world}
						left="calc(100% - 50px)"
						top="15px"
					/> */}
					<SuperWorldThumbnail
						thumbnailUrls={topFourLevelIdMap}
						heightPx={81}
						style={{
							padding: '0px',
						}}
					/>
					<div>
						<h3 className="level-page-title">{worldName}</h3>
						<p className="level-code">{formattedWorldCode}</p>
					</div>
				</div>
				<div className="level-page-info-group">
					<div
						className="level-page-info-container"
						style={{
							flexGrow: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center',
						}}
					>
						<table className="info-table">
							<tr>
								<td>World ID</td>
								<td>{formattedWorldCode}</td>
							</tr>
							<tr>
								<td>Maker</td>
								<td><a href={`/users/${world.makerId}`}>{world.makerName}</a></td>
							</tr>
							<tr>
								<td>Levels</td>
								<td>{world.numLevels}</td>
							</tr>
							<tr>
								<td>Worlds</td>
								<td>{world.numWorlds}</td>
							</tr>
							<tr>
								<td>Total Likes</td>
								<td>{totalLikes}</td>
							</tr>
							<tr>
								<td>Total Plays</td>
								<td>{totalPlays}</td>
							</tr>
							<tr>
								<td>Likes Per Level</td>
								<td>{world.avgLikes.toFixed(2)}</td>
							</tr>
							<tr>
								<td>Plays Per Level</td>
								<td>{world.avgPlays.toFixed(2)}</td>
							</tr>
							<tr>
								<td>Avg Clear Rate</td>
								<td>{(world.avgClearRate).toFixed(3)}%{world.avgClearRate === 0 ? ' (Uncleared)' : ''}</td>
							</tr>
						</table>
					</div>
					<div
						className="level-page-info-container"
						style={{
							width: '300px',
						}}
					>
						<h4>Most Common Tags</h4>
						<TagDisplay tags={featuredTags} />
						<h4 style={{
							marginTop: '20px',
						}}
						>Level List
						</h4>
						<SuperWorldLevelListings levels={world.levels} />
					</div>
				</div>
				<div className="multi-doughnut-container">
					<ProportionChart title="Difficulties" proportion={difficultyProportion} />
					<ProportionChart title="Game Styles" proportion={gameStyleProportion} />
					<ProportionChart title="Themes" proportion={themeProportion} />
					<ProportionChart title="Tags" proportion={tagProportion} />
				</div>
			</div>
		</AppFrame>
	);
}

/**
 * Obtains the server-side props used for rendering the page.
 * @param context The context object.
 * @returns The props.
 */
export async function getServerSideProps(
	context: {params: {uid: string}},
): Promise<{props: SuperWorldPageProps}> {
	const worldFn: CloudFunction<{
		userId: string,
	}, MCWorldDocData | null> = httpsCallable(functions, 'getWorld');

	try {
		// Get the world data.
		const data = (await worldFn({
			userId: context.params.uid,
		})).data;
		console.log('data', data);
		if (!data) {
			throw new Error('No world data found.');
		}

		const levelIds = data.levels.map((level) => level.id);

		const thumbnailUrls: { [levelId: string]: string } = {};
		const promises = [];
		for (const levelId of levelIds) {
			promises.push(getLevelThumbnailUrl(levelId));
		}
		const thumbnails = await Promise.all(promises);

		// Map the thumbnails to the level IDs.
		for (let i = 0; i < thumbnails.length; i++) {
			thumbnailUrls[levelIds[i]] = thumbnails[i];
		}

		return {
			props: {
				world: data,
				thumbnailUrls,
			},
		};
	} catch (err) {
		console.error(err);
		return {
			props: {
				world: null,
				thumbnailUrls: {},
			},
		};
	}
}

/**
 * Converts a proportion as a mapping of labels to percentages
 * and a mapping of labels to colors to the data needed for a ProportionChart.
 * @param data The mapping of labels to percentages (as a number between 0 and 1).
 * @param colors The mapping of labels to colors.
 * @returns The data needed for a ProportionChart.
 */
function getProportionChartData<T>(
	data: {[key in keyof T]: number},
	colors: {[key in keyof T]: string},
): ProportionChartProportion {
	const proportionChartData: ProportionChartProportion = {};
	for (const entry of Object.keys(data)) {
		proportionChartData[entry] = {
			value: data[entry as keyof T],
			color: colors[entry as keyof T],
		};
	}
	return proportionChartData;
}

export default SuperWorldPage;
