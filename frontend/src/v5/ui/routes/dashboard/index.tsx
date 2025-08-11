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

import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyle } from '@/v5/ui/themes/global';
import { formatMessage } from '@/v5/services/intl';
import { NotFound } from '@/v5/ui/routes/notFound';
import { DashboardProjectLayout } from '@components/dashboard/dashboardProjectLayout/dashboardProjectLayout.component';
import { DashboardViewerLayout } from '@components/dashboard/dashboardViewerLayout/dashboardViewerLayout.component';
import { AuthenticationRedirect } from '@/v5/services/routing/authenticationRedirect.component';
import { discardSlash } from '@/v5/helpers/url.helper';
import { TeamspaceSelection } from '../teamspaceSelection';
import { AuthPage } from '../authPage/authPage.component';
import { Viewer } from '../viewer/viewer';
import {
	NOT_FOUND_ROUTE_PATH,
	PRIVACY_ROUTE,
} from '../routes.constants';
import { TeamspaceLayout } from './teamspaces/teamspaceLayout/teamspaceLayout.component';
import { useEffect } from 'react';
import { AuthActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { AuthHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { CalibrationContextComponent } from './projects/calibration/calibrationContext';
import { authBroadcastChannel } from '@/v5/store/auth/authBrodcastChannel';
import { RouteTitle } from '@/v5/services/routing/routeTitle.component';
import { ProjectsList } from './teamspaces/projects/projectsList.component';
import { UsersList } from './teamspaces/users/usersList.component';
import { TeamspaceSettings } from './teamspaces/settings/teamspaceSettings.component';
import { Jobs } from './teamspaces/jobs/jobs.component';
import { TermsLegalPaper } from '@components/legal/terms.component';
import { LegalLayout } from '@components/legal/LegalLayout/legalLayout.component';
import { CookiesLegalPaper } from '@components/legal/cookies.component';
import { Federations } from './projects/federations/federations.component';
import { Containers } from './projects/containers/containers.component';
import { Board } from './projects/board/board.component';
import { Drawings } from './projects/drawings/drawings.component';
import { ProjectSettings } from './projects/projectSettings/projectSettings.component';
import { TicketsContent } from './projects/tickets/ticketsContent.component';
import { ProjectPermissions } from './projects/projectPermissions/projectPermissions.component';
import { UserPermissions } from './projects/userPermissions/userPermissions.component';
import { useKanbanNavigationData } from '@/v5/helpers/kanban.hooks';

export const MainRoute = () => {
	const { pathname } = useLocation();
	const authenticationFetched: boolean = AuthHooksSelectors.selectAuthenticationFetched();
	const hasPermissions = !TeamspacesHooksSelectors.selectPermissionsOnUIDisabled();

	const { title: kanbanTitle, shouldRenderContent: shouldRenderKanbanContent, issuesOrRisksEnabled, riskEnabled, issuesEnabled } = useKanbanNavigationData();

	useEffect(() => {
		if (!authenticationFetched) {
			AuthActionsDispatchers.authenticate();
		} else {
			authBroadcastChannel.onmessage = (ev) => AuthActionsDispatchers.setSessionAuthenticatedTeamspaceSuccess(ev.data);
		}
	}, [authenticationFetched]);

	return (
		<CalibrationContextComponent>
			<GlobalStyle />
			<Routes>
				<Route path="auth" element={<RouteTitle title={formatMessage({ id: 'pageTitle.auth', defaultMessage: 'Authenticate' })}><AuthPage /></RouteTitle>} />
				<Route element={<LegalLayout />}>
					<Route path="terms" element={<RouteTitle title={formatMessage({ id: 'pageTitle.terms', defaultMessage: 'Terms & Conditions' })}><TermsLegalPaper /></RouteTitle>} />
					<Route path="cookies" element={<RouteTitle title={formatMessage({ id: 'pageTitle.cookies', defaultMessage: 'Cookies' })}><CookiesLegalPaper /></RouteTitle>} />
					<Route path="privacy" element={<Navigate to={PRIVACY_ROUTE} replace />} />
				</Route>
				<Route index element={<Navigate to="dashboard" replace />} />
				<Route element={<AuthenticationRedirect />}>
					<Route path="dashboard" element={<RouteTitle title={formatMessage({ id: 'pageTitle.teamspaceSelection', defaultMessage: 'Teamspaces' })}><TeamspaceSelection /></RouteTitle>} />
					<Route path="dashboard/:teamspace">
						<Route path="t/*" element={<TeamspaceLayout />}>
							<Route index element={<Navigate to="projects" replace />} />
							<Route path={'projects'} element={<RouteTitle title={formatMessage({ id: 'pageTitle.teamspace.projects', defaultMessage: ':teamspace - Projects' })}><ProjectsList /></RouteTitle>} />
							<Route path={'jobs'} element={<RouteTitle title={formatMessage({ id: 'pageTitle.teamspace.jobs', defaultMessage: ':teamspace - Jobs' })}><Jobs /></RouteTitle>} />
							<Route path={'settings'} element={<RouteTitle title={formatMessage({ id: 'pageTitle.teamspace.settings', defaultMessage: ':teamspace - Settings' })}><TeamspaceSettings /></RouteTitle>} />
							<Route path={'users'} element={<RouteTitle title={formatMessage({ id: 'pageTitle.teamspace.users', defaultMessage: ':teamspace - Users' })}><UsersList /></RouteTitle>} />
							<Route path="*" element={<Navigate to={NOT_FOUND_ROUTE_PATH} />} />
						</Route>
						<Route index element={<Navigate to="t/projects" replace />} />
					</Route>
					<Route path={'dashboard/:teamspace/:project'} element={<DashboardProjectLayout />}>
						<Route index element={<Navigate to="t/federations" replace />} />
						<Route path="t">
							<Route index element={<Navigate to="federations" replace />} />
							<Route path="federations" element={<RouteTitle title={formatMessage({ id: 'pageTitle.federations', defaultMessage: ':project - Federations' })}><Federations /></RouteTitle>} />
							<Route path="containers" element={<RouteTitle title={formatMessage({ id: 'pageTitle.containers', defaultMessage: ':project - Containers' })}><Containers /></RouteTitle>} />
							<Route path="drawings" element={<RouteTitle title={formatMessage({ id: 'pageTitle.drawings', defaultMessage: ':project - Drawings' })}><Drawings /></RouteTitle>}/>
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
						</Route>
					</Route>
					<Route path="*" element={<RouteTitle title={formatMessage({ id: 'pageTitle.notFound', defaultMessage: 'Page Not Found' })}><NotFound /></RouteTitle>} />
					<Route path="viewer/:teamspace/:project/:containerOrFederation/:revision?" element={<DashboardViewerLayout />}>
						<Route index element={
							<RouteTitle title={formatMessage({ id: 'pageTitle.viewer', defaultMessage: ':containerOrFederation :revision - Viewer' })}>
								<Viewer />
							</RouteTitle>
						} />
					</ Route>
				</Route>
			</Routes>
		</CalibrationContextComponent>
	);
};
