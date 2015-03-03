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
.factory('Users', ['$http', '$q', 'serverConfig', function($http, $q, serverConfig){
	var o = {};

	o.userRoles = [
		{label: 'Owner', value: 1},
		{label: 'Admin', value: 2},
		{label: 'Viewer', value: 3}
	];

	o.refresh = function(account, project) {
		var self = this;

		self.users		= [];

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/users.json'))
		.then(function(json) {
			self.users = json.data;
			deferred.resolve();
		});

		return deferred.promise;
	};

	o.updateUsers = function()
	{
		return null;
	};

	return o;
}]);

