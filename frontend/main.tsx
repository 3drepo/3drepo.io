import 'simplebar';

const requireAll = (r) => r.keys().forEach(r);

// @ts-ignore
requireAll(require.context('./css', true, /\.css$/));

// css from libs
import 'simplebar/dist/simplebar.min.css';
import 'angular-material/angular-material.min.css';
import 'font-awesome/css/font-awesome.min.css';
import './services/fontAwesome';

// TypeScript compiled globals
import { UnityUtil } from './globals/unity-util';
import { Pin } from './globals/pin';
import { Viewer } from './globals/viewer';

import './styles/global';

/* import { TDR } from './components/init'; */

window.UnityUtil = UnityUtil;
window.Viewer = Viewer;
window.Pin = Pin;

/* window.TDR = TDR;

// Initialise 3D Repo
window.TDR(); */

// @ts-ignore
requireAll(require.context('./components', true, /\.css$/));
// @ts-ignore
requireAll(require.context('./components', true, /\.pug$/));

/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Import all the third party stuff
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router'
import 'normalize.css/normalize.css';
import Root from './routes/index';
import { store, history } from './helpers/migration';

const render = () => {
	ReactDOM.render(
		<Provider store={store} >
			<ConnectedRouter history={history} >
				<Root />
			</ConnectedRouter>
		</Provider>,
		document.getElementById('app')
	);
};

render();
