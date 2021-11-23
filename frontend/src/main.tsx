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
import { Route, Switch } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';
import 'normalize.css/normalize.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import '@/v4/services/fontAwesome';
import 'simplebar/dist/simplebar.min.css';

import 'simplebar';
import { dispatch, history, store } from '@/v4/modules/store';
import V4Root from '@/v4/routes/index';
import { Root as V5Root } from '@/v5/ui/routes';

import { IS_DEVELOPMENT } from '@/v4/constants/environment';
import { UnityUtil } from '@/globals/unity-util';
import { clientConfigService } from '@/v4/services/clientConfig';
import * as OfflinePluginRuntime from 'offline-plugin/runtime';
import { initializeIntl } from '@/v5/services/intl';
import { initializeActionsDispatchers } from '@/v5/services/actionsDispatchers/actionsDistpatchers.helper';

window.UnityUtil = UnityUtil;

initializeActionsDispatchers(dispatch);

initializeIntl(navigator.language);

const render = () => {
	ReactDOM.render(
		<Provider store={store as any}>
			<ConnectedRouter history={history as History}>
				<Switch>
					<Route path="/v5"><V5Root /></Route>
					<Route><V4Root /></Route>
				</Switch>
			</ConnectedRouter>
		</Provider>,
		document.getElementById('app'),
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
	OfflinePluginRuntime.install();
}
