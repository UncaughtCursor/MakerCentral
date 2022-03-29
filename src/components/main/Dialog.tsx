import React, { ReactNode } from 'react';
import CloseIcon from '@mui/icons-material/Close';

/**
 * A popup dialog window that holds elements.
 * @param props The props:
 * * title: The dialog title.
 * * open: Whether or not the popup is currently visible.
 * * onCloseEvent: The event to fire when the close dialog button is pressed.
 */
function Dialog(props: {
	title: string,
	open: boolean,
	onCloseEvent: () => void,
	children?: ReactNode,
}) {
	const closeFn = () => {
		props.onCloseEvent();
	};

	return (
		<div
			className="popup"
			style={{ display: props.open ? '' : 'none' }}
		>
			<div
				className="popup-x"
				onClick={closeFn}
				onKeyPress={closeFn}
				tabIndex={0}
				role="button"
			>
				<CloseIcon />
			</div>
			<h2>{props.title}</h2>
			{props.children}
		</div>
	);
}

Dialog.defaultProps = {
	children: null,
};

export default Dialog;
