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

import { useRouteMatch, useLocation, Switch, Redirect } from 'react-router-dom';
import { GlobalStyle } from '@/v5/ui/themes/global';
import { formatMessage } from '@/v5/services/intl';
import { NotFound } from '@/v5/ui/routes/notFound';
import { DashboardLayout } from '@components/dashboard/dashboardLayout';
import { ViewerCanvas } from '@/v4/routes/viewerCanvas';
import { DashboardViewerLayout } from '@components/dashboard/dashboardViewerLayout/dashboardViewerLayout.component';
import { Route } from '@/v5/services/routing/route.component';
import { AuthenticatedRoute } from '@/v5/services/routing/authenticatedRoute.component';
import { discardSlash } from '@/v5/helpers/url.helper';
import { PasswordForgot } from '../login/passwordForgot';
import { PasswordChange } from '../login/passwordChange';
import { TeamspaceSelection } from '../teamspaceSelection';
import { TeamspaceContent } from './teamspaces/teamspaceContent/teamspaceContent.component';
import { ProjectContent } from './projects';
import { Login } from '../login';
import { Viewer } from '../viewer/viewer';
import { VIEWER_ROUTE } from '../routes.constants';
import { LegalRoutes } from '../legal';
import { UserSignup } from '../userSignup/userSignup.component';
import { UserVerification } from '../userVerification/userVerification.component';
import { TeamspaceLayout } from './teamspaces/teamspaceLayout/teamspaceLayout.component';
import { UserSignupSSO } from '../userSignup/userSignUpSSO/userSignUpSSO.component';

export const MainRoute = () => {
	const { path } = useRouteMatch();
	const { pathname } = useLocation();

	return (
		<>
			<GlobalStyle />
			<ViewerCanvas location={{ pathname }} />
			<Switch>
				<Route title={formatMessage({ id: 'pageTitle.login', defaultMessage: 'Log in' })} exact path={`${path}/login`}>
					<Login />
				</Route>
				<Route title={formatMessage({ id: 'pageTitle.signUp', defaultMessage: 'Create Account' })} exact path={`${path}/signup`}>
					<UserSignup />
				</Route>
				<Route title={formatMessage({ id: 'pageTitle.signUp', defaultMessage: 'Create Account' })} exact path={`${path}/signup-sso`}>
					<UserSignupSSO />
				</Route>
				<Route title={formatMessage({ id: 'pageTitle.userVerification', defaultMessage: 'Verify Email' })} exact path={`${path}/register-verify`}>
					<UserVerification />
				</Route>
				<Route title={formatMessage({ id: 'pageTitle.passwordForgot', defaultMessage: 'Forgotten Password' })} exact path={`${path}/password-forgot`}>
					<PasswordForgot />
				</Route>
				<Route title={formatMessage({ id: 'pageTitle.passwordChange', defaultMessage: 'Change Password' })} exact path={`${path}/password-change`}>
					<PasswordChange />
				</Route>
				<Route exact path={`${path}/(terms|privacy|cookies)`}>
					<LegalRoutes path={path} />
				</Route>
				<AuthenticatedRoute title={formatMessage({ id: 'pageTitle.teamspaceSelection', defaultMessage: 'Teamspaces' })} exact path={`${path}/dashboard/`}>
					<TeamspaceSelection />
				</AuthenticatedRoute>
				<AuthenticatedRoute exact path={`${path}/dashboard/:teamspace/(t|t/.*)?`}>
					<TeamspaceLayout>
						<Switch>
							<Route exact path={`${path}/dashboard/:teamspace`}>
								<Redirect to={`${discardSlash(pathname)}/t/projects`} />
							</Route>
							<Route exact path={`${path}/dashboard/:teamspace/t`}>
								<Redirect to={`${discardSlash(pathname)}/projects`} />
							</Route>
							<Route path={`${path}/dashboard/:teamspace/`}>
								<TeamspaceContent />
							</Route>
						</Switch>
					</TeamspaceLayout>
				</AuthenticatedRoute>
				<AuthenticatedRoute path={`${path}/dashboard/:teamspace/:project`}>
					<DashboardLayout>
						<Switch>
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
				<AuthenticatedRoute title={formatMessage({ id: 'pageTitle.viewer', defaultMessage: ':containerOrFederation :revision - Viewer' })} path={VIEWER_ROUTE}>
					<DashboardViewerLayout>
						<Viewer />
					</DashboardViewerLayout>
				</AuthenticatedRoute>
				<AuthenticatedRoute exact path={path}>
					<Redirect to={`${discardSlash(pathname)}/dashboard`} />
				</AuthenticatedRoute>
				<AuthenticatedRoute title={formatMessage({ id: 'pageTitle.notFound', defaultMessage: 'Page Not Found' })} path="*">
					<DashboardLayout>
						<NotFound />
					</DashboardLayout>
				</AuthenticatedRoute>
			</Switch>
		</>
	);
};
