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
	.service("Auth", ["$injector", "$q", "$http", "serverConfig", "EventService", function($injector, $q, $http, serverConfig, EventService) {
		this.loggedIn = null;
		this.username = null;
		var self = this;

		this.init = function() {
			var deferred = $q.defer();

			// If we are not logged in, check
			// with the API server whether we
			// are or not
			if(self.loggedIn === null)
			{
				// Initialize
				$http.get(serverConfig.apiUrl("login"))
				.success(function(data) {
					self.loggedIn = true;
					self.username = data.username;
					self.userRoles = data.roles;
									
					EventService.send(EventService.EVENT.USER_LOGGED_IN, { username: data.username });
					
					deferred.resolve(self.loggedIn);
				}).error(function() {
					self.loggedIn = false;
					self.username = null;
					self.userRoles = null;
					
					EventService.send(EventService.EVENT.USER_LOGGED_OUT);
					
					deferred.resolve(self.loggedIn);
				});
			} else {
				if (self.loggedIn)
				{
					EventService.send(EventService.EVENT.USER_LOGGED_IN, { username: self.username });
				} else {
					EventService.send(EventService.EVENT.USER_LOGGED_OUT);
				}
				
				deferred.resolve(self.loggedIn);
			}

			return deferred.promise;
		};

		this.loadProjectRoles = function(account, project)
		{
			var deferred = $q.defer();

			$http.get(serverConfig.apiUrl(account + "/" + project + "/roles.json"))
			.success(function(data) {
				self.projectRoles = data;
				deferred.resolve();
			}).error(function() {
				self.projectRoles = null;
				deferred.resolve();
			});

			return deferred.promise;
		};

		this.getUsername = function() { return this.username; };

		this.login = function(username, password) {
			var deferred = $q.defer();

			var postData = {username: username, password: password};
			var http = $injector.get("$http");

			http.post(serverConfig.apiUrl("login"), postData)
			.success(function (data) {
				self.username = username;
				self.userRoles = data.roles;
				
				EventService.send(EventService.EVENT.USER_LOGGED_IN, { username: username });
			})
			.error(function(data) {
				EventService.send(EventService.EVENT.USER_LOGGED_OUT);
			});

			return deferred.promise;
		};

		this.logout = function() {
			var deferred = $q.defer();
			var http = $injector.get("$http");

			http.post(serverConfig.apiUrl("logout"))
			.success(function _authLogOutSuccess() {
				self.username = null;
				EventService.send(EventService.EVENT.USER_LOGGED_OUT);
			})
			.error(function _authLogOutFailure() {
				self.username = null;
				EventService.send(EventService.EVENT.USER_LOGGED_OUT);
			});

			return deferred.promise;
		};
	}]);
})();
