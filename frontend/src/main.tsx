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
import { Routes, Navigate } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';
import 'normalize.css/normalize.css';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import '@/v4/services/fontAwesome';
import 'simplebar/dist/simplebar.min.css';

import 'simplebar';
import { history, sagaMiddleware, store } from '@/v4/modules/store';
import { Root as V5Root } from '@/v5/ui/routes';

import { UnityUtil } from '@/globals/unity-util';
import { clientConfigService } from '@/v4/services/clientConfig';
import { formatMessage, getIntl, initializeIntl } from '@/v5/services/intl';
import { initializeActionsDispatchers } from '@/v5/helpers/actionsDistpatchers.helper';
import { IntlProvider } from 'react-intl';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { getSocket, initializeSocket, SocketEvents, subscribeToSocketEvent } from './v5/services/realtime/realtime.service';
import { setSocket } from './v4/modules/chat/chat.sagas';
import { ROUTES } from './v4/constants/routes';
import configAxios from './v4/services/api/config-axios';
import { setSocketIdHeader } from './v5/services/api/default';
import rootSaga from './v4/modules/sagas';
import { NotFound } from '@/v5/ui/routes/notFound';
import { initializeGoogleTagManager } from './v5/services/googleTagManager';
import { initializeHotjar } from './v5/services/hotjar';
import { dispatch } from './v5/helpers/redux.helpers';
import { Route } from './v5/services/routing/route.component';
import { AUTH_PATH as V5_AUTH_PATH } from './v5/ui/routes/routes.constants';

window.UnityUtil = UnityUtil;

initializeActionsDispatchers(dispatch);

initializeIntl(navigator.language);

initializeSocket(clientConfigService.chatConfig);

initializeHotjar();

initializeGoogleTagManager();

// Injecting the instance of socket from v5 into v4
setSocket(getSocket());

subscribeToSocketEvent(SocketEvents.CONNECT, () => setSocketIdHeader(getSocket().id));

const render = () => {
	ReactDOM.render(
		<Provider store={store as any}>
			<ConnectedRouter history={history}>
				<IntlProvider {...getIntl()}>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<Routes>
							<Route path="/" element={<Navigate to="v5/" />} />
							<Route path={ROUTES.SIGN_UP} element={<Navigate to={{ pathname: V5_AUTH_PATH, search: window.location.search }} replace />} />
							<Route path={ROUTES.LOGIN} element={<Navigate to={V5_AUTH_PATH} replace />} />
							<Route path="/v5/*" element={<V5Root />} />
							<Route title={formatMessage({ id: 'pageTitle.notFound', defaultMessage: 'Page Not Found' })} path="*" element={<NotFound />} />
						</Routes>
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
