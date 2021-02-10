import React from 'react';

import DayJsUtils from '@date-io/dayjs';
import { MuiThemeProvider } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { withRouter, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { theme, MuiTheme } from '../styles';
import { GlobalStyle } from '../styles/global';

import { App } from './app';

export class RootContainer extends React.Component {
	public render() {
		return (
			<MuiPickersUtilsProvider utils={DayJsUtils}>
				<ThemeProvider theme={theme}>
					<MuiThemeProvider theme={MuiTheme}>
						<GlobalStyle />
						<Route component={App} />
					</MuiThemeProvider>
				</ThemeProvider>
			</MuiPickersUtilsProvider>
		);
	}
}

export default withRouter(RootContainer);
