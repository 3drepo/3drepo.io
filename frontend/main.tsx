import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import 'normalize.css/normalize.css';
import 'simplebar/dist/simplebar.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'simplebar';

import './styles/global';
import Root from './routes/index';
import { store, history } from './helpers/migration';

import { UnityUtil } from './globals/unity-util';
import { Pin } from './globals/pin';
import { Viewer } from './globals/viewer';
import './services/fontAwesome';
import { IS_DEVELOPMENT, IS_MAINTENANCE } from './constants/environment';

// css from libs

const requireAll = (r) => r.keys().forEach(r);

// @ts-ignore
requireAll(require.context('./css', true, /\.css$/));

window.UnityUtil = UnityUtil;
window.Viewer = Viewer;
window.Pin = Pin;

// @ts-ignore
requireAll(require.context('./components', true, /\.css$/));
// @ts-ignore
requireAll(require.context('./components', true, /\.pug$/));

const render = () => {
	ReactDOM.render(
		<Provider store={store} >
			<ConnectedRouter history={history}>
				<Root />
			</ConnectedRouter>
		</Provider>,
		document.getElementById('app')
	);
};

const initApp = () => {
	if (!window.ClientConfig) {
		console.error('ClientConfig has not been provided...');
		return;
	}

	if (!IS_MAINTENANCE) {
		render();
	}

	if (window.ClientConfig.VERSION) {
		/* tslint:disable */
		console.log(`===== 3D REPO - Version ${window.ClientConfig.VERSION} =====`);
		/* tslint:enable */
	} else {
		console.error('No version number in config...');
	}
};

initApp();

if (!IS_DEVELOPMENT) {
	// tslint:disable-next-line: no-var-requires
	require('offline-plugin/runtime').install();
}
