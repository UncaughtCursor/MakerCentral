import React from 'react';

/**
 * A link that leads to a different editor page.
 */
function EditorLink(props: {pageNum: number, className?: string,
	onActivate: (arg0: number) => void, children: React.ReactNode}) {
	return (
		<button
			type="button"
			className={props.className}
			onClick={() => { props.onActivate(props.pageNum); }}
		>
			{props.children}
		</button>
	);
}

EditorLink.defaultProps = {
	className: 'editor-link',
};

export default EditorLink;
