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
import { DashboardProjectLayout } from '@components/dashboard/dashboardProjectLayout/dashboardProjectLayout.component';
import { DashboardViewerLayout } from '@components/dashboard/dashboardViewerLayout/dashboardViewerLayout.component';
import { Route } from '@/v5/services/routing/route.component';
import { AuthenticatedRoute } from '@/v5/services/routing/authenticatedRoute.component';
import { discardSlash } from '@/v5/helpers/url.helper';
import { PasswordForgot } from '../login/passwordForgot';
import { PasswordChange } from '../login/passwordChange';
import { TeamspaceSelection } from '../teamspaceSelection';
import { TeamspaceContent } from './teamspaces/teamspaceContent/teamspaceContent.component';
import { ProjectContent } from './projects/projectContent/projectContent';
import { Login } from '../login';
import { Viewer } from '../viewer/viewer';
import {
	DASHBOARD_ROUTE,
	LOGIN_PATH,
	PASSWORD_CHANGE_PATH,
	PASSWORD_FORGOT_PATH,
	PROJECT_ROUTE_BASE,
	PROJECT_ROUTE_BASE_TAB,
	REGISTER_VERIFY_PATH,
	SIGN_UP_PATH,
	SIGN_UP_SSO_PATH,
	TEAMSPACE_ROUTE_BASE,
	TEAMSPACE_ROUTE_BASE_TAB,
	VIEWER_ROUTE,
} from '../routes.constants';
import { LegalRoutes } from '../legal';
import { UserSignup } from '../userSignup/userSignup.component';
import { UserVerification } from '../userVerification/userVerification.component';
import { TeamspaceLayout } from './teamspaces/teamspaceLayout/teamspaceLayout.component';
import { UserSignupSSO } from '../userSignup/userSignUpSSO/userSignUpSSO.component';
import { useEffect } from 'react';
import { AuthActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { AuthHooksSelectors } from '@/v5/services/selectorsHooks';

export const MainRoute = () => {
	const { path } = useRouteMatch();
	const { pathname } = useLocation();
	const authenticationFetched: boolean = AuthHooksSelectors.selectAuthenticationFetched();

	useEffect(() => {
		if (!authenticationFetched) {
			AuthActionsDispatchers.authenticate();
		}
	}, [authenticationFetched]);

	return (
		<>
			<GlobalStyle />
			<Switch>
				<Route title={formatMessage({ id: 'pageTitle.login', defaultMessage: 'Log in' })} exact path={LOGIN_PATH}>
					<Login />
				</Route>
				<Route title={formatMessage({ id: 'pageTitle.signUp', defaultMessage: 'Create Account' })} exact path={SIGN_UP_PATH}>
					<UserSignup />
				</Route>
				<Route title={formatMessage({ id: 'pageTitle.signUp', defaultMessage: 'Create Account' })} exact path={SIGN_UP_SSO_PATH}>
					<UserSignupSSO />
				</Route>
				<Route title={formatMessage({ id: 'pageTitle.userVerification', defaultMessage: 'Verify Email' })} exact path={REGISTER_VERIFY_PATH}>
					<UserVerification />
				</Route>
				<Route title={formatMessage({ id: 'pageTitle.passwordForgot', defaultMessage: 'Forgotten Password' })} exact path={PASSWORD_FORGOT_PATH}>
					<PasswordForgot />
				</Route>
				<Route title={formatMessage({ id: 'pageTitle.passwordChange', defaultMessage: 'Change Password' })} exact path={PASSWORD_CHANGE_PATH}>
					<PasswordChange />
				</Route>
				<Route exact path={`${path}/(terms|privacy|cookies)`}>
					<LegalRoutes path={path} />
				</Route>
				<AuthenticatedRoute title={formatMessage({ id: 'pageTitle.teamspaceSelection', defaultMessage: 'Teamspaces' })} exact path={DASHBOARD_ROUTE}>
					<TeamspaceSelection />
				</AuthenticatedRoute>
				<AuthenticatedRoute exact path={`${TEAMSPACE_ROUTE_BASE}/(t|t/.*)?`}>
					<TeamspaceLayout>
						<Switch>
							<Route exact path={TEAMSPACE_ROUTE_BASE}>
								<Redirect to={`${discardSlash(pathname)}/t/projects`} />
							</Route>
							<Route exact path={TEAMSPACE_ROUTE_BASE_TAB}>
								<Redirect to={`${discardSlash(pathname)}/projects`} />
							</Route>
							<Route path={`${TEAMSPACE_ROUTE_BASE}/`}>
								<TeamspaceContent />
							</Route>
						</Switch>
					</TeamspaceLayout>
				</AuthenticatedRoute>
				<AuthenticatedRoute path={PROJECT_ROUTE_BASE}>
					<DashboardProjectLayout>
						<Switch>
							<Route exact path={PROJECT_ROUTE_BASE}>
								<Redirect to={`${discardSlash(pathname)}/t/federations`} />
							</Route>
							<Route exact path={PROJECT_ROUTE_BASE_TAB}>
								<Redirect to={`${discardSlash(pathname)}/federations`} />
							</Route>
							<Route path={PROJECT_ROUTE_BASE}>
								<ProjectContent />
							</Route>
						</Switch>
					</DashboardProjectLayout>
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
					<NotFound />
				</AuthenticatedRoute>
			</Switch>
		</>
	);
};
