import { MCWorldLevelPreview } from '@data/types/MCBrowserTypes';
import React from 'react';

/**
 * A table that displays a list of levels in the Super World.
 * @param props The props:
 * - levels: The level previews to display.
 */
function SuperWorldLevelListings(props: {
	levels: MCWorldLevelPreview[],
}) {
	return (
		<div className="level-preview-table-container">
			<table className="level-preview-table">
				<thead>
					<tr>
						<th>#</th>
						<th>Name</th>
						<th>Likes</th>
					</tr>
				</thead>
				<tbody>
					{props.levels.map((level, i) => (
						<tr key={level.id}>
							<td>{i + 1}</td>
							<td><a
								href={`/levels/view/${level.id}`}
								style={{
									color: 'var(--color-text)',
								}}
							>{level.name}
           </a>
							</td>
							<td>{level.numLikes.toLocaleString()}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default SuperWorldLevelListings;
