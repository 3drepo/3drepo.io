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

import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { ThemeProvider } from 'styled-components';

import { theme } from '@/v5/ui/themes/theme';
import { ModalsDispatcher } from '@components/shared/modalsDispatcher/modalsDispatcher.component';
import { IntercomProvider } from 'react-use-intercom';
import { clientConfigService } from '@/v4/services/clientConfig';
import { MainRoute } from './dashboard';
import { V4Adapter } from '../v4Adapter/v4Adapter';
import { NewUserHandler } from '@components/shared/sso/newUserHandler/newUserHandler.component';

export const Root = () => {
	const { intercomLicense } = clientConfigService;

	return (
		<ThemeProvider theme={theme}>
			<MuiThemeProvider theme={theme}>
				<V4Adapter>
					<IntercomProvider appId={intercomLicense}>
						<MainRoute />
						<NewUserHandler />
						<ModalsDispatcher />
					</IntercomProvider>
				</V4Adapter>
			</MuiThemeProvider>
		</ThemeProvider>
	);
};
