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
	.service("Auth", ["$injector", "$q", "$http", "serverConfig", "EventService", "AnalyticService", 
		function($injector, $q, $http, serverConfig, EventService, AnalyticService) {

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

			self.authPromise.resolve(self.loggedIn);
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

		this.init = function() {
			var initPromise = $q.defer();

			// If we are not logged in, check
			// with the API server whether we
			// are or not
			if(self.loggedIn === null)
			{
				// Initialize
				$http.get(serverConfig.apiUrl(serverConfig.GET_API, "login")).success(function _initSuccess(data)
					{
						data.initialiser = true;
						self.loginSuccess(data);
					}).error(function _initFailure(reason)
					{
						reason.initialiser = true;
						self.loginFailure(reason);
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

		this.loadModelRoles = function(account, model)
		{
			var rolesPromise = $q.defer();

			$http.get(serverConfig.apiUrl(serverConfig.GET_API, account + "/" + model + "/roles.json"))
			.success(function(data) {
				self.modelRoles = data;
				rolesPromise.resolve();
			}).error(function() {
				self.modelRoles = null;
				rolesPromise.resolve();
			});

			return rolesPromise.promise;
		};

		this.getUsername = function() { return this.username; };

		this.login = function(username, password) {
			self.authPromise = $q.defer();

			var postData = {username: username, password: password};

			$http.post(serverConfig.apiUrl(serverConfig.POST_API, "login"), postData).success(self.loginSuccess).error(self.loginFailure);

			return self.authPromise.promise;
		};

		this.logout = function() {
			self.authPromise = $q.defer();

			$http.post(serverConfig.apiUrl(serverConfig.POST_API, "logout")).success(self.logoutSuccess).error(self.logoutFailure);

			return self.authPromise.promise;
		};

		this.hasPermission = function(requiredPerm, permissions){
			return permissions.indexOf(requiredPerm) !== -1;
		};

	}]);
})();
