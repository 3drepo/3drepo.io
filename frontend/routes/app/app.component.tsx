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
import { Route, Switch, Redirect } from 'react-router-dom';

import { DialogContainer } from '../components/dialogContainer';
import { SnackbarContainer } from '../components/snackbarContainer';
import { clientConfigService } from '../../services/clientConfig';
import { isStaticRoute, STATIC_ROUTES } from '../../services/staticPages';
import { LiveChat } from '../components/liveChat';
import { analyticsService } from '../../services/analytics';
import { ViewerGui } from '../viewerGui';

import { ViewerCanvas } from '../viewerCanvas';
import { Dashboard } from '../dashboard';
import { AppContainer } from './app.styles';
import { PrivateRoute } from '../components/privateRoute';
import { Login } from '../login';
import PageTemplate from '../staticPageViewer/components/pageTemplate/pageTemplate.container';
import { SignUp } from '../signUp';
import { PasswordForgot } from '../passwordForgot';
import { PasswordChange } from '../passwordChange';
import RegisterRequest from '../registerRequest/registerRequest.container';
import { RegisterVerify } from '../registerVerify';

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

const DEFAULT_REDIRECT = '/dashboard/teamspaces';
const MAIN_ROUTE_PATH = '/';
const LOGIN_ROUTE_PATH = '/login';

const PUBLIC_ROUTES = [
	'login',
	'sign-up',
	'register-request',
	'register-verify',
	'password-forgot',
	'password-change'
] as any;

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
		return PUBLIC_ROUTES.includes(path.replace('/', ''));
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

		const initialReferrer = location.pathname !== MAIN_ROUTE_PATH
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
				history.push('/login');
			}
		}

		if (isPublicRoute && isAuthenticated) {
			const isLoginRoute = LOGIN_ROUTE_PATH === location.pathname;
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
			this.loginInterval = setInterval(this.handleAutoLogin, 1000);
		} else {
			clearInterval(this.loginInterval);
			this.loginInterval = null;
		}
	}

	public handleAutoLogout = () => {
		const { isAuthenticated, logout, history } = this.props;
		const hasActiveSession = JSON.parse(window.localStorage.getItem('loggedIn'));
		const isSessionExpired = hasActiveSession !== isAuthenticated;
		if (isSessionExpired) {
			logout();
			history.push('/login');
		}
	}

	public handleAutoLogin = () => {
		const { isAuthenticated } = this.props;
		const hasActiveSession = JSON.parse(window.localStorage.getItem('loggedIn'));

		if (hasActiveSession && !isAuthenticated) {
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

	public renderStaticRoutes = () => STATIC_ROUTES.map(({ title, path, fileName }) => (
		<Route key={path} path={path} render={() => <PageTemplate title={title} fileName={fileName} />} />
	))

	public render() {
		const { isAuthPending, isAuthenticated } = this.props;
		console.log('RENDER APP');
		if (isAuthPending) {
			return null;
		}

		return (
				<AppContainer>
					<Switch>
						<Route exact path="/login" component={Login} />
						<Route exact path="/sign-up" component={SignUp} />
						<Route exact path="/password-forgot" component={PasswordForgot} />
						<Route exact path="/password-change" component={PasswordChange} />
						<Route exact path="/register-request" component={RegisterRequest} />
						<Route exact path="/register-verify" component={RegisterVerify} />
						<PrivateRoute path="/dashboard" component={Dashboard} />
						<PrivateRoute path="/viewer" component={this.renderViewer} />
						{this.renderStaticRoutes()}
						<Redirect to={isAuthenticated ? '/dashboard' : '/login'} />
						<Route component={() => <div>No match on app</div>} />
					</Switch>

					<DialogContainer />
					<SnackbarContainer />
					<LiveChat/>
				</AppContainer>
		);
	}
}
