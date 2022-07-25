import { MCUserDocData } from '@data/types/MCBrowserTypes';
import React from 'react';
import LikeIcon from '@mui/icons-material/Favorite';
import LevelsIcon from '@mui/icons-material/EmojiFlags';
import IconValueRow from './IconValueRow';

/**
 * A preview of a user's data.
 * @param props The props:
 * - userData: The user data to display a preview of.
 */
function UserPreview(props: {
	userData: MCUserDocData
}) {
	return (
		<a className="user-preview" href={`/users/${props.userData.id}`}>
			<h3>{props.userData.name}</h3>
			<div style={{
				margin: '0 auto',
			}}
			>
				<IconValueRow values={[
					{
						icon: <LikeIcon style={{ color: 'var(--text-color)' }} />,
						value: props.userData.likes.toLocaleString(),
					},
					{
						icon: <LevelsIcon style={{ color: 'var(--text-color)' }} />,
						value: props.userData.levels.toLocaleString(),
					},
				]}
				/>
			</div>
		</a>
	);
}

export default UserPreview;
