import React, {
	ReactNode, useEffect, useRef, useState,
} from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import OutsideClickHandler from 'react-outside-click-handler';

/**
 * A popup window that activates when an event is emitted in the window.
 * @param props The props:
 * * title: The dialog title.
 * * eventName: The name of the event to listen for.
 * * hideEventName: The name of the event to listen for that hides the popup.
 * * id: (Optional) The id of the popup element's content container.
 * @returns
 */
function EventPopup(props: {
	title: string,
	eventName: string,
	hideEventName?: string | null,
	children?: ReactNode,
	id?: string;
}) {
	const [open, setOpen] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);

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

	useEffect(() => {
		const modalEl = modalRef.current;
		if (modalEl !== null) {
			if (open) disableBodyScroll(modalEl);
			else enableBodyScroll(modalEl);
		}
	}, [open]);

	return (
		<>
			<div className={`dark-overlay${open ? ' open' : ''}`} />
			<OutsideClickHandler onOutsideClick={closeFn}>
				<div
					className={`popup${open ? '' : ' closed'}`}
					ref={modalRef}
				>
					<div className="popup-header">
						<div
							className="popup-x"
							onClick={closeFn}
							onKeyPress={closeFn}
							tabIndex={0}
							role="button"
						>
							<CloseIcon />
						</div>
						{props.title}
					</div>
					<div
						className="popup-content"
						id={props.id!}
					>
						{props.children}
					</div>
				</div>
			</OutsideClickHandler>
		</>
	);
}

EventPopup.defaultProps = {
	id: '',
	children: null,
	hideEventName: null,
};

export default EventPopup;
