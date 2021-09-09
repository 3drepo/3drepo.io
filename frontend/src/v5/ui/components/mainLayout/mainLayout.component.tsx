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
import { Typography, MuiThemeProvider, StylesProvider } from '@material-ui/core';
import { theme } from '@/v5/ui/themes/theme';
import { GlobalStyle } from '@/v5/ui/themes/global';

import { AppBar } from '@components/shared/appBar';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { messages as enMessages } from '@/locales/en/messages';
import { messages as esMessages } from '@/locales/es/messages';
import { Content } from './mainLayout.styles';

interface IMainLayout {
	title?: string;
}

i18n.load('en', enMessages);
i18n.load('es', esMessages);

i18n.activate('en');

export const MainLayout = ({ title }: IMainLayout): JSX.Element => (
	<I18nProvider i18n={i18n}>
		<ThemeProvider theme={theme}>
			<MuiThemeProvider theme={theme}>
				<StylesProvider injectFirst>
					<GlobalStyle />
					<AppBar />
					<Content>
						<Typography variant="h1">{title || 'Basic layout page'}</Typography>
					</Content>
				</StylesProvider>
			</MuiThemeProvider>
		</ThemeProvider>
	</I18nProvider>
);
