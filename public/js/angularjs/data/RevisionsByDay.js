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
.factory('RevisionsByDay', ['$http', '$q', 'serverConfig', function($http, $q, serverConfig){
	var o = {};

	o.month = function(month) {
		var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August",
			"September", "October", "November", "December"];

		return monthNames[month];
	};

	o.getNumberOfRevisions = function(account, project, branch) {
		var self = this;

		self.n_revisions = 0;

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/revisions/' + branch + '.json?mode=number'))
		.then(function(json) {
			self.n_revisions = json.data.n_revisions;
			deferred.resolve(self.n_revisions);
		}, function(json) {
			deferred.resolve(0);
		});

		return deferred.promise;
	}

	o.refresh = function(account, project, branch, first, last) {
		var self = this;

		self.revisionsByDay = {};
		self.loading = true;

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/revisions/' + branch + '.json?start=' + first + '&end=' + last + '&full=true'))
		.then(function(json) {
			for(var rev in json.data)
			{
				var dt = new Date(json.data[rev].timestamp);

				var day = dt.getDate();
				var month = self.month(dt.getMonth());
				var year  = dt.getFullYear();

				var dtStr = day + " " + month + " " + year;

				if (!(dtStr in res))
					res[dtStr] = [];

				json.data[rev].date = dtStr;
				self.revisionsByDay[dtStr].push(json.data[rev]);
			}

			self.loading = false;
			deferred.resolve(res);
		}, function(json) {
			self.loading = false;
			deferred.resolve();
		});

		return deferred.promise;
	};

	return o;
}]);

