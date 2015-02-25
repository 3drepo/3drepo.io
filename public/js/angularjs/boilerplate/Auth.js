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

angular.module('3drepo')
.service('Auth', ['$injector', '$q', '$state', 'serverConfig', function($injector, $q, $state, serverConfig) {
	this.loggedIn = null;
	this.username = null;
	var self = this;

	this.isLoggedIn = function() {
		var deferred = $q.defer();

		// If we are not logged in, check
		// with the API server whether we
		// are or not
		if(self.loggedIn === null)
		{
			var http = $injector.get('$http');

			// Initialize
			http.get(serverConfig.apiUrl('login'))
			.success(function(data, status) {
				self.loggedIn = true;
				self.username = data.username;
				deferred.resolve(self.loggedIn);
			}).error(function(data, status) {
				self.loggedIn = false;
				self.username = null;
				deferred.resolve(self.loggedIn);
			});
		} else {
			deferred.resolve(self.loggedIn);
		}

		return deferred.promise;
	}

	this.getUsername = function() { return this.username; }

	this.login = function(username, password) {
		var deferred = $q.defer();

		var postData = {username: username, password: password};
		var http = $injector.get('$http');

		http.post(serverConfig.apiUrl('login'), postData)
		.success(function () {
			self.username = username;
			self.loggedIn = true;
			deferred.resolve(username);
		})
		.error(function(data, status) {
			self.username = null;
			self.loggedIn = false;

			if (status == 401)
			{
				deferred.reject("Unauthorized");
			} else if (status == 400) {
				deferred.reject("Invalid username/password");
			} else {
				deferred.reject("Unknown error");
			}
		});

		return deferred.promise;
	}

	this.logout = function() {
		var deferred = $q.defer();
		var http = $injector.get('$http');

		http.post(serverConfig.apiUrl('logout'))
		.success(function _authLogOutSuccess() {
			self.username = null;
			self.loggedIn = false;

			deferred.resolve();
		})
		.error(function _authLogOutFailure() {
			deferred.reject("Unable to logout.");
		});

		return deferred.promise;
	}

	this.isLoggedIn().then(function _loginCtrlCheckLoggedInSuccess(result) {
		self.loggedIn = result;
	});
}])
.run(['$location', 'Auth', function($location, Auth) {
	Auth.isLoggedIn().then(function (isLoggedIn)
	{
		if (!isLoggedIn)
			$location.path('/login');
	});
}]);

