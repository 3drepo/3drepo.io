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
import { useLocation, Routes, Route, Navigate } from 'react-router-dom';

import { DashboardParams, NOT_FOUND_ROUTE_PATH } from '@/v5/ui/routes/routes.constants';
import { UsersActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { formatMessage } from '@/v5/services/intl';
import { discardSlash } from '@/v5/helpers/url.helper';
import { Federations } from '../federations';
import { Containers } from '../containers';
import { UserPermissions } from '../userPermissions/userPermissions.component';
import { ProjectPermissions } from '../projectPermissions/projectPermissions.component';
import { ProjectSettings } from '../projectSettings/projectSettings.component';
import { Board } from '../board/board.component';
import { TicketsContent } from '../tickets/ticketsContent.component';
import { Drawings } from '../drawings/drawings.component';
import { useKanbanNavigationData } from '@/v5/helpers/kanban.hooks';
import { ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { isEmpty } from 'lodash';
import { RouteTitle } from '@/v5/services/routing/routeTitle.component';
import { NotFound } from '../../../notFound';

export const ProjectContent = () => {
	const { teamspace } = useParams<DashboardParams>();
	const { pathname } = useLocation();
	const { title: kanbanTitle, shouldRenderContent: shouldRenderKanbanContent, issuesOrRisksEnabled, riskEnabled, issuesEnabled } = useKanbanNavigationData();
	const hasPermissions = !TeamspacesHooksSelectors.selectPermissionsOnUIDisabled();
	const isFetchingAddons = TeamspacesHooksSelectors.selectIsFetchingAddons();
	const isFetchingProject = isEmpty(ProjectsHooksSelectors.selectCurrentProjectDetails());
	const isLoadingPermissions = isFetchingAddons || isFetchingProject;
	
	useEffect(() => {
		UsersActionsDispatchers.fetchUsers(teamspace);
	}, [teamspace]);
	
	if (isLoadingPermissions) return <></>;

	return (
		<Routes>
			<Route index element={<Navigate to="federations" replace />} />
			<Route path="federations" element={<RouteTitle title={formatMessage({ id: 'pageTitle.federations', defaultMessage: ':project - Federations' })}><Federations /></RouteTitle>} />
			<Route path="containers" element={<RouteTitle title={formatMessage({ id: 'pageTitle.containers', defaultMessage: ':project - Containers' })}><Containers /></RouteTitle>} />
			<Route path="drawings" element={<RouteTitle title={formatMessage({ id: 'pageTitle.drawings', defaultMessage: ':project - Drawings' })}><Drawings /></RouteTitle>} />
			{(shouldRenderKanbanContent) &&
				<Route path="board/:type/:containerOrFederation?" element={issuesOrRisksEnabled && <Board />} />
			}
			{issuesEnabled && (
				<Route path="board" element={<RouteTitle title={kanbanTitle}><Navigate to={`${discardSlash(pathname)}/issues`} /></RouteTitle>} />
			)}
			{(!issuesEnabled && riskEnabled) && (
				<Route path="board" element={<RouteTitle title={kanbanTitle}><Navigate to={`${discardSlash(pathname)}/risks`} /></RouteTitle>} />
			)}
			<Route path="tickets/*" element={<RouteTitle title={formatMessage({ id: 'pageTitle.tickets', defaultMessage: ':project - Tickets' })}><TicketsContent /></RouteTitle>} />
			<Route path="project_settings" element={<RouteTitle title={formatMessage({ id: 'pageTitle.projectSettings', defaultMessage: ':project - Project Settings' })}><ProjectSettings /></RouteTitle>} />
			{hasPermissions && (
				<>
					<Route path="project_permissions" element={<RouteTitle title={formatMessage({ id: 'pageTitle.projectPermissions', defaultMessage: ':project - Project Permissions' })}><ProjectPermissions /></RouteTitle>} />
					<Route path="user_permissions" element={<RouteTitle title={formatMessage({ id: 'pageTitle.userPermissions', defaultMessage: ':project - User Permissions' })}><UserPermissions /></RouteTitle>} />
				</>
			)}
			<Route path="*" element={<Navigate to={NOT_FOUND_ROUTE_PATH} />} />
		</Routes>
	);
};
