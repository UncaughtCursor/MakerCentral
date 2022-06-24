import React from 'react';
/**
 * An element that displays a loading animation.
 * @param props The props:
 * * isActive: Whether or not to show the spinner.
 * * yOfsPx: The number of pixels to offset the spinner down from the top of the container.
 */
function Spinner(props: {
	isActive?: boolean,
	yOfsPx?: number,
}) {
	return (
		<div
			className="lds-dual-ring"
			style={{ display: props.isActive! ? '' : 'none', top: `${props.yOfsPx!}px` }}
		/>
	);
}

Spinner.defaultProps = {
	isActive: true,
	yOfsPx: 72,
};

export default Spinner;
