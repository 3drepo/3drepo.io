import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import * as OfflinePluginRuntime from 'offline-plugin/runtime';
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

// css from libs

const requireAll = (r) => r.keys().forEach(r);

// @ts-ignore
requireAll(require.context('./css', true, /\.css$/));

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

(() => {
	if ('serviceWorker' in navigator) {
		OfflinePluginRuntime.install();
	}
})();
