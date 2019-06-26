import * as React from 'react';
import { Route, withRouter } from 'react-router-dom';
import { MuiThemeProvider } from '@material-ui/core';
import { ThemeProvider } from 'styled-components';

import { MuiTheme, theme } from '../styles';
import { App } from './app';

export class RootContainer extends React.Component {
	public render() {
		console.log('RENDER ROOT')
		return (
			<ThemeProvider theme={theme}>
				<MuiThemeProvider theme={MuiTheme}>
					<Route component={App} />
				</MuiThemeProvider>
			</ThemeProvider>
		);
	}
}

export default withRouter(RootContainer);
