import { ConnectedRouter } from 'connected-react-router';
import 'font-awesome/css/font-awesome.min.css';
import 'normalize.css/normalize.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import 'simplebar';
import 'simplebar/dist/simplebar.min.css';

import { history, store } from './modules/store';
import Root from './routes/index';
import './styles/global';

import { IS_DEVELOPMENT } from './constants/environment';
import { UnityUtil } from './globals/unity-util';
import { clientConfigService } from './services/clientConfig';
import './services/fontAwesome';

window.UnityUtil = UnityUtil;

const render = () => {
	ReactDOM.render(
		// tslint:disable-next-line: jsx-wrap-multiline
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
