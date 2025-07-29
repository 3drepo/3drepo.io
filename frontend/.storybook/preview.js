import { theme as V5Theme } from '@/v5/ui/themes/theme';
import { theme as V5ViewerTheme } from '@/v5/ui/routes/viewer/theme';
import { IntlProvider } from 'react-intl';
import { getIntl } from '@/v5/services/intl';
import { GlobalStyle } from '@/v5/ui/themes/global';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { ThemeProvider, createGlobalStyle } from 'styled-components';
import React from 'react';

export const parameters = {
	actions: { argTypesRegex: "^on[A-Z].*" },
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
		expanded: true,
	},
	docs: {
		transformSource: source => source.replace(/WithStyles\(ForwardRef\(/g, "").replace(/\)\)/g, ""),
	},
}

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
