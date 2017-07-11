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
	.service("Auth", ["$injector", "$q", "$http", "$interval", "serverConfig", "EventService", "AnalyticService", 
		function($injector, $q, $http, $interval, serverConfig, EventService, AnalyticService) {

		var self = this;

		self.authPromise = $q.defer();
		self.loggedIn = null;
		self.username = null;

		this.loginSuccess = function(data)
		{
			self.loggedIn = true;
			self.username = data.username;
			self.userRoles = data.roles;

			EventService.send(EventService.EVENT.USER_LOGGED_IN, { username: data.username, initialiser: data.initialiser });
			AnalyticService.setUserId(self.username);

			self.authPromise.resolve(self.loggedIn);
		};

		this.loginFailure = function(reason)
		{
			self.loggedIn = false;
			self.username = null;
			self.userRoles = null;

			var initialiser = reason.initialiser;
			reason.initialiser = undefined;

			EventService.send(EventService.EVENT.USER_LOGGED_IN, { username: null, initialiser: initialiser, error: reason });

			self.authPromise.resolve(reason);
		};

		this.logoutSuccess = function()
		{
			self.loggedIn  = false;
			self.username  = null;
			self.userRoles = null;

			EventService.send(EventService.EVENT.USER_LOGGED_OUT);

			self.authPromise.resolve(self.loggedIn);
		};

		this.logoutFailure = function(reason)
		{
			self.loggedIn  = false;
			self.username  = null;
			self.userRoles = null;
			localStorage.setItem("tdrLoggedIn", "false");
			EventService.send(EventService.EVENT.USER_LOGGED_OUT, { error: reason });

			self.authPromise.resolve(self.loggedIn);
		};


		this.init = function(interval) {
			var initPromise = $q.defer();

			interval = !!interval;

			// If we are not logged in, check
			// with the API server whether we
			// are or not
			if(self.loggedIn === null || interval)
			{
				// Initialize
				$http.get(serverConfig.apiUrl(serverConfig.GET_API, "login"))
					.then(function _initSuccess(data)
					{
						// If we are not logging in because of an interval
						// then we are initializing the auth plugin
						if (!interval)
						{
							data.initialiser = true;
							self.loginSuccess(data);
						} else if (!self.loggedIn) {
							// If we are logging in using an interval,
							// we only need to run login success if the self.loggedIn
							// says we are not logged in.
							self.loginSuccess(data);
						}
					})
					.catch(function _initFailure(reason)
					{
						if (interval && reason.code == serverConfig.responseCodes.ALREADY_LOGGED_IN.code)
						{
							self.loginSuccess(reason);
						} else if (self.loggedIn === null || (interval && self.loggedIn)) {
							reason.initialiser = true;
							self.loginFailure(reason);
						}
							
					});

				self.authPromise.promise.then(function() {
					initPromise.resolve(self.loggedIn);
				});
			} else {
				if (self.loggedIn)
				{
					EventService.send(EventService.EVENT.USER_LOGGED_IN, { username: self.username });
				} else {
					EventService.send(EventService.EVENT.USER_LOGGED_OUT);
				}

				initPromise.resolve(self.loggedIn);
			}

			return initPromise.promise;
		};

		// Check for expired sessions
		var checkExpiredSessionTime = serverConfig.login_check_interval || 8; // Seconds

		this.intervalCaller = $interval(function() {
			//console.log("running init in interval call")
			self.init(true);
		}, 1000 * checkExpiredSessionTime);

		this.loadModelRoles = function(account, model)
		{
			var rolesPromise = $q.defer();

			$http.get(serverConfig.apiUrl(serverConfig.GET_API, account + "/" + model + "/roles.json"))
			.then(function(data) {
				self.modelRoles = data;
				rolesPromise.resolve();
			}).catch(function() {
				self.modelRoles = null;
				rolesPromise.resolve();
			});

			return rolesPromise.promise;
		};

		this.getUsername = function() { return this.username; };

		this.isLoggedIn = function(username) {
			return $http.get(serverConfig.apiUrl(serverConfig.GET_API, "login"));
		}

		this.login = function(username, password) {
			self.authPromise = $q.defer();

			var postData = {username: username, password: password};
			console.log("LOGIN")
			$http.post(serverConfig.apiUrl(serverConfig.POST_API, "login"), postData)
			.then(function(response){ 
				console.log("RESPONSE:" , response.data)
				self.loginSuccess(response.data)
			})
			.catch(function(response){
				console.log("RESPONSE:" , response.data)
				self.loginFailure(response.data)
			});

			return self.authPromise.promise;
		};

		this.logout = function() {
			self.authPromise = $q.defer();

			$http.post(serverConfig.apiUrl(serverConfig.POST_API, "logout")).then(self.logoutSuccess).catch(self.logoutFailure);

			return self.authPromise.promise;
		};

		this.hasPermission = function(requiredPerm, permissions){
			return permissions.indexOf(requiredPerm) !== -1;
		};

	}]);
})();
