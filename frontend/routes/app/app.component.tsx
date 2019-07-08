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

import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { memoize } from 'lodash';

import { clientConfigService } from '../../services/clientConfig';
import { isStaticRoute, STATIC_ROUTES } from '../../services/staticPages';
import { analyticsService } from '../../services/analytics';
import { DialogContainer } from '../components/dialogContainer';
import { SnackbarContainer } from '../components/snackbarContainer';
import { ROUTES, PUBLIC_ROUTES } from '../../constants/routes';
import { PrivateRoute } from '../components/privateRoute';
import StaticPageRoute from '../components/staticPageRoute/staticPageRoute.container';
import { LiveChat } from '../components/liveChat';
import TopMenu from '../components/topMenu/topMenu.container';
import { ViewerCanvas } from '../viewerCanvas';
import { ViewerGui } from '../viewerGui';
import { Dashboard } from '../dashboard';
import { Login } from '../login';
import { SignUp } from '../signUp';
import { PasswordForgot } from '../passwordForgot';
import { PasswordChange } from '../passwordChange';
import RegisterRequest from '../registerRequest/registerRequest.container';
import { RegisterVerify } from '../registerVerify';
import { AppContainer } from './app.styles';
import { renderWhenTrue } from '../../helpers/rendering';
import { NotFound } from '../notFound';

interface IProps {
	location: any;
	history: any;
	isAuthenticated: boolean;
	hasActiveSession: boolean;
	currentUser: any;
	isAuthPending: boolean;
	authenticate: () => void;
	logout: () => void;
	startup: () => void;
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
	private authenticationInterval;
	private loginInterval;

	constructor(props) {
		super(props);
		props.startup();
	}

	public state = {
		referrer: DEFAULT_REDIRECT,
		autologoutInterval: clientConfigService.login_check_interval || 4
	};

	public isPublicRoute(path) {
		return PUBLIC_ROUTES.includes(path);
	}

	public isRefererRoute(path) {
		return ANALYTICS_REFERER_ROUTES.includes(path.replace('/', ''));
	}

	public componentDidMount() {
		this.props.authenticate();
		if (!isStaticRoute(location.pathname)) {
			this.toggleAutoLogout();
			this.toggleAutoLogin();
		}

		const initialReferrer = location.pathname !== ROUTES.HOME
			? `${location.pathname}${location.search}`
			: DEFAULT_REDIRECT;

		this.setState({ referrer: initialReferrer });
		this.sendAnalyticsPageView(location);
	}

	public componentWillUnmount() {
		this.toggleAutoLogout(false);
		this.toggleAutoLogin(false);
	}

	public componentDidUpdate(prevProps) {
		const { location, history, isAuthenticated } = this.props;
		const isStatic = isStaticRoute(location.pathname);
		const isPublicRoute = this.isPublicRoute(location.pathname);

		const isPrivateRoute = !isStatic && !isPublicRoute;

		if (isPrivateRoute && isAuthenticated !== prevProps.isAuthenticated) {
			if (isAuthenticated) {
				this.toggleAutoLogin(false);
				history.push(this.state.referrer);
			} else {
				this.toggleAutoLogout(false);
				this.toggleAutoLogin();
				history.push(ROUTES.LOGIN);
			}
		}

		if (isPublicRoute && isAuthenticated) {
			const isLoginRoute = ROUTES.LOGIN === location.pathname;
			history.push(isLoginRoute ? this.state.referrer : DEFAULT_REDIRECT);
			this.setState({ referrer: DEFAULT_REDIRECT });
		}

		if (location.pathname !== prevProps.location.pathname) {
			this.sendAnalyticsPageView(location);
		}
	}

	public sendAnalyticsPageView(location) {
		const isAnalyticsRefererRoute = this.isRefererRoute(location.pathname);
		analyticsService.sendPageView(location);

		if (isAnalyticsRefererRoute) {
			analyticsService.sendPageViewReferer(location);
		}
	}

	public toggleAutoLogout = (shouldStart = true) => {
		if (shouldStart) {
			this.authenticationInterval = setInterval(this.handleAutoLogout, this.state.autologoutInterval * 1000);
		} else {
			clearInterval(this.authenticationInterval);
			this.authenticationInterval = null;
		}
	}

	public toggleAutoLogin = (shouldStart = true) => {
		if (shouldStart) {
			this.loginInterval = setInterval(this.handleAutoLogin, 2000);
		} else {
			clearInterval(this.loginInterval);
			this.loginInterval = null;
		}
	}

	public get hasActiveSession() {
		return JSON.parse(window.localStorage.getItem('loggedIn'));
	}

	public handleLogoClick = () => {
		const { isAuthenticated, history } = this.props;
		let path = ROUTES.HOME;
		if (isAuthenticated) {
			path = ROUTES.TEAMSPACES;
		}

		history.push(path);
	}

	public handleAutoLogout = () => {
		const { isAuthenticated, logout, history } = this.props;
		const isSessionExpired = this.hasActiveSession !== isAuthenticated;
		if (isSessionExpired) {
			logout();
			history.push(ROUTES.LOGIN);
		}
	}

	public handleAutoLogin = () => {
		const { isAuthenticated } = this.props;

		if (this.hasActiveSession && !isAuthenticated) {
			this.props.authenticate();
			if (!this.authenticationInterval) {
				this.toggleAutoLogout();
			}
		}
	}

	public renderViewer = (props) => (
		<>
			<ViewerCanvas {...props} />
			<ViewerGui {...props} />
		</>
	)

	public renderStaticRoutes = memoize(() => STATIC_ROUTES.map(({ title, path, fileName }) => (
		<Route key={path} path={path} render={() => <StaticPageRoute title={title} fileName={fileName} />} />
	)));

	public renderLoginRoute = memoize(() => {
		return <Route exact path={ROUTES.LOGIN} component={Login} />;
	});

	public renderHeader = renderWhenTrue(() => (
		<TopMenu onLogout={this.props.logout} onLogoClick={this.handleLogoClick} />
	));

	public render() {
		const { isAuthPending } = this.props;
		if (isAuthPending) {
			return (
				<AppContainer>
					{this.renderHeader(true)}
					{this.renderLoginRoute()}
				</AppContainer>
			);
		}

		return (
				<AppContainer>
					{this.renderHeader(!isStaticRoute(location.pathname))}
					<Switch>
						{this.renderLoginRoute()}
						<Route exact path={ROUTES.SIGN_UP} component={SignUp} />
						<Route exact path={ROUTES.PASSWORD_FORGOT} component={PasswordForgot} />
						<Route exact path={ROUTES.PASSWORD_CHANGE} component={PasswordChange} />
						<Route exact path={ROUTES.REGISTER_REQUEST} component={RegisterRequest} />
						<Route exact path={ROUTES.REGISTER_VERIFY} component={RegisterVerify} />
						<PrivateRoute path={ROUTES.DASHBOARD} component={Dashboard} />
						<PrivateRoute
							path={`${ROUTES.VIEWER}/:teamspace/:model/:revision?`}
							component={this.renderViewer}
						/>
						{this.renderStaticRoutes()}
						<Route component={NotFound} />
					</Switch>
					<DialogContainer />
					<SnackbarContainer />
					<LiveChat/>
				</AppContainer>
		);
	}
}
