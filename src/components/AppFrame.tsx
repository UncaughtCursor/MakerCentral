/* eslint-disable react/require-default-props */
import Footer from '@components/main/Footer';
import Header from '@components/main/Header';
import { initAnalytics } from '@scripts/site/FirebaseUtil';
import React from 'react';
import CookieConsent from 'react-cookie-consent';
import PageHead from './DefaultHead';

/**
 * A frame to put page content into.
 * @param props The props:
 * * title (Optional) The title of the page.
 * * description (Optional) The description of the page.
 * * imageUrl (Optional) The image URL of the page.
 * * contentContainerClass (Optional) The class of the content container to override the default.
 * * children: The page content.
 */
function AppFrame(props: {
	title?: string,
	description?: string,
	imageUrl?: string,
	contentContainerClass?: string,
	children: React.ReactNode,
}) {
	return (
		<>
			<PageHead
				title={props.title}
				description={props.description}
				imageUrl={props.imageUrl}
			/>
			<main>
				<div className="App">
					<Header />
					<div className={props.contentContainerClass}>
						{props.children}
						<Footer />
					</div>
				</div>
			</main>
			<CookieConsent
				style={{
					backgroundColor: 'var(--bg-darker)',
				}}
				buttonStyle={{
					backgroundColor: 'var(--hl-med)',
					borderRadius: '5px',
					color: 'var(--text-color)',
					padding: '10px 20px',
				}}
				buttonText="Allow Cookies"
				enableDeclineButton
				declineButtonText="Disallow Cookies"
				flipButtons
				declineButtonStyle={{
					backgroundColor: 'var(--bg-norm)',
					borderRadius: '5px',
					color: 'var(--text-color)',
					padding: '10px 20px',
				}}
				onAccept={initAnalytics}
			>This website uses analytical cookies to help me improve the site experience.&nbsp;
				But if you prefer more privacy, that&apos;s cool too.
			</CookieConsent>
		</>
	);
}

AppFrame.defaultProps = {
	contentContainerClass: 'web-content-container',
};

export default AppFrame;
