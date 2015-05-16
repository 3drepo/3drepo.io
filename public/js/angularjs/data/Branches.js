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
.factory('Branches', ['$http', '$q', 'serverConfig', 'StateManager', function($http, $q, serverConfig, StateManager){
	var o = {};

	o.refresh = function() {
		var self = this;
		var account = StateManager.state.account;
		var project = StateManager.state.project;

		self.branches = [];

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/branches.json'))
		.then(function(json) {
			self.branches = json.data.map(function (item) {
				if (item.name == "00000000-0000-0000-0000-000000000000")
					return "master";
				else
					return item.name;
			});

			deferred.resolve();
		}, function(message) {
			deferred.resolve();
		});

		return deferred.promise;
	};

	return o;
}]);

