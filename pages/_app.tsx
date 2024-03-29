import '../styles/globals.css';
import '../styles/App.css';
import '../styles/Page.css';

// Wall of Shame
import '../styles/component/BuildChecker.css';
import '../styles/component/EditorLink.css';
import '../styles/component/EditorMenu.css';
import '../styles/component/EditorView.css';
import '../styles/component/Footer.css';
import '../styles/component/Gate.css';
import '../styles/component/GridDisplayMessage.css';
import '../styles/component/HamburgerMenu.css';
import '../styles/component/Header.css';
import '../styles/component/InstrumentPicker.css';
import '../styles/component/LevelDisplay.css';
import '../styles/component/LevelPage.css';
import '../styles/component/LevelPreview.css';
import '../styles/component/LoginPrompt.css';
import '../styles/component/MarginDisplay.css';
import '../styles/component/MIDIUploader.css';
import '../styles/component/MM2GridEntityDisplay.css';
import '../styles/component/MusicPreviewer.css';
import '../styles/component/Nav.css';
import '../styles/component/Piano.css';
import '../styles/component/PianoRoll.css';
import '../styles/component/PianoRollLine.css';
import '../styles/component/PlaybackControls.css';
import '../styles/component/ProjectConfigPage.css';
import '../styles/component/ProjectList.css';
import '../styles/component/SettingsGroup.css';
import '../styles/component/Spinner.css';
import '../styles/component/TagDisplay.css';
import '../styles/component/TileLengthChooser.css';
import '../styles/component/TrackEditor.css';
import '../styles/component/TrackList.css';
import '../styles/component/UserMenu.css';
import '../styles/component/LevelExpo.css';
import '../styles/component/TagSelector.css';
import '../styles/component/FeedbackControl.css';
import '../styles/component/BookmarkButton.css';
import '../styles/component/Popup.css';
import '../styles/component/LevelCategoryIndex.css';
import '../styles/component/UserProfile.css';
import '../styles/component/DisplayTable.css';
import '../styles/component/Comments.css';
import '../styles/component/Notifications.css';
import '../styles/component/SearchBar.css';
import '../styles/component/LevelListings.css';
import '../styles/component/LandingPage.css';
import '../styles/component/LevelThumbnail.css';
import '../styles/component/SuperWorld.css';
import '../styles/component/Charts.css';
import '../styles/component/UserPreview.css';
import '../styles/component/Banner.css';
import '../styles/component/PromotedLevelView.css';
import '../styles/component/SearchPage.css';
// I know this is bad and I'm sorry

import type { AppProps } from 'next/app';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import { useEffect } from 'react';

TimeAgo.addDefaultLocale(en);

// FIXME: SET TO TRUE IN PROD
export const isProd = true;

// Whether or not to use the popular levels index in case the normal one is down
export const isInBackupMode = false;

/**
 * The app.
 */
function MyApp({ Component, pageProps }: AppProps) {
	useEffect(() => {
		// FIXME: Deal with old cache and turn service worker back on
		/* if (isProd) {
			if ('serviceWorker' in navigator) {
				window.addEventListener('load', () => {
					navigator.serviceWorker.register('sw.js', { scope: '/' });
				});
			}
		} */
	}, []);

	return <Component {...pageProps} />;
}

export default MyApp;
