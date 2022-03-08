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
import '../styles/component/LevelGallery.css';
import '../styles/component/TagSelector.css';

import type { AppProps } from 'next/app';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';

TimeAgo.addDefaultLocale(en);

function MyApp({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />;
}

// if ('serviceWorker' in navigator) {
// FIXME: UNCOMMENT IN PROD
// navigator.serviceWorker.register('sw.js', { scope: '/' });
// }

export default MyApp;
