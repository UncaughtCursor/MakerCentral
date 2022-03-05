import React, { useState } from 'react';
import './EditorMenu.css';

/**
 * A menu that, when clicked, displays its contents and closes when clicked again.
 */
function EditorMenu(props: {children: React.ReactNode}) {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<div className={isOpen ? 'editor-menu-wrapper' : 'editor-menu-wrapper-hidden'}>
			<div className={isOpen ? 'editor-menu-content' : 'editor-menu-content-hidden'}>
				{props.children}
				<div className={isOpen ? 'editor-menu-close-button' : 'editor-menu-button'} onClick={() => { handleClick(); }}>
					<p>{isOpen ? 'Close Menu' : 'Project Menu'}</p>
				</div>
			</div>
		</div>
	);

	/**
	 * Triggers whenever the menu is toggled.
	 */
	function handleClick() {
		setIsOpen(!isOpen);
	}
}

export default EditorMenu;
