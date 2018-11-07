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
import { dispatch, history } from "../../../helpers/migration";
import { TeamspaceActions } from "../../../modules/teamspace";
import { getAvatarUrl } from "../../../modules/teamspace/teamspace.sagas";

export class AuthService {

	public static $inject: string[] = [
		"$injector",
		"$q",
		"$interval",
		"$location",
		"$window",
		"$mdDialog",
		"$timeout",
		"$state",

		"ClientConfigService",
		"AnalyticService",
		"APIService"
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
			"/terms",
			"/privacy",
			"/signUp",
			"/passwordForgot",
			"/passwordChange",
			"/registerRequest",
			"/registerVerify"
		];

		this.loggedOutStates = [
			"app.login",
			"app.signUp",
			"app.passwordForgot",
			"app.registerRequest",
			"app.registerVerify",
			"app.passwordChange"
		];

		this.loggedIn = this.localStorageLoggedIn() || null;
		this.username = this.getLocalStorageUsername() || null;

		this.initAutoLogout();

		this.state = {};
		this.events = {
			USER_LOGGED_IN : "USER_LOGGED_IN",
			USER_LOGGED_OUT : "USER_LOGGED_OUT"
		};

	}

	public isLoggedIn() {
		return this.loggedIn;
	}

	public initAutoLogout() {
		// Check for mismatch
		const checkLoginMismatch = this.ClientConfigService.login_check_interval || 4; // Seconds

		this.$interval(() => {
			this.shouldAutoLogout();
		}, 1000 * checkLoginMismatch);

	}

	public loginSuccess(response: any) {
		this.loggedIn = true;
		this.username = response.data.username;

		// Set the session as logged in on the client
		// using local storage
		localStorage.setItem("loggedIn", "true");
		localStorage.setItem("username", response.data.username);

		this.setCurrentEvent(this.events.USER_LOGGED_IN, {
			username: response.data.username,
			initialiser: response.data.initialiser,
			flags: response.data.flags
		});
		this.AnalyticService.setUserId(this.username);
		this.authDefer.resolve(this.loggedIn);

		dispatch(TeamspaceActions.fetchUserSuccess({
			username: response.data.username,
			avatarUrl: getAvatarUrl(response.data.username)
		}));
	}

	public loginFailure(response) {
		this.loggedIn = false;
		this.username = null;

		const initialiser = response.initialiser;
		response.initialiser = undefined;

		localStorage.setItem("loggedIn", "false");
		localStorage.removeItem("username");

		this.setCurrentEvent(this.events.USER_LOGGED_IN, {
			username: null,
			initialiser,
			error: response.data
		});

		history.push('/login');
		this.authDefer.resolve(response.data);
	}

	public logoutSuccess() {
		this.loggedIn  = false;
		this.username  = null;

		localStorage.setItem("loggedIn", "false");
		localStorage.removeItem("username");

		this.setCurrentEvent(this.events.USER_LOGGED_OUT, {});

		this.authDefer.resolve(this.loggedIn);

		history.push('/login');
		dispatch({type: 'RESET_APP'});
	}

	public logoutFailure(reason) {
		this.loggedIn  = false;
		this.username  = null;

		this.setCurrentEvent(this.events.USER_LOGGED_OUT, {
			error: reason
		});

		this.authDefer.resolve(this.loggedIn);
	}

	public clearCurrentEvent() {
		this.setCurrentEvent(null, null);
	}

	public setCurrentEvent(event, data) {
		this.state.currentEvent = event;
		this.state.currentData = data;
	}

	public localStorageLoggedIn() {
		return localStorage.getItem("loggedIn") === "true";
	}

	public getLocalStorageUsername() {
		return localStorage.getItem("username");
	}

	public shouldAutoLogout() {
		const sessionLogin = this.localStorageLoggedIn();

		// We are logged in on another tab but not this OR
		// we are looged out in another tab and not this
		const loginStateMismatch = (sessionLogin && !this.loggedIn) ||
									(!sessionLogin && this.loggedIn);

		// Check if we're on a logged out page i.e. registerVerify
		const isLoggedOutPage = this.loggedOutPage();
		const isStatic = this.$state.current.name.includes('app.static');

		if (loginStateMismatch && !isLoggedOutPage && !isStatic) {
			this.$window.location.reload();
		} else if (loginStateMismatch && isLoggedOutPage) {
			if (sessionLogin) {
				this.APIService.post("logout").then(() => {
					localStorage.setItem("loggedIn", "false");
					localStorage.removeItem("username");
					dispatch({ type: 'RESET_APP' });
				});
			}
		}
	}

	public loggedOutPage() {
		const state = this.$state.current.name;

		return this.loggedOutStates.some((page) => {
			return state.indexOf(page) !== -1;
		});
	}

	// TODO: This needs tidying up. Probably lots of irrelvant logic in this now
	public init() {
		this.initPromise = this.$q.defer();

		// If we are not logged in, check
		// with the API server whether we
		// are or not
		if (this.loggedIn === null) {
			// Initialize

			return this.sendLoginRequest()
				.then((data) => {
					this.initPromise.resolve(this.loggedIn);
					data.initialiser = true;
					this.loginSuccess(data);

				})
				.catch((reason) => {
					if (this.loggedIn === null) {
						this.initPromise.reject(reason);
						reason.initialiser = true;
						this.loginFailure(reason);
					}
				});
		}

		return this.initPromise.promise;
	}

	public getUsername() {
		return this.username;
	}

	public sendLoginRequest() {
		if (!this.loginRequestPromise) {
			this.loginRequestPromise =  this.APIService.get("login").then((response) => {
				this.loginRequestPromise = null;
				return response;
			}).catch(this.loginFailure.bind(this));
		}
		return this.loginRequestPromise;
	}

	public login(loginUsername, password) {
		this.authDefer = this.$q.defer();

		this.clearCurrentEvent();

		const postData = {username: loginUsername, password};

		this.APIService.post("login", postData)
			.then(this.loginSuccess.bind(this))
			.catch(this.loginFailure.bind(this));

		return this.authDefer.promise;
	}

	public logout() {
		this.authDefer = this.$q.defer();

		this.APIService.post("logout")
			.then(this.logoutSuccess.bind(this))
			.catch(this.logoutFailure.bind(this));

		return this.authDefer.promise;
	}

	public hasPermission(requiredPerm, permissions) {
		return permissions.indexOf(requiredPerm) !== -1;
	}

}

export const AuthServiceModule = angular
	.module("3drepo")
	.service("AuthService", AuthService);
