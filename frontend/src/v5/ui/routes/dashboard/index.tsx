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

import { Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyle } from '@/v5/ui/themes/global';
import { formatMessage } from '@/v5/services/intl';
import { NotFound } from '@/v5/ui/routes/notFound';
import { DashboardProjectLayout } from '@components/dashboard/dashboardProjectLayout/dashboardProjectLayout.component';
import { DashboardViewerLayout } from '@components/dashboard/dashboardViewerLayout/dashboardViewerLayout.component';
import { AuthenticationRedirect } from '@/v5/services/routing/authenticationRedirect.component';
import { TeamspaceSelection } from '../teamspaceSelection';
import { AuthPage } from '../authPage/authPage.component';
import { Viewer } from '../viewer/viewer';
import { PRIVACY_ROUTE } from '../routes.constants';
import { TeamspaceLayout } from './teamspaces/teamspaceLayout/teamspaceLayout.component';
import { useEffect } from 'react';
import { AuthActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { AuthHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { CalibrationContextComponent } from './projects/calibration/calibrationContext';
import { authBroadcastChannel } from '@/v5/store/auth/authBrodcastChannel';
import { RouteTitle } from '@/v5/services/routing/routeTitle.component';
import { TermsLegalPaper } from '@components/legal/terms.component';
import { LegalLayout } from '@components/legal/LegalLayout/legalLayout.component';
import { CookiesLegalPaper } from '@components/legal/cookies.component';
import { TeamspaceContent } from './teamspaces/teamspaceContent/teamspaceContent.component';
import { ProjectContent } from './projects/projectContent/projectContent';

export const MainRoute = () => {
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
				<Route path="auth" element={<RouteTitle title={formatMessage({ id: 'pageTitle.auth', defaultMessage: 'Authenticate' })}><AuthPage /></RouteTitle>} />
				<Route element={<LegalLayout />}>
					<Route path="terms" element={<RouteTitle title={formatMessage({ id: 'pageTitle.terms', defaultMessage: 'Terms & Conditions' })}><TermsLegalPaper /></RouteTitle>} />
					<Route path="cookies" element={<RouteTitle title={formatMessage({ id: 'pageTitle.cookies', defaultMessage: 'Cookies' })}><CookiesLegalPaper /></RouteTitle>} />
					<Route path="privacy" element={<Navigate to={PRIVACY_ROUTE} replace />} />
				</Route>
				<Route index element={<Navigate to="dashboard" replace />} />
				<Route element={<AuthenticationRedirect />}>
					<Route path="dashboard" element={<RouteTitle title={formatMessage({ id: 'pageTitle.teamspaceSelection', defaultMessage: 'Teamspaces' })}><TeamspaceSelection /></RouteTitle>} />
					<Route path="dashboard/:teamspace" element={<TeamspaceLayout />}>
						<Route path="t/*" element={<TeamspaceContent />} />
						<Route index element={<Navigate to="t/projects" replace />} />
					</Route>
					<Route path="dashboard/:teamspace/:project" element={<DashboardProjectLayout />}>
						<Route path="t/*" element={<ProjectContent />} />
						<Route index element={<Navigate to="t/federations" replace />} />
					</Route>
					<Route path="viewer/:teamspace/:project/:containerOrFederation/:revision?" element={<DashboardViewerLayout />}>
						<Route index element={
							<RouteTitle title={formatMessage({ id: 'pageTitle.viewer', defaultMessage: ':containerOrFederation :revision - Viewer' })}>
								<Viewer />
							</RouteTitle>
						} />
					</ Route>
					<Route path="*" element={<RouteTitle title={formatMessage({ id: 'pageTitle.notFound', defaultMessage: 'Page Not Found' })}><NotFound /></RouteTitle>} />
				</Route>
			</Routes>
		</CalibrationContextComponent>
	);
};
