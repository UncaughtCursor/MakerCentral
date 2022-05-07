import React, { ReactNode, useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';

/**
 * A popup window that activates when an event is emitted in the window.
 * @param props The props:
 * * eventName: The name of the event to listen for.
 * * hideEventName: The name of the event to listen for that hides the popup.
 * * id: (Optional) The id of the popup element.
 * @returns
 */
function EventPopup(props: {
	eventName: string,
	hideEventName?: string | null,
	children?: ReactNode,
	id?: string;
}) {
	const [open, setOpen] = useState(false);

	const openFn = () => {
		setOpen(true);
	};
	const closeFn = () => {
		setOpen(false);
	};

	useEffect(() => {
		if (typeof window !== 'undefined') {
			document.addEventListener(props.eventName, openFn);
			if (props.hideEventName! !== null) document.addEventListener(props.hideEventName!, closeFn);
		}
		return () => {
			if (typeof window !== 'undefined') {
				document.removeEventListener(props.eventName, openFn);
				if (props.hideEventName! !== null) {
					document.removeEventListener(props.hideEventName!, closeFn);
				}
			}
		};
	}, []);

	return (
		<div
			className={`popup${open ? '' : ' closed'}`}
			id={props.id!}
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
			{props.children}
		</div>
	);
}

EventPopup.defaultProps = {
	id: '',
	children: null,
	hideEventName: null,
};

export default EventPopup;
