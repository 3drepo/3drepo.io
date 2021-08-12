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

import DayJsUtils from '@date-io/dayjs';
import { MuiThemeProvider } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Route } from 'react-router-dom';
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

export default RootContainer;
