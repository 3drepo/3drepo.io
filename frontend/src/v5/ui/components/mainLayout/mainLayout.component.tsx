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
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { Typography, MuiThemeProvider } from '@material-ui/core';
import { theme } from '@/v5/ui/themes/theme';
import { GlobalStyle } from '@/v5/ui/themes/global';

import { AppBar } from '@components/shared/appBar';
import { Content } from './mainLayout.styles';

interface IMainLayout {
	title?: string;
}

export const MainLayout = ({ title }: IMainLayout): JSX.Element => (
	<ThemeProvider theme={theme}>
		<MuiThemeProvider theme={theme}>
			<GlobalStyle />
			<AppBar />
			<Content>
				<Typography variant="h1">{title || 'Basic layout page'}</Typography>
			</Content>
		</MuiThemeProvider>
	</ThemeProvider>
);
