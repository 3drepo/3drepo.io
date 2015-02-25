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
.factory('Comments', ['$http', '$q', 'serverConfig', function($http, $q, serverConfig){
	var o = {};

	o.getNumberOfComments = function(account, project) {
		var self = this;

		self.n_comments = 0;

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/comments.json?mode=number'))
		.then(function(json) {
			self.n_comments = json.data.n_comments;
			deferred.resolve(self.n_comments);
		}, function(json) {
			deferred.resolve(0);
		});

		return deferred.promise();
	}

	o.refresh = function(account, project, first, last) {
		var self = this;

		self.comments = [];

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl(account + '/' + project + '/comments.json?start=' + first + '&end=' + last + '&full=true'))
		.then(function(json) {
			self.comments = json.data;
			self.n_comments = self.comments.length;
			deferred.resolve();
		}, function(json) {
			deferred.resolve();
		});

		return deferred.promise;
	};

	return o;
}]);

