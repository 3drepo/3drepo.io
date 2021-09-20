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
import { useRouteMatch, Route, Switch } from 'react-router-dom';

import { discardSlash } from '@/v5/services/routing/routing';
import { Federations } from './federations';
import { Containers } from './containers';

export const ProjectContent = () => {
	let { path } = useRouteMatch();
	path = discardSlash(path);

	return (
		<>
			<Switch>
				<Route exact path={path}>
					project content
				</Route>
				<Route path={`${path}/federations`}>
					<Federations />
				</Route>
				<Route path={`${path}/containers`}>
					<Containers />
				</Route>
				<Route path={`${path}/settings`}>
					Project settings
				</Route>
			</Switch>
		</>
	);
};
