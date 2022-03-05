import React from 'react';

import ProjectsPage from '@components/pages/ProjectsPage';

import SettingsPage from '@components/pages/SettingsPage';
import Gate from '@components/main/Gate';
import News from '@components/pages/News';
import Admin from '@components/pages/Admin';
import LevelBrowser from '@components/pages/browser/LevelBrowser';
import LevelPage from '@components/pages/browser/LevelPage';
import Header from './components/main/Header';
import Footer from './components/main/Footer';

import Home from './components/pages/Home';
import About from './components/pages/About';
import Builder from './components/pages/Builder';
import Editor from './components/pages/editor/Editor';

/**
 * The main app component.
 */
function App() {
	return (
		<Router>
			<div className="App">
				<Header />
				<div className="web-content-container">
					<Switch>
						<Route exact path="/">
							<Home />
						</Route>
						<Route path="/about">
							<About />
						</Route>
						<Route path="/news">
							<News />
						</Route>
						<Route exact path="/builder">
							<Gate requireEA showLogout={false}>
								<Builder />
							</Gate>
						</Route>
						<Route path="/builder/editor">
							<Gate requireEA showLogout={false}>
								<Editor />
							</Gate>
						</Route>
						<Route path="/projects">
							<ProjectsPage />
						</Route>
						<Route path="/settings">
							<SettingsPage />
						</Route>
						<Route exact path="/levels">
							<LevelBrowser />
						</Route>
						<Route path="/levels/view/:id">
							<LevelPage />
						</Route>
						{ /* FIXME: COMMENT IN PROD */ }
						{/* <Route path="/admin">
							<Admin />
						</Route> */}
					</Switch>
					<Footer />
				</div>
			</div>
		</Router>
	);
}

export default App;
