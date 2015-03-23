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
.factory('PointData', ['$http', '$q', 'serverConfig', function($http, $q, serverConfig) {
	var o = {};

	o.refresh = function(uids, mode) {
		var self = this;

		self.uids		= uids;
		self.mode		= mode;
		self.pointData	= {};

		var deferred = $q.defer();

		if (self.uids) {
			$http.get(serverConfig.apiUrl('wayfinder/record.json'),
				{ params : { uid: JSON.stringify(self.uids) }})
			.then(function(json) {
				self.pointData = json.data;

				if(mode == 'flythru')
					runFlyThru(self.pointData);
				else
					window.spheres.plotSpheres(self.pointData);

				deferred.resolve();
			}, function(message) {
				deferred.resolve();
			});
		} else {
			if (window.spheres)
				window.spheres.clearSpheres();
		}

		return deferred.promise;
	};

	return o;
}]);


