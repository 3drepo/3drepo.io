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

(function() {
	"use strict";

	angular.module("3drepo")
		.service("AuthService", [
			"$injector", "$q", "$interval", "ClientConfigService",
			"EventService", "AnalyticService", "$location", "$window",
			"$mdDialog", "APIService",
			function(
				$injector, $q, $interval, ClientConfigService, 
				EventService, AnalyticService, $location, $window,
				$mdDialog, APIService
			) {

				var authPromise = $q.defer();

				var doNotLogout = [
					"/terms", 
					"/privacy",
					"/signUp", 
					"/passwordForgot", 
					"/passwordChange",
					"/registerRequest", 
					"/registerVerify"
				];

				var legalPages = [
					"terms", 
					"privacy",
					"cookies"
				];

				var loggedOutPages = [
					"sign-up",
					"password-forgot",
					"register-request",
					"register-verify",
					"password-change"
				];

				var loggedOutPagesCamel = [
					"signUp",
					"passwordForgot",
					"registerRequest",
					"registerVerify",
					"passwordChange"
				];

				// TODO: null means it"s the first login, 
				// should be a seperate var
				var loggedIn = null;
				var username;

				initAutoLogout();

				var service = {
					username: username,
					loggedIn : loggedIn,
					isLoggedIn: isLoggedIn,
					init : init,
					getUsername: getUsername,
					login: login,
					logout: logout,
					hasPermission: hasPermission,
					sendLoginRequest: sendLoginRequest,
					authPromise : authPromise.promise,
					localStorageLoggedIn: localStorageLoggedIn,
					loggedOutPage: loggedOutPage,
					legalPages: legalPages,
					doNotLogout: doNotLogout,
					loggedOutPages: loggedOutPages,
					logoutSuccess: logoutSuccess
				};

				return service;

				////////

				function isLoggedIn() {
					return loggedIn;
				}

				function initAutoLogout() {
					// Check for mismatch
					var checkLoginMismatch = ClientConfigService.login_check_interval || 4; // Seconds

					$interval(function() {
						//console.log("auto - calling interval init")
						init(true);
					}, 1000 * checkLoginMismatch);

				}
				
				function loginSuccess(response) {

					loggedIn = true;
					username = response.data.username;

					// Set the session as logged in on the client 
					// using local storage
					localStorage.setItem("loggedIn", "true");

					EventService.send(EventService.EVENT.USER_LOGGED_IN, { 
						username: response.data.username, 
						initialiser: response.data.initialiser 
					});
					AnalyticService.setUserId(username);

					authPromise.resolve(loggedIn);
				}

				function loginFailure(response) {
					loggedIn = false;
					username = null;

					var initialiser = response.initialiser;
					response.initialiser = undefined;

					localStorage.setItem("loggedIn", "false");

					EventService.send(EventService.EVENT.USER_LOGGED_IN, { 
						username: null, 
						initialiser: initialiser, 
						error: response.data 
					});

					authPromise.resolve(response.data);
				}

				function logoutSuccess() {
					loggedIn  = false;
					username  = null;

					localStorage.setItem("loggedIn", "false");

					EventService.send(EventService.EVENT.USER_LOGGED_OUT);

					authPromise.resolve(loggedIn);
				}

				function logoutFailure(reason) {
					loggedIn  = false;
					username  = null;

					// localStorage.setItem("logged", "false");
					EventService.send(
						EventService.EVENT.USER_LOGGED_OUT, 
						{ error: reason }
					);

					authPromise.resolve(loggedIn);
				}

				function localStorageLoggedIn() {
					if (localStorage.getItem("loggedIn") === "true") {
						return true;
					}
					return false;
				}


				function shouldAutoLogout() {

					var sessionLogin = localStorageLoggedIn();

					// We are logged in on another tab but not this OR 
					// we are looged out in another tab and not this
					var loginStateMismatch = (sessionLogin && !loggedIn) ||
												(!sessionLogin && loggedIn);

					// Check if we're on a logged out page i.e. registerVerify
					var isLoggedOutPage = loggedOutPage();

					if (loginStateMismatch && !isLoggedOutPage) {
						$window.location.reload();
					} else if (loginStateMismatch && isLoggedOutPage) {
						$location.path("/");
					}
						
				}

				function loggedOutPage() {
					var path = $location.path();
					var isLoggedOutPage = loggedOutPagesCamel.filter(function(page){
						return path.indexOf(page) !== -1;
					}).length > 0;
					return isLoggedOutPage; 
				}

				// TODO: This needs tidying up. Probably lots of irrelvant logic in this now
				function init(interval) {

					var initPromise = $q.defer();

					interval = !!interval;

					// If we are not logged in, check
					// with the API server whether we
					// are or not
					if(loggedIn === null) {
						// Initialize
						//console.log("auto - sendLoginRequest");
						sendLoginRequest()
							.then(function(data) {
								// If we are not logging in because of an interval
								// then we are initializing the auth plugin
								if (!interval) {
									data.initialiser = true;
									loginSuccess(data);
								} else if (!loggedIn) {
									// If we are logging in using an interval,
									// we only need to run login success if the loggedIn
									// says we are not logged in.
									loginSuccess(data);
								}
							})
							.catch(function(reason) {
								var code = ClientConfigService.responseCodes.ALREADY_LOGGED_IN.code;
								if (interval && reason.code == code) {

									loginSuccess(reason);

								} else if (loggedIn === null || (interval && loggedIn)) {

									reason.initialiser = true;
									loginFailure(reason);

								}
							});

						authPromise.promise.then(function() {
							initPromise.resolve(loggedIn);
						}).catch(function(error){
							//console.error("auto - Authentication error:", error);
							initPromise.reject(error);
						});

					} else if (interval) {
						authPromise.promise.then(function(){
							shouldAutoLogout();
							initPromise.resolve(loggedIn);
	
						});				
					}

					return initPromise.promise;
				}

				function getUsername( ) { 
					return username; 
				}


				function sendLoginRequest() {
					return APIService.get("login");
				}

				function login(loginUsername, password) {
					authPromise = $q.defer();

					var postData = {username: loginUsername, password: password};

					APIService.post("login", postData)
						.then(loginSuccess)
						.catch(loginFailure);

					return authPromise.promise;
				}

				function logout() {
					authPromise = $q.defer();

					APIService.post("logout")
						.then(logoutSuccess)
						.catch(logoutFailure);

					return authPromise.promise;
				}

				function hasPermission(requiredPerm, permissions) {
					return permissions.indexOf(requiredPerm) !== -1;
				}

			}]);
})();
