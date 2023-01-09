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

import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useRouteMatch, Switch, Redirect, useLocation } from 'react-router-dom';

import { discardSlash } from '@/v5/services/routing/routing';
import { DashboardParams, NOT_FOUND_ROUTE_PATH } from '@/v5/ui/routes/routes.constants';
import { UsersActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { DashboardFooter } from '@components/shared/dashboardFooter';
import { formatMessage } from '@/v5/services/intl';
import { Route } from '@/v5/services/routing/route.component';
import { Federations } from './federations';
import { Containers } from './containers';
import { UserPermissions } from './userPermissions/userPermissions.component';
import { ProjectPermissions } from './projectPermissions/projectPermissions.component';
import { Content, DashboardScroll } from './projects.styles';
import { ProjectSettings } from './projectSettings/projectSettings.component';
import { Board } from './board/board.component';

export const ProjectContent = () => {
	const { teamspace } = useParams<DashboardParams>();
	const { pathname } = useLocation();
	let { path } = useRouteMatch();
	path = discardSlash(path);

	useEffect(() => {
		UsersActionsDispatchers.fetchUsers(teamspace);
	}, [teamspace]);

	return (
		<DashboardScroll>
			<Content>
				<Switch>
					<Route exact path={path}>
						project content
					</Route>
					<Route title={formatMessage({ id: 'pageTitle.federations', defaultMessage: ':project - Federations' })} exact path={`${path}/t/federations`}>
						<Federations />
					</Route>
					<Route title={formatMessage({ id: 'pageTitle.containers', defaultMessage: ':project - Containers' })} exact path={`${path}/t/containers`}>
						<Containers />
					</Route>
					<Route title={formatMessage({ id: 'pageTitle.issuesAndRisks', defaultMessage: ':project - Issues and risks' })} exact path={`${path}/t/board/:type/:containerOrFederation?`}>
						<Board />
					</Route>
					<Route title={formatMessage({ id: 'pageTitle.issuesAndRisks', defaultMessage: ':project - Issues and risks' })} exact path={`${path}/t/board`}>
						<Redirect to={`${discardSlash(pathname)}/issues`} />
					</Route>
					<Route title={formatMessage({ id: 'pageTitle.tasks', defaultMessage: ':project - Tasks' })} exact path={`${path}/t/tasks`}>
						Tasks
					</Route>
					<Route title={formatMessage({ id: 'pageTitle.projectSettings', defaultMessage: ':project - Project Settings' })} exact path={`${path}/t/project_settings`}>
						<ProjectSettings />
					</Route>
					<Route title={formatMessage({ id: 'pageTitle.projectPermissions', defaultMessage: ':project - Project Permissions' })} exact path={`${path}/t/project_permissions`}>
						<ProjectPermissions />
					</Route>
					<Route title={formatMessage({ id: 'pageTitle.userPermissions', defaultMessage: ':project - User Permissions' })} exact path={`${path}/t/user_permissions`}>
						<UserPermissions />
					</Route>
					<Route path="*">
						<Redirect to={NOT_FOUND_ROUTE_PATH} />
					</Route>
				</Switch>
			</Content>
			<DashboardFooter variant="light" />
		</DashboardScroll>
	);
};
