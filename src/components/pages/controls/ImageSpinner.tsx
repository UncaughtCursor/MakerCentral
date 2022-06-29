import React from 'react';
import ImageIcon from '@mui/icons-material/Image';

/**
 * A loading animation that takes up the box of the parent element.
 * @param props The props:
 * * isActive: (Optional) Whether or not to show the spinner.
 */
function ImageSpinner(props: {
	isActive?: boolean,
}) {
	return (
		<div
			className="image-spinner"
			style={{
				display: props.isActive! ? '' : 'none',
			}}
		>
			<ImageIcon style={{
				color: 'var(--bg-norm)',
			}}
			/>
		</div>
	);
}

ImageSpinner.defaultProps = {
	isActive: true,
};

export default ImageSpinner;
