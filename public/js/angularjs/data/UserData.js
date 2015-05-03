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
.factory('UserData', ['$http', '$q', 'serverConfig', function($http, $q, serverConfig){
	var o = {};

	o.refresh = function(username) {
		var self = this;

		self.firstName = "";
		self.lastName  = "";
		self.email     = "";
		self.projects  = [];

		self.avatarURL = serverConfig.apiUrl(username + '.jpg');

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(username + '.json'))
		.then(function(json) {
			self.username = username;

			if(json.data.firstName)
				self.firstName = json.data.firstName;

			if(json.data.lastName)
				self.lastName  = json.data.lastName;

			if(json.data.email)
				self.email     = json.data.email;

			if(json.data.projects) {
				self.projects  = json.data.projects;
				// // TODO: temporary hack to inject masonry sizing classes
				// for (var p = 0; p < self.projects.length; p++) {
				// 	self.projects[p]['tileSize'] = 'wh2';
				// }

				self.projectsGrouped = {}
				for (var p = 0; p < self.projects.length; p++) {
					var project = self.projects[p];
					if (!(project['account'] in self.projectsGrouped)) {
						self.projectsGrouped[project['account']] = [];
					}
					self.projectsGrouped[project['account']].push(project['project']);
				}
			}

			return $http.get(self.avatarURL);
		}, function(message) {
			self.loadError = "[" + message + "]";
			return $q.reject(message);
		}).then(function(json) {
			self.hasAvatar = true;
			self.loading   = false;
			deferred.resolve();
		}, function(message) {
			self.hasAvatar = false;
			self.loading   = false;
			deferred.resolve();
		});

		return deferred.promise;
	};

	o.updatePassword = function(oldPassword, newPassword)
	{
		var passwords = {
			oldPassword: oldPassword,
			newPassword: newPassword
		};

		return $http.post(serverConfig.apiUrl(this.username), passwords);
	};

	o.updateUser = function()
	{
		var user = {
			email: this.email,
			firstName: this.firstName,
			lastName: this.lastName
		};

		return $http.post(serverConfig.apiUrl(this.username), user);
	};

	return o;
}]);

