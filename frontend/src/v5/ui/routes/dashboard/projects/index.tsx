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

import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useRouteMatch, Route, Switch, Redirect } from 'react-router-dom';

import { discardSlash } from '@/v5/services/routing/routing';
import { TeamspacesActionsDispatchers } from '@/v5/services/actionsDispatchers/teamspacesActions.dispatchers';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks/teamspacesSelectors.hooks';
import { ITeamspace } from '@/v5/store/teamspaces/teamspaces.redux';
import { NOT_FOUND_ROUTE_PATH } from '@/v5/ui/routes/routes.constants';
import { Federations } from './federations';
import { Containers } from './containers';

export const ProjectContent = () => {
	const teamspaces: ITeamspace[] = TeamspacesHooksSelectors.selectTeamspaces();
	const { teamspace } = useParams();
	let { path } = useRouteMatch();
	path = discardSlash(path);

	useEffect(() => {
		if (teamspaces.length) {
			TeamspacesActionsDispatchers.fetchUsers(teamspace);
		}
	}, [teamspaces]);

	return (
		<Switch>
			<Route exact path={path}>
				project content
			</Route>
			<Route exact path={`${path}/t/federations`}>
				<Federations />
			</Route>
			<Route exact path={`${path}/t/containers`}>
				<Containers />
			</Route>
			<Route exact path={`${path}/t/settings`}>
				Project settings
			</Route>
			<Route path="*">
				<Redirect to={NOT_FOUND_ROUTE_PATH} />
			</Route>
		</Switch>
	);
};
