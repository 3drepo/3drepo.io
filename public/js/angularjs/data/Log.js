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
.factory('Log', ['$http', '$q', 'serverConfig', function($http, $q, serverConfig){
	var o = {};

	o.getNumberOfLogEntries = function(account, project) {
		var self = this;

		self.n_logentries = 0;
		self.loading = true;

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/log.json?mode=number'))
		.then(function(json) {
			self.n_logentries = json.data.n_logentries;
			self.loading = false;
			deferred.resolve(self.n_logentries);
		}, function(json) {
			deferred.resolve(0);
		});

		return deferred.promise;
	}

	o.refresh = function(account, project, first, last) {
		var self = this;

		self.log = [];
		self.n_log = 0;

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/log.json?first=' + first + '&last=' + last))
		.then(function(json) {
			self.log = json.data;
			self.loading = false;
			deferred.resolve();
		}, function(message) {
			self.loading = false;
			deferred.resolve();
		});

		return deferred.promise;
	};

	return o;
}]);

