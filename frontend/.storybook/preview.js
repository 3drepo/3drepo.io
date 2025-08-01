/**
 *  Copyright (C) 2025 3D Repo Ltd
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
import { theme as V5Theme } from '@/v5/ui/themes/theme';
import { theme as V5ViewerTheme } from '@/v5/ui/routes/viewer/theme';
import { IntlProvider } from 'react-intl';
import { getIntl } from '@/v5/services/intl';
import { GlobalStyle } from '@/v5/ui/themes/global';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { ThemeProvider, createGlobalStyle } from 'styled-components';

const preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
			expanded: true,
		},
		docs: {
			transformSource: source => source.replace(/WithStyles\(ForwardRef\(/g, "").replace(/\)\)/g, ""),
		},
	},
};

export default preview;

const V5_THEME = "V5";
const V5_VIEWER_THEME = "V5 Viewer";

export const globalTypes = {
	theme: {
		name: 'Theme',
		description: 'Global theme for components',
		defaultValue: V5_VIEWER_THEME,
		toolbar: {
			icon: 'circlehollow',
			// Array of plain string values or MenuItem shape (see below)
			items: [
				{ value: V5_THEME, icon: 'circlehollow', title: V5_THEME },
				{ value: V5_VIEWER_THEME, icon: 'circle', title: V5_VIEWER_THEME },
			],
			// Property that specifies if the name of the item will be displayed
			showName: true,
			// Change title based on selected value
			dynamicTitle: true,
		},
	},
};

const getTheme = (context) => {
	const theme = context.parameters.theme || context.globals.theme
	return theme === V5_THEME ? V5Theme : V5ViewerTheme;
};

const GlobalStorybookStyle = createGlobalStyle`
	body {
		overflow-y: scroll;
	}
`;

const withThemeProvider = (Story, context)=>{
	const theme = getTheme(context);

	return (
		<ThemeProvider theme={theme}>
			<MuiThemeProvider theme={theme}>
				<GlobalStyle />
				<GlobalStorybookStyle />
				<Story {...context} />
			</MuiThemeProvider>
		</ThemeProvider>
	)
}

export const decorators = [
	withThemeProvider,
	(Story) => (
		<IntlProvider {...getIntl()}>
			<Story />
		</IntlProvider>
	),
];
