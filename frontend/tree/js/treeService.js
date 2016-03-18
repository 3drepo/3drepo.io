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

	angular.module('3drepo')
		.factory('TreeService', TreeService);

	TreeService.$inject = ["$http", "$q", "StateManager", "EventService", "serverConfig"];

	function TreeService($http, $q, StateManager, EventService, serverConfig) {
		var state = StateManager.state;

		var init = function() {
			var deferred = $q.defer(),
				url = "/" + state.account + "/" + state.project + "/revision/" + state.branch + "/head/fulltree.json";

			$http.get(serverConfig.apiUrl(url))
				.then(function(json) {
					deferred.resolve(json.data);
				});

			return deferred.promise;
		};

		var search = function(searchString) {
			var deferred = $q.defer(),
				url = "/" + state.account + "/" + state.project + "/revision/" + state.branch + "/head/" + searchString + "/searchtree.json";

			$http.get(serverConfig.apiUrl(url))
				.then(function(json) {
					deferred.resolve(json);
				});

			return deferred.promise;
		};

		return {
			init: init,
			search: search
		};
	}
}());