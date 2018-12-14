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
import { runAngularTimeout } from '../../helpers/migration';
import { DialogContainer } from '../components/dialogContainer';
import { SnackbarContainer } from '../components/snackbarContainer';
import { clientConfigService } from '../../services/clientConfig';

interface IProps {
	location: any;
	history: any;
	isAuthenticated: boolean;
	hasActiveSession: boolean;
	authenticate: () => void;
	logout: () => void;
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

const STATIC_ROUTES = ['cookies', 'terms', 'privacy'] as any;

export class App extends React.PureComponent<IProps, IState> {
	public state = {
		referrer: DEFAULT_REDIRECT,
		autologoutInterval: clientConfigService.login_check_interval || 4
	};

	private authenticationInterval;
	private loginInterval;

	public isStaticRoute(path) {
		return STATIC_ROUTES.includes(path.replace('/', ''));
	}

	public isPublicRoute(path) {
		return PUBLIC_ROUTES.includes(path.replace('/', ''));
	}

	public componentDidMount() {
		this.props.authenticate();

		if (!this.isStaticRoute(location.pathname)) {
			this.toggleAutoLogout();
			this.toggleAutoLogin();
		}

		const initialReferrer = location.pathname !== MAIN_ROUTE_PATH
			? `${location.pathname}${location.search}`
			: DEFAULT_REDIRECT;

		this.setState({ referrer: initialReferrer });
	}

	public componentWillUnmount() {
		this.toggleAutoLogout(false);
		this.toggleAutoLogin(false);
	}

	public componentDidUpdate(prevProps) {
		const { location, history, isAuthenticated } = this.props;
		const isStaticRoute = this.isStaticRoute(location.pathname);
		const isPublicRoute = this.isPublicRoute(location.pathname);

		const isPrivateRoute = !isStaticRoute && !isPublicRoute;

		if (isPrivateRoute && isAuthenticated !== prevProps.isAuthenticated) {
			if (isAuthenticated) {
				this.toggleAutoLogin(false);
				runAngularTimeout(() => {
					history.push(this.state.referrer);
				});
			} else {
				this.toggleAutoLogout(false);
				this.toggleAutoLogin();
				runAngularTimeout(() => {
					history.push('/login');
				});
			}
		}

		if (isPublicRoute && isAuthenticated) {
			const isLoginRoute = LOGIN_ROUTE_PATH === location.pathname;
			runAngularTimeout(() => {
				history.push(isLoginRoute ? this.state.referrer : DEFAULT_REDIRECT);
				this.setState({ referrer: DEFAULT_REDIRECT });
			});
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
			runAngularTimeout(() => {
				history.push('/login');
			});
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

	public render() {
		// TODO: In the future it'll return first level routes eg. Dashboard, Login
		return (
			<>
				<DialogContainer />
				<SnackbarContainer />
			</>
		);
	}
}
