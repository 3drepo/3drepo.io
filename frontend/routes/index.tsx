import { MuiThemeProvider } from '@material-ui/core';
import * as React from 'react';
import { withRouter, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { theme, MuiTheme } from '../styles';
import { GlobalStyle } from '../styles/global';

import { App } from './app';

export class RootContainer extends React.Component {
	public render() {
		return (
			<ThemeProvider theme={theme}>
				<MuiThemeProvider theme={MuiTheme}>
					<GlobalStyle />
					<Route component={App} />
				</MuiThemeProvider>
			</ThemeProvider>
		);
	}
}

export default withRouter(RootContainer);
