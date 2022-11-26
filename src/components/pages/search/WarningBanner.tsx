import React from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface WarningBannerProps {
	message: React.ReactNode;
	style?: React.CSSProperties;
}

/**
 * A warning banner that displays a message. This is intended to be used
 * during things such as server maintenance or outages.
 * @param props The props.
 * * message: The message to display in the banner. This can be a string or
 * a React node.
 * * style: The style to apply to the banner. This overrides the default style.
 * @returns The warning banner.
 */
function WarningBanner(props: WarningBannerProps) {
	return (
		<div className="warning-banner-wrapper">
			<div className="warning-banner" style={props.style}>
				<WarningAmberIcon />
				{props.message}
			</div>
		</div>
	);
}

export default WarningBanner;
