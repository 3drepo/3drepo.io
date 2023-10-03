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
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import '@/v4/services/fontAwesome';
import 'simplebar/dist/simplebar.min.css';

import 'simplebar';
import { dispatch, history, sagaMiddleware, store } from '@/v4/modules/store';
import V4Root from '@/v4/routes/index';
import { Root as V5Root } from '@/v5/ui/routes';

import { UnityUtil } from '@/globals/unity-util';
import { clientConfigService } from '@/v4/services/clientConfig';
import { getIntlProviderProps, initializeIntl } from '@/v5/services/intl';
import { initializeActionsDispatchers } from '@/v5/helpers/actionsDistpatchers.helper';
import { IntlProvider } from 'react-intl';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Version, VersionContext } from './versionContext';
import { getSocket, initializeSocket, SocketEvents, subscribeToSocketEvent } from './v5/services/realtime/realtime.service';
import { setSocket } from './v4/modules/chat/chat.sagas';
import { ROUTES } from './v4/constants/routes';
import { LOGIN_PATH as V5_LOGIN_PATH, SIGN_UP_PATH as V5_SIGN_UP_PATH } from './v5/ui/routes/routes.constants';
import configAxios from './v4/services/api/config-axios';
import { setSocketIdHeader } from './v5/services/api/default';
import rootSaga from './v4/modules/sagas';

window.UnityUtil = UnityUtil;

initializeActionsDispatchers(dispatch);

initializeIntl(navigator.language);

initializeSocket(clientConfigService.chatConfig);

// Injecting the instance of socket from v5 into v4
setSocket(getSocket());

subscribeToSocketEvent(SocketEvents.CONNECT, () => setSocketIdHeader(getSocket().id));

const render = () => {
	ReactDOM.render(
		<Provider store={store as any}>
			<ConnectedRouter history={history as History}>
				<IntlProvider {...getIntlProviderProps()}>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<Switch>
							<Route exact path="/">
								{/* Using this instead of <Redirect /> to force refresh so that isV5() is updated */}
								{() => window.location.replace('v5/')}
							</Route>
							<Route exact path={ROUTES.SIGN_UP}>
								{/* Using this instead of <Redirect /> to force refresh so that isV5() is updated */}
								{() => window.location.replace(V5_SIGN_UP_PATH + window.location.search)}
							</Route>
							<Route exact path={ROUTES.LOGIN}>
								{/* Using this instead of <Redirect /> to force refresh so that isV5() is updated */}
								{() => window.location.replace(V5_LOGIN_PATH)}
							</Route>
							<Route path="/v5">
								<VersionContext.Provider value={Version.V5}>
									<V5Root />
								</VersionContext.Provider>
							</Route>
							<Route>
								<VersionContext.Provider value={Version.V4}>
									<V4Root />
								</VersionContext.Provider>
							</Route>
						</Switch>
					</LocalizationProvider>
				</IntlProvider>
			</ConnectedRouter>
		</Provider>,
		document.getElementById('app'),
	);
};

const initApp = () => {
	if (process.env.NODE_ENV !== 'test') {
		sagaMiddleware.run(rootSaga);
	}

	if (clientConfigService.isValid && !clientConfigService.isMaintenanceEnabled) {
		clientConfigService.injectCustomCSS();
		render();
	}

	clientConfigService.logAppVersion();

	configAxios();
};

initApp();
