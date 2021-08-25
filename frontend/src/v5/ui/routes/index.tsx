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

import { theme } from '@/v5/ui/themes/theme';
import { MuiThemeProvider } from '@material-ui/core';

import { ThemeProvider } from 'styled-components';
import React from 'react';
import { useRouteMatch, Route, Switch, Link } from 'react-router-dom';

const DummyContent = ({title, item}) => (
	<>
		{title}:
		<ul>
			<li>{item} 1</li>
			<li>{item} 2</li>
			<li>{item} 3</li>
			<li>{item} 4</li>
		</ul>
	</>
);

const DashboardContent = () => {
	const { path } = useRouteMatch();
	return (
		<Switch>
			<Route exact path={`${path}`}>
				Teamspaces!
			</Route>
			<Route path={`${path}/federations`}>
				<DummyContent title="Federations" item="federation" />
			</Route>
			<Route path={`${path}/containers`}>
				<DummyContent title="Containers" item="containers" />
			</Route>
			<Route path={`${path}/tasks`}>
				<DummyContent title="Tasks" item="task" />
			</Route>
			<Route path={`${path}/users`}>
				<DummyContent title="Users" item="user" />
			</Route>
		</Switch>
	);
};

const Dashboard = () => {
	const { url } = useRouteMatch();
	return (
		<>
			<h1>logo</h1>

			<Link to={`${url}/federations`}> federations</Link>
			<Link to={`${url}/containers`}> containers</Link>
			<br />
			<DashboardContent />
		</>
	);
};

export const Root = () => (
	<ThemeProvider theme={theme}>
		<MuiThemeProvider theme={theme}>
			<Dashboard />
		</MuiThemeProvider>
	</ThemeProvider>
);
