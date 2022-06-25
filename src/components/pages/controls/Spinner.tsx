import React from 'react';
/**
 * An element that displays a loading animation.
 * @param props The props:
 * * isActive: (Optional) Whether or not to show the spinner.
 * * yOfsPx: (Optional) The number of pixels to offset the
 * spinner down from the top of the container.
 * * style: (Optional) A custom style to apply to the spinner.
 */
function Spinner(props: {
	isActive?: boolean,
	yOfsPx?: number,
	style?: React.CSSProperties,
}) {
	const spinnerStyle = {
		...props.style,
		// eslint-disable-next-line no-nested-ternary
		display: props.isActive! ? (props.style?.display ? props.style.display : '') : 'none',
		top: `${props.yOfsPx!}px`,
	};
	console.log(spinnerStyle);
	return (
		<div
			className="lds-dual-ring"
			style={spinnerStyle}
		/>
	);
}

Spinner.defaultProps = {
	isActive: true,
	yOfsPx: 72,
	style: {},
};

export default Spinner;
