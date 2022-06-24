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

import { useRouteMatch, useLocation, Route, Switch, Redirect } from 'react-router-dom';
import { GlobalStyle } from '@/v5/ui/themes/global';
import { AuthenticatedRoute, discardSlash } from '@/v5/services/routing/routing';
import { NotFound } from '@/v5/ui/routes/notFound';
import { DashboardLayout } from '@components/dashboard/dashboardLayout';
import { DashboardViewerLayout } from '@components/dashboard/dashboardViewerLayout/dashboardViewerLayout.component';
import { LegalTemplate } from '@components/legalTemplate/legalTemplate.component';
import { ViewerCanvas } from '@/v4/routes/viewerCanvas';
import { PasswordForgot } from '../login/passwordForgot';
import { PasswordChange } from '../login/passwordChange';
import { TeamspaceSelection } from '../teamspaceSelection';
import { TeamspaceContent } from './teamspaces';
import { ProjectContent } from './projects';
import { Login } from '../login';
import { Viewer } from '../viewer/viewer';
import { VIEWER_ROUTE } from '../routes.constants';
import { UserSignup } from '../userSignup/userSignup.component';
import { UserVerification } from '../userVerification/userVerification.component';

export const MainRoute = () => {
	const { path } = useRouteMatch();
	const { pathname } = useLocation();
	const { legal: LEGAL_PAPERS } = ClientConfig;

	return (
		<>
			<GlobalStyle />
			<ViewerCanvas location={{ pathname }} />
			<Switch>
				<Route exact path={`${path}/login`}>
					<Login />
				</Route>
				<Route exact path={`${path}/signup`}>
					<UserSignup />
				</Route>
				<Route exact path={`${path}/register-verify`}>
					<UserVerification />
				</Route>
				<Route exact path={`${path}/password-forgot`}>
					<PasswordForgot />
				</Route>
				<Route exact path={`${path}/password-change`}>
					<PasswordChange />
				</Route>
				<Route path={LEGAL_PAPERS.map(({ page }) => `${path}/${page}`)}>
					<LegalTemplate />
				</Route>
				<AuthenticatedRoute exact path={`${path}/dashboard/`}>
					<TeamspaceSelection />
				</AuthenticatedRoute>
				<AuthenticatedRoute path={`${path}/dashboard/:teamspace/:project?`}>
					<DashboardLayout>
						<Route path={`${path}/dashboard/:teamspace/`}>
							<TeamspaceContent />
						</Route>
						<Switch>
							<Route exact path={`${path}/dashboard/:teamspace/t/settings`}>
								<TeamspaceContent />
							</Route>
							<Route exact path={`${path}/dashboard/:teamspace/:project`}>
								<Redirect to={`${discardSlash(pathname)}/t/federations`} />
							</Route>
							<Route exact path={`${path}/dashboard/:teamspace/:project/t`}>
								<Redirect to={`${discardSlash(pathname)}/federations`} />
							</Route>
							<Route path={`${path}/dashboard/:teamspace/:project`}>
								<ProjectContent />
							</Route>
						</Switch>
					</DashboardLayout>
				</AuthenticatedRoute>
				<AuthenticatedRoute path={VIEWER_ROUTE}>
					<DashboardViewerLayout>
						<Viewer />
					</DashboardViewerLayout>
				</AuthenticatedRoute>
				<AuthenticatedRoute path="*">
					<DashboardLayout>
						<NotFound />
					</DashboardLayout>
				</AuthenticatedRoute>
			</Switch>
		</>
	);
};
