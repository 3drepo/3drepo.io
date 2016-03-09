/**
 *  Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module("3drepo")
		.factory("AccountService", AccountService);

	AccountService.$inject = ["$http", "$q", "serverConfig", "StateManager"];

	function AccountService($http, $q, serverConfig, StateManager) {
		var obj = {},
			deferred;

		/**
		 * Get account data
		 */
		obj.getData = function () {
			deferred = $q.defer();
			$http.get(serverConfig.apiUrl(StateManager.state.account + '.json'))
				.then(function (response) {
					var i, length,
						project, projectsGrouped;
					console.log(response);

					// Groups projects under accounts
					projectsGrouped = {};
					for (i = 0, length = response.data.projects.length; i < length; i += 1) {
						project = response.data.projects[i];
						if (!(project.account in projectsGrouped)) {
							projectsGrouped[project.account] = [];
						}
						projectsGrouped[project.account].push(project.project);
					}
					response.data.projectsGrouped = projectsGrouped;

					deferred.resolve(response);
				});
			return deferred.promise;
		};

		/**
		 * Update the user info
		 *
		 * @param {String} username
		 * @param {Object} info
		 * @returns {*}
		 */
		obj.updateInfo = function (username, info) {
			deferred = $q.defer();
			$http.post(serverConfig.apiUrl(username), info)
				.then(function (response) {
					console.log(response);
					deferred.resolve(response);
				});

			return deferred.promise;
		};

		/**
		 * Update the user password
		 *
		 * @param {String} username
		 * @param {Object} passwords
		 * @returns {*}
		 */
		obj.updatePassword = function (username, passwords) {
			deferred = $q.defer();
			$http.post(serverConfig.apiUrl(username), passwords)
				.then(function (response) {
					console.log(response);
					deferred.resolve(response);
				});

			return deferred.promise;
		};

		return obj;
	}
}());
