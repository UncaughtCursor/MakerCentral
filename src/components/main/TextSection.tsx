import React, { ReactNode } from 'react';

/**
 * A text section to be displayed to the user.
 * @param props The props:
 * - title: (Optional) The title of the text section.
 * - body: The body of the text section, containing an array of fragment elements.
 */
function TextSection(props: {
	title?: string,
	body: JSX.Element[] | JSX.Element,
}) {
	const usedBody = typeof (props.body as any[]).length === 'number' ? props.body as JSX.Element[] : [props.body] as JSX.Element[];
	// eslint-disable-next-line react/no-array-index-key
	const elements = usedBody.map((node, index) => <p key={index} className="explanatory-text">{node}</p>);
	console.log(elements);
	return (
		<div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px' }}>
			{props.title && <h2 style={{ textAlign: 'left' }}>{props.title}</h2>}
			{elements}
		</div>
	);
}

export default TextSection;
