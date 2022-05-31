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
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { StylesProvider } from '@mui/styles';
import { ThemeProvider } from 'styled-components';

import { theme } from '@/v5/ui/themes/theme';
import { AuthHooksSelectors } from '@/v5/services/selectorsHooks/authSelectors.hooks';
import { AuthActionsDispatchers } from '@/v5/services/actionsDispatchers/authActions.dispatchers';
import { TeamspacesActionsDispatchers } from '@/v5/services/actionsDispatchers/teamspacesActions.dispatchers';
import { getIntlProviderProps } from '@/v5/services/intl';
import { IntlProvider } from 'react-intl';
import { enableKickedOutEvent } from '@/v5/services/realtime/auth.events';
import { ModalsDispatcher } from '@components/shared/modals';
import { MainRoute } from './dashboard';
import { V4Adapter } from '../v4Adapter/v4Adapter';

export const Root = () => {
	const isAuthenticated: boolean = AuthHooksSelectors.selectIsAuthenticated();
	const authenticationFetched: boolean = AuthHooksSelectors.selectAuthenticationFetched();

	useEffect(() => {
		if (!authenticationFetched) {
			AuthActionsDispatchers.authenticate();
		}
	}, [authenticationFetched]);

	useEffect(() => {
		if (isAuthenticated) {
			TeamspacesActionsDispatchers.fetch();
		}
	}, [isAuthenticated]);

	useEffect(enableKickedOutEvent);

	return (
		<ThemeProvider theme={theme}>
			<MuiThemeProvider theme={theme}>
				<StylesProvider injectFirst>
					<IntlProvider {...getIntlProviderProps()}>
						<V4Adapter>
							<MainRoute />
							<ModalsDispatcher />
						</V4Adapter>
					</IntlProvider>
				</StylesProvider>
			</MuiThemeProvider>
		</ThemeProvider>
	);
};
