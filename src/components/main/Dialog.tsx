import React, { ReactNode, useEffect, useRef } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import OutsideClickHandler from 'react-outside-click-handler';

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
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const modalEl = modalRef.current;
		if (modalEl !== null) {
			if (props.open) {
				disableBodyScroll(modalEl, {
					allowTouchMove: (el) => containedByElement(el, (testEl) => testEl.classList.contains('popup-content')),
				});
			} else enableBodyScroll(modalEl);
		}
	}, [props.open]);

	const closeFn = () => {
		props.onCloseEvent();
	};

	return (
		<>
			<div className={`dark-overlay${props.open ? ' open' : ''}`} />
			<OutsideClickHandler onOutsideClick={closeFn}>
				<div
					className={`popup${props.open ? '' : ' closed'}`}
					ref={modalRef}
				>
					<div className="popup-header">
						{props.title}
						<div
							className="popup-x"
							onClick={closeFn}
							onKeyPress={closeFn}
							tabIndex={0}
							role="button"
						>
							<CloseIcon />
						</div>
					</div>
					<div className="popup-content">
						{props.children}
					</div>
				</div>
			</OutsideClickHandler>
		</>
	);
}

Dialog.defaultProps = {
	children: null,
};

export default Dialog;

/**
 * Determines if the specified element is a descendant of a parent that passes the specified filter.
 * @param el The element to check.
 * @param filterFn The filter function to use.
 * @returns True if the element is a descendant of a parent that passes the filter, false otherwise.
 */
function containedByElement(
	el: HTMLElement | Element,
	filterFn: (el: HTMLElement | Element) => boolean,
) {
	let testEl: HTMLElement | Element | null = el;
	while (testEl !== null) {
		if (filterFn(testEl)) {
			return true;
		}
		testEl = testEl.parentElement;
	}
	return false;
}
