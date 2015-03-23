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
.factory('Wayfinder', ['$http', '$q', 'serverConfig', function($http, $q, serverConfig) {
	var o = {};

	o.refresh = function() {
		var self = this;

		self.previous = {};

		var deferred = $q.defer();

		$http.get(serverConfig.apiUrl('wayfinder.json'))
		.then(function(previous) {
			if(previous.data && previous.data != "Unauthorized")
			{
				self.previous = previous.data.map(function(item) {
					var date = new Date(item.timestamp*1000);
					return { label: item.user + ' @ ' + date, value: item._id };
				});
			} else {
				return {};
			}

			deferred.resolve();
		}, function(message) {
			deferred.resolve();
		});

		return deferred.promise;
	};

	return o;
}]);


