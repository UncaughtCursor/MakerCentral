import React, { ReactNode } from 'react';

/**
 * A section to be displayed to the user to be included in text.
 * @param props The props:
 * - title: (Optional) The title of the text section.
 * - body: The body of the section, containing an array of elements.
 */
function Section(props: {
	title?: string,
	body: JSX.Element[] | JSX.Element,
}) {
	return (
		<div style={{ maxWidth: '600px', margin: '0 auto' }}>
			{props.title && <h2 style={{ textAlign: 'left' }}>{props.title}</h2>}
			{props.body}
		</div>
	);
}

export default Section;
