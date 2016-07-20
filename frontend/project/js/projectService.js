/**
 *  Copyright (C) 2015 3D Repo Ltd
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
		.factory("ProjectService", ProjectService);

	ProjectService.$inject = ["$http", "$q", "StateManager", "serverConfig", "HttpService", "Auth"];

	function ProjectService($http, $q, StateManager, serverConfig, HttpService, Auth) {
		var state = StateManager.state;

		var getProjectInfo = function (account, project) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.GET_API, account + "/" + project + ".json");

			return HttpService.get(serverConfig.GET_API, account + "/" + project + ".json",
				function(json) {
					deferred.resolve({
						account     : account,
						project		: project,
						name        : name,
						owner		: json.owner,
						description	: json.desc,
						type		: json.type,
						settings 	: json.properties
					});
				});
		};

		var getRoles = function (account, project) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.GET_API, account + "/" + project + "/roles.json");

			$http.get(url)
				.then(
					function(data) {
						deferred.resolve(data.data);
					},
					function () {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		var getUserRolesForProject = function () {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.GET_API, state.account + "/" + state.project + "/" + Auth.username + "/userRolesForProject.json");

			$http.get(url)
				.then(
					function(response) {
						deferred.resolve(response.data);
					},
					function () {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		var getUserRoles = function (account, project) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.GET_API, account + "/" + project + "/" + Auth.username + "/userRolesForProject.json");

			$http.get(url)
				.then(
					function(response) {
						deferred.resolve(response.data);
					},
					function () {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		function doPost(data, urlEnd) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.POST_API, state.account + "/" + state.project + "/" + urlEnd),
				config = {
					withCredentials: true
				};
			$http.post(url, data, config)
				.then(function (response) {
					deferred.resolve(response);
				});
			return deferred.promise;
		}

		var createProjectSummary = function (data) {
			data.name = state.project;
			return doPost(data, "info.json");
		};

		function doGet(urlEnd) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.GET_API, state.account + "/" + state.project + "/" + urlEnd);
			$http.get(url).then(
				function (response) {
					deferred.resolve(response);
				},
				function () {
					deferred.resolve([]);
				});
			return deferred.promise;
		}

		var getProjectSummary = function () {
			return doGet("info.json");
		};

		return {
			getRoles: getRoles,
			getUserRolesForProject: getUserRolesForProject,
			getUserRoles: getUserRoles,
			createProjectSummary: createProjectSummary,
			getProjectSummary: getProjectSummary,
			getProjectInfo: getProjectInfo
		};
	}
}());
