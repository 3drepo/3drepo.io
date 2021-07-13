/**
 *  Copyright (C) 2021 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
	require('offline-plugin/runtime').install();
}
