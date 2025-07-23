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

import { useMatch, useLocation, Routes, Navigate } from 'react-router-dom';
import { GlobalStyle } from '@/v5/ui/themes/global';
import { formatMessage } from '@/v5/services/intl';
import { NotFound } from '@/v5/ui/routes/notFound';
import { DashboardProjectLayout } from '@components/dashboard/dashboardProjectLayout/dashboardProjectLayout.component';
import { DashboardViewerLayout } from '@components/dashboard/dashboardViewerLayout/dashboardViewerLayout.component';
import { Route } from '@/v5/services/routing/route.component';
import { AuthenticatedRoute } from '@/v5/services/routing/authenticatedRoute.component';
import { discardSlash } from '@/v5/helpers/url.helper';
import { TeamspaceSelection } from '../teamspaceSelection';
import { TeamspaceContent } from './teamspaces/teamspaceContent/teamspaceContent.component';
import { ProjectContent } from './projects/projectContent/projectContent';
import { AuthPage } from '../authPage/authPage.component';
import { Viewer } from '../viewer/viewer';
import {
	DASHBOARD_ROUTE,
	AUTH_PATH,
	PROJECT_ROUTE_BASE,
	PROJECT_ROUTE_BASE_TAB,
	TEAMSPACE_ROUTE_BASE,
	TEAMSPACE_ROUTE_BASE_TAB,
	VIEWER_ROUTE,
} from '../routes.constants';
import { LegalRoutes } from '../legal';
import { TeamspaceLayout } from './teamspaces/teamspaceLayout/teamspaceLayout.component';
import { useEffect } from 'react';
import { AuthActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { AuthHooksSelectors } from '@/v5/services/selectorsHooks';
import { CalibrationContextComponent } from './projects/calibration/calibrationContext';
import { authBroadcastChannel } from '@/v5/store/auth/authBrodcastChannel';

export const MainRoute = () => {
	const match = useMatch('*');
	const path = match?.pathname || '';
	const { pathname } = useLocation();
	const authenticationFetched: boolean = AuthHooksSelectors.selectAuthenticationFetched();

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
				<Route title={formatMessage({ id: 'pageTitle.auth', defaultMessage: 'Authenticate' })} path={AUTH_PATH} element={<AuthPage />} />
				<Route path={`${path}/(terms|privacy|cookies)`} element={<LegalRoutes path={path} />} />
				<AuthenticatedRoute title={formatMessage({ id: 'pageTitle.teamspaceSelection', defaultMessage: 'Teamspaces' })} path={DASHBOARD_ROUTE} element={<TeamspaceSelection />} />
				<AuthenticatedRoute path={`${TEAMSPACE_ROUTE_BASE}/(t|t/.*)?`} element={
					<TeamspaceLayout>
						<Routes>
							<Route path={TEAMSPACE_ROUTE_BASE} element={<Navigate to={`${discardSlash(pathname)}/t/projects`} replace />} />
							<Route path={TEAMSPACE_ROUTE_BASE_TAB} element={<Navigate to={`${discardSlash(pathname)}/projects`} replace />} />
							<Route path={`${TEAMSPACE_ROUTE_BASE}/`} element={<TeamspaceContent />} />
						</Routes>
					</TeamspaceLayout>
				} />
				<AuthenticatedRoute path={PROJECT_ROUTE_BASE} element={
					<DashboardProjectLayout>
						<Routes>
							<Route path={PROJECT_ROUTE_BASE} element={<Navigate to={`${discardSlash(pathname)}/t/federations`} replace />} />
							<Route path={PROJECT_ROUTE_BASE_TAB} element={<Navigate to={`${discardSlash(pathname)}/federations`} replace />} />
							<Route path={PROJECT_ROUTE_BASE} element={<ProjectContent />} />
						</Routes>
					</DashboardProjectLayout>
				} />
				<AuthenticatedRoute title={formatMessage({ id: 'pageTitle.viewer', defaultMessage: ':containerOrFederation :revision - Viewer' })} path={VIEWER_ROUTE} element={
					<DashboardViewerLayout>
						<Viewer />
					</DashboardViewerLayout>
				} />
				<AuthenticatedRoute path={path} element={<Navigate to={`${discardSlash(pathname)}/dashboard`} replace />} />
				<AuthenticatedRoute title={formatMessage({ id: 'pageTitle.notFound', defaultMessage: 'Page Not Found' })} path="*" element={<NotFound />} />
			</Routes>
		</CalibrationContextComponent>
	);
};
