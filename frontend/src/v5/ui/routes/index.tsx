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
import { useHistory } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { StylesProvider } from '@mui/styles';
import { ThemeProvider } from 'styled-components';

import { theme } from '@/v5/ui/themes/theme';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks/currentUserSelectors.hooks';
import { AuthHooksSelectors } from '@/v5/services/selectorsHooks/authSelectors.hooks';
import { CurrentUserActionsDispatchers } from '@/v5/services/actionsDispatchers/currentUsersActions.dispatchers';
import { AuthActionsDispatchers } from '@/v5/services/actionsDispatchers/authActions.dispatchers';
import { TeamspacesActionsDispatchers } from '@/v5/services/actionsDispatchers/teamspacesActions.dispatchers';
import { getIntlProviderProps } from '@/v5/services/intl';
import { IntlProvider } from 'react-intl';
import { Dashboard } from './dashboard';
import { V4Adapter } from '../v4Adapter/v4Adapter';

export const Root = () => {
	const history = useHistory();
	const userName: string = CurrentUserHooksSelectors.selectUsername();
	const isAuthenticated: boolean | null = AuthHooksSelectors.selectIsAuthenticated();

	useEffect(() => {
		AuthActionsDispatchers.authenticate();
	}, []);
	useEffect(() => {
		if (userName) {
			CurrentUserActionsDispatchers.fetchUser(userName);
		}

		if (isAuthenticated) {
			TeamspacesActionsDispatchers.fetch();
		}

		if (!isNull(isAuthenticated) && !isAuthenticated) {
			history.push('/v5/login');
		}
	}, [userName, isAuthenticated]);

	return (
		<ThemeProvider theme={theme}>
			<MuiThemeProvider theme={theme}>
				<StylesProvider injectFirst>
					<IntlProvider {...getIntlProviderProps()}>
						<V4Adapter>
							<Dashboard />
						</V4Adapter>
					</IntlProvider>
				</StylesProvider>
			</MuiThemeProvider>
		</ThemeProvider>
	);
};
