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

import { useEffect } from 'react';
import { isNull } from 'lodash';
import { useHistory, Switch, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { StylesProvider } from '@mui/styles';
import { ThemeProvider } from 'styled-components';

import { theme } from '@/v5/ui/themes/theme';
import { AuthHooksSelectors } from '@/v5/services/selectorsHooks/authSelectors.hooks';
import { AuthActionsDispatchers } from '@/v5/services/actionsDispatchers/authActions.dispatchers';
import { TeamspacesActionsDispatchers } from '@/v5/services/actionsDispatchers/teamspacesActions.dispatchers';
import { getIntlProviderProps } from '@/v5/services/intl';
import { IntlProvider } from 'react-intl';
import { Dashboard } from './dashboard';
import { V4Adapter } from '../v4Adapter/v4Adapter';
import { UserSignup } from './userSignup/userSignup.component';
import { UserVerification } from './userVerification/userVerification.component';

export const Root = () => {
	const history = useHistory();
	const isAuthenticated: boolean | null = AuthHooksSelectors.selectIsAuthenticated();

	const isRegistrationRoute = () => {
		const registrationRoutes = ['v5/signup', 'v5/register-verify'];
		return registrationRoutes.some((route) => history.location.pathname.endsWith(route));
	};

	useEffect(() => {
		AuthActionsDispatchers.authenticate();
	}, []);

	useEffect(() => {
		if (isAuthenticated) {
			TeamspacesActionsDispatchers.fetch();
		}

		if (!isNull(isAuthenticated)
			&& !isAuthenticated
			&& !isRegistrationRoute()
		) {
			history.push('/v5/login');
		}
	}, [isAuthenticated]);

	return (
		<ThemeProvider theme={theme}>
			<MuiThemeProvider theme={theme}>
				<StylesProvider injectFirst>
					<IntlProvider {...getIntlProviderProps()}>
						<V4Adapter>
							<Switch>
								<Route path="/v5/signup" component={UserSignup} />
								<Route path="/v5/register-verify" component={UserVerification} />
								<Route component={Dashboard} />
							</Switch>
						</V4Adapter>
					</IntlProvider>
				</StylesProvider>
			</MuiThemeProvider>
		</ThemeProvider>
	);
};
