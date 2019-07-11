import { ConnectedRouter } from 'connected-react-router';
import 'font-awesome/css/font-awesome.min.css';
import 'normalize.css/normalize.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'simplebar';
import 'simplebar/dist/simplebar.min.css';

import { history, store } from './modules/store';
import Root from './routes/index';
import './styles/global';

import { IS_DEVELOPMENT } from './constants/environment';
import { Pin } from './globals/pin';
import { UnityUtil } from './globals/unity-util';
import { Viewer } from './globals/viewer';
import { clientConfigService } from './services/clientConfig';
import './services/fontAwesome';

// css from libs

const requireAll = (r) => r.keys().forEach(r);

window.UnityUtil = UnityUtil;
window.Viewer = Viewer;
window.Pin = Pin;

// @ts-ignore
requireAll(require.context('./css', true, /\.css$/));

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
	if (clientConfigService.isValid && !clientConfigService.isMaintenanceEnabled) {
		clientConfigService.injectCustomCSS();
		render();
	}

	clientConfigService.logAppVersion();
};

initApp();

if (!IS_DEVELOPMENT) {
	// tslint:disable-next-line: no-var-requires
	require('offline-plugin/runtime').install();
}
