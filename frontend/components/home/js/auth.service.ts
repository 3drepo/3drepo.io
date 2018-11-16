/**
 *  Copyright (C) 2014 3D Repo Ltd
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
import { getState, dispatch, history } from "../../../helpers/migration";
import { AuthActions, selectIsAuthenticated } from "../../../modules/auth";
import { selectCurrentUser } from "../../../modules/currentUser";

export class AuthService {
	public static $inject: string[] = [
		'$injector',
		'$q',
		'$interval',
		'$location',
		'$window',
		'$mdDialog',
		'$timeout',
		'$state',

		'ClientConfigService',
		'AnalyticService',
		'APIService'
	];

	public authDefer;

	private doNotLogout;
	private loggedOutStates;
	private username;
	private loggedIn;
	private state;
	private events;
	private initPromise;
	private loginRequestPromise;

	constructor(
		private $injector,
		private $q,
		private $interval,
		private $location,
		private $window,
		private $mdDialog,
		private $timeout,
		private $state,

		private ClientConfigService: any,
		private AnalyticService: any,
		private APIService: any
	) {

		this.authDefer = $q.defer();

		this.doNotLogout = [
			'/terms',
			'/privacy',
			'/signUp',
			'/passwordForgot',
			'/passwordChange',
			'/registerRequest',
			'/registerVerify'
		];

		this.loggedOutStates = [
			'app.login',
			'app.signUp',
			'app.passwordForgot',
			'app.registerRequest',
			'app.registerVerify',
			'app.passwordChange'
		];

		this.state = {};
		this.events = {
			USER_LOGGED_IN : 'USER_LOGGED_IN',
			USER_LOGGED_OUT : 'USER_LOGGED_OUT'
		};
	}

	public isLoggedIn() {
		return selectIsAuthenticated(getState());
	}

	public getUsername() {
		return selectCurrentUser(getState()).username;
	}

	public hasPermission(requiredPerm, permissions) {
		return permissions.indexOf(requiredPerm) !== -1;
	}

	public initAutoLogout() {
		// Check for mismatch
		const checkLoginMismatch = this.ClientConfigService.login_check_interval || 4; // Seconds

		this.$interval(() => {
			this.shouldAutoLogout();
		}, 1000 * checkLoginMismatch);

	}

	public shouldAutoLogout() {
		const sessionLogin = this.getUsername();

		// We are logged in on another tab but not this OR
		// we are looged out in another tab and not this
		const loginStateMismatch = (sessionLogin && !this.isLoggedIn()) ||
									(!sessionLogin && this.isLoggedIn());

		// Check if we're on a logged out page i.e. registerVerify
		const isLoggedOutPage = this.loggedOutPage();
		const isStatic = this.$state.current.name.includes('app.static');
		if (loginStateMismatch && !isLoggedOutPage && !isStatic) {
			this.$window.location.reload();
		} else if (loginStateMismatch && isLoggedOutPage) {
			if (sessionLogin) {
				dispatch(AuthActions.logout());
			}
		}
			this.$location.path('/login');
			this.resetApp();
		} else if (loginStateMismatch && isLoggedOutPage && sessionLogin && this.loggedIn) {
			this.APIService.post('logout').then(this.resetApp());
		}
	}

	public resetApp() {
		localStorage.setItem('loggedIn', 'false');
		localStorage.removeItem('username');
		dispatch({ type: 'RESET_APP' });
	}

	public loggedOutPage() {
		const state = this.$state.current.name;

		return this.loggedOutStates.some((page) => {
			return state.indexOf(page) !== -1;
		});
	}
}

export const AuthServiceModule = angular
	.module('3drepo')
	.service('AuthService', AuthService);
