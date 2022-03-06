import Footer from '@components/main/Footer';
import Header from '@components/main/Header';
import React from 'react';
import PageHead from './DefaultHead';

/**
 * A frame to put page content into.
 * @param props The props:
 * * children: The page content.
 */
function AppFrame(props: {
	children: React.ReactNode,
}) {
	return (
		<>
			<PageHead />
			<main>
				<div className="App">
					<Header />
					<div className="web-content-container">
						{props.children}
						<Footer />
					</div>
				</div>
			</main>
		</>
	);
}

export default AppFrame;
