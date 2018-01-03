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

export class AuthService {

	public static $inject: string[] = [
		"$injector",
		"$q",
		"$interval",
		"$location",
		"$window",
		"$mdDialog",

		"ClientConfigService",
		"AnalyticService",
		"APIService",
	];

	public authDefer;

	private doNotLogout;
	private legalPages;
	private loggedOutPages;
	private loggedOutPagesCamel;
	private username;
	private loggedIn;
	private state;
	private events;

	constructor(
		private $injector,
		private $q,
		private $interval,
		private $location,
		private $window,
		private $mdDialog,

		private ClientConfigService: any,
		private AnalyticService: any,
		private APIService: any,
	) {

		this.authDefer = $q.defer();

		this.doNotLogout = [
			"/terms",
			"/privacy",
			"/signUp",
			"/passwordForgot",
			"/passwordChange",
			"/registerRequest",
			"/registerVerify",
		];

		this.legalPages = [
			"terms",
			"privacy",
			"cookies",
		];

		this.loggedOutPages = [
			"sign-up",
			"password-forgot",
			"register-request",
			"register-verify",
			"password-change",
		];

		this.loggedOutPagesCamel = [
			"signUp",
			"passwordForgot",
			"registerRequest",
			"registerVerify",
			"passwordChange",
		];

		// TODO: null means it"s the first login,
		// should be a seperate var
		this.loggedIn = null;

		this.initAutoLogout();

		this.state = {};
		this.events = {
			USER_LOGGED_IN : "USER_LOGGED_IN",
			USER_LOGGED_OUT : "USER_LOGGED_OUT",
		};

	}

	public isLoggedIn() {
		return this.loggedIn;
	}

	public  initAutoLogout() {
		// Check for mismatch
		const checkLoginMismatch = this.ClientConfigService.login_check_interval || 4; // Seconds

		this.$interval(() => {
			this.init(true);
		}, 1000 * checkLoginMismatch);

	}

	public loginSuccess(response: any) {

		this.loggedIn = true;
		this.username = response.data.username;

		// Set the session as logged in on the client
		// using local storage
		localStorage.setItem("loggedIn", "true");

		this.setCurrentEvent(this.events.USER_LOGGED_IN, {
			username: response.data.username,
			initialiser: response.data.initialiser,
		});

		this.AnalyticService.setUserId(this.username);

		this.authDefer.resolve(this.loggedIn);
	}

	public loginFailure(response) {
		this.loggedIn = false;
		this.username = null;

		const initialiser = response.initialiser;
		response.initialiser = undefined;

		localStorage.setItem("loggedIn", "false");

		this.setCurrentEvent(this.events.USER_LOGGED_IN, {
			username: null,
			initialiser,
			error: response.data,
		});

		this.authDefer.resolve(response.data);
	}

	public logoutSuccess() {
		this.loggedIn  = false;
		this.username  = null;

		localStorage.setItem("loggedIn", "false");
		this.setCurrentEvent(this.events.USER_LOGGED_OUT, {});

		this.authDefer.resolve(this.loggedIn);
	}

	public logoutFailure(reason) {
		this.loggedIn  = false;
		this.username  = null;

		this.setCurrentEvent(this.events.USER_LOGGED_OUT, {
			error: reason,
		});

		this.authDefer.resolve(this.loggedIn);
	}

	public setCurrentEvent(event, data) {
		this.state.currentEvent = event;
		this.state.currentData = data;
	}

	public localStorageLoggedIn() {
		if (localStorage.getItem("loggedIn") === "true") {
			return true;
		}
		return false;
	}

	public shouldAutoLogout() {

		const sessionLogin = this.localStorageLoggedIn();

		// We are logged in on another tab but not this OR
		// we are looged out in another tab and not this
		const loginStateMismatch = (sessionLogin && !this.loggedIn) ||
									(!sessionLogin && this.loggedIn);

		// Check if we're on a logged out page i.e. registerVerify
		const isLoggedOutPage = this.loggedOutPage();

		if (loginStateMismatch && !isLoggedOutPage) {
			this.$window.location.reload();
		} else if (loginStateMismatch && isLoggedOutPage) {
			this.$location.path("/");
		}

	}

	public loggedOutPage() {
		const path = this.$location.path();
		const isLoggedOutPage = this.loggedOutPagesCamel.filter((page) => {
			return path.indexOf(page) !== -1;
		}).length > 0;
		return isLoggedOutPage;
	}

	// TODO: This needs tidying up. Probably lots of irrelvant logic in this now
	public init(interval) {

		const initPromise = this.$q.defer();

		interval = !!interval;

		// If we are not logged in, check
		// with the API server whether we
		// are or not
		if (this.loggedIn === null) {
			// Initialize
			// console.log("auto - sendLoginRequest");
			this.sendLoginRequest()
				.then((data) => {
					// If we are not logging in because of an interval
					// then we are initializing the auth plugin
					if (!interval) {
						data.initialiser = true;
						this.loginSuccess(data);
					} else if (!this.loggedIn) {
						// If we are logging in using an interval,
						// we only need to run login success if the loggedIn
						// says we are not logged in.
						this.loginSuccess(data);
					}
				})
				.catch((reason) => {
					const code = this.ClientConfigService.responseCodes.ALREADY_LOGGED_IN.code;
					if (interval && reason.code === code) {

						this.loginSuccess(reason);

					} else if (this.loggedIn === null || (interval && this.loggedIn)) {

						reason.initialiser = true;
						this.loginFailure(reason);

					}
				});

			this.authDefer.promise.then(() => {
				initPromise.resolve(this.loggedIn);
			}).catch((error) => {
				// console.error("auto - Authentication error:", error);
				initPromise.reject(error);
			});

		} else if (interval) {
			this.authDefer.promise.then(() => {
				this.shouldAutoLogout();
				initPromise.resolve(this.loggedIn);
			});
		}

		return initPromise.promise;
	}

	public getUsername() {
		return this.username;
	}

	public sendLoginRequest() {
		return this.APIService.get("login");
	}

	public login(loginUsername, password) {
		this.authDefer = this.$q.defer();

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
