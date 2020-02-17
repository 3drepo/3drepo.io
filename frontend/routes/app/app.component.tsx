/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { memoize } from 'lodash';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { ROUTES } from '../../constants/routes';
import { renderWhenTrue } from '../../helpers/rendering';
import { analyticsService } from '../../services/analytics';
import { clientConfigService } from '../../services/clientConfig';
import { isStaticRoute, STATIC_ROUTES } from '../../services/staticPages';
import { DialogContainer } from '../components/dialogContainer';
import { LiveChat } from '../components/liveChat';
import { PrivateRoute } from '../components/privateRoute';
import { SnackbarContainer } from '../components/snackbarContainer';
import StaticPageRoute from '../components/staticPageRoute/staticPageRoute.component';
import TopMenu from '../components/topMenu/topMenu.container';
import { Dashboard } from '../dashboard';
import { Login } from '../login';
import { NotFound } from '../notFound';
import { PasswordChange } from '../passwordChange';
import { PasswordForgot } from '../passwordForgot';
import RegisterRequest from '../registerRequest/registerRequest.container';
import { RegisterVerify } from '../registerVerify';
import { SignUp } from '../signUp';
import { ViewerCanvas } from '../viewerCanvas';
import { ViewerGui } from '../viewerGui';
import { AppContainer } from './app.styles';

interface IProps {
	location: any;
	history: any;
	isAuthenticated: boolean;
	currentUser: any;
	isAuthPending: boolean;
	showNewUpdateDialog: (config) => void;
	authenticate: () => void;
	logout: () => void;
	startup: () => void;
	hideDialog: () => void;
	onLoggedOut: () => void;
	subscribeToDm: (event, handler) => void;
}

interface IState {
	referrer?: string;
	autologoutInterval?: number;
}

const DEFAULT_REDIRECT = ROUTES.TEAMSPACES;

const ANALYTICS_REFERER_ROUTES = [
	'sign-up',
	'register-request'
] as any;

export class App extends React.PureComponent<IProps, IState> {

	public state = {
		referrer: DEFAULT_REDIRECT,
		autologoutInterval: clientConfigService.login_check_interval || 4
	};

	public renderStaticRoutes = memoize(() => STATIC_ROUTES.map(({ title, path, fileName }) => (
		<Route key={path} path={path} render={() => <StaticPageRoute title={title} fileName={fileName} />} />
	)));

	public renderLoginRoute = memoize(() => {
		return <Route exact path={ROUTES.LOGIN} component={Login} />;
	});

	public renderHeader = renderWhenTrue(() => (
		<TopMenu />
	));

	constructor(props) {
		super(props);
		props.startup();
	}

	public isRefererRoute(path) {
		return ANALYTICS_REFERER_ROUTES.includes(path.replace('/', ''));
	}

	public componentDidMount() {
		this.props.authenticate();
		this.sendAnalyticsPageView(location);

		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.addEventListener('message', (event) => {
				if (event.data.type === 'UPDATE') {
					this.props.showNewUpdateDialog({
						onConfirm: () => {
							location.reload();
						}
					});
				}
			});
		}

		this.props.subscribeToDm('loggedOut', this.props.onLoggedOut);
	}

	public componentDidUpdate(prevProps) {
		if (location.pathname !== prevProps.location.pathname) {
			this.sendAnalyticsPageView(location);
			this.props.hideDialog();
		}
	}

	public sendAnalyticsPageView(location) {
		const isAnalyticsRefererRoute = this.isRefererRoute(location.pathname);
		analyticsService.sendPageView(location);

		if (isAnalyticsRefererRoute) {
			analyticsService.sendPageViewReferer(location);
		}
	}

	public render() {
		return (
			<AppContainer>
				<Route component={ViewerCanvas} />
				{this.renderHeader(!isStaticRoute(location.pathname))}
				<Switch>
					{this.renderLoginRoute()}
					<Route exact path={ROUTES.SIGN_UP} component={SignUp} />
					<Route exact path={ROUTES.PASSWORD_FORGOT} component={PasswordForgot} />
					<Route exact path={ROUTES.PASSWORD_CHANGE} component={PasswordChange} />
					<Route exact path={ROUTES.REGISTER_REQUEST} component={RegisterRequest} />
					<Route exact path={ROUTES.REGISTER_VERIFY} component={RegisterVerify} />
					<Redirect exact from={ROUTES.HOME} to={ROUTES.TEAMSPACES} />
					<PrivateRoute path={ROUTES.DASHBOARD} component={Dashboard} />
					<PrivateRoute
						path={`${ROUTES.VIEWER}/:teamspace/:model/:revision?`}
						component={ViewerGui}
					/>
					{this.renderStaticRoutes()}
					<Route component={NotFound} />
				</Switch>
				<DialogContainer />
				<SnackbarContainer />
				<LiveChat />
			</AppContainer>
		);
	}
}
