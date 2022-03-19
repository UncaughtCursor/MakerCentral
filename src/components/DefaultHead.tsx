import Head from 'next/head';
import React from 'react';

/**
 * The page head for an HTML document.
 */
function PageHead(props: {
	title?: string,
	description?: string,
	imageUrl?: string,
}) {
	return (
		<Head>
			<base href="/" />
			<meta charSet="utf-8" />
			<link rel="icon" href="favicon.ico" />
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=12.0, user-scalable=yes" />
			<meta name="theme-color" content="#191d25" />
			<meta name="description" content={props.description!} />
			<meta name="og:title" content={props.title!} />
			<meta name="og:description" content={props.description!} />
			<meta name="og:type" content="website" />
			{props.imageUrl! !== '' ? (
				<>
					<meta name="og:image" content={props.imageUrl!} />
					<meta name="og:image:width" content="1280" />
					<meta name="og:image:height" content="720" />
				</>
			) : null}
			<link rel="apple-touch-icon" href="logo192.png" />
			<link rel="manifest" href="manifest.json" />
			<title>{props.title!}</title>
		</Head>
	);
}

PageHead.defaultProps = {
	title: 'Music Level Studio',
	description: 'Easily generate traditional and looping music contraptions in Mario Maker 2!',
	imageUrl: '', // TODO: Banner image
};

export default PageHead;
