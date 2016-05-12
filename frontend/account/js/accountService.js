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

	AccountService.$inject = ["$http", "$q", "serverConfig", "UtilsService"];

	function AccountService($http, $q, serverConfig, UtilsService) {
		var obj = {},
			deferred,
			bid4free;

		/**
		 * Do POST
		 *
		 * @param data
		 * @param urlEnd
		 * @param headers
		 * @returns {*|promise}
		 */
		function doPost(data, urlEnd, headers) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(urlEnd),
				config = {withCredentials: true};

			if (angular.isDefined(headers)) {
				config.headers = headers;
			}

			$http.post(url, data, config)
				.then(
					function (response) {
						deferred.resolve(response);
					},
					function (error) {
						deferred.resolve(error);
					}
				);
			return deferred.promise;
		}

		/**
		 * Get account data
		 */
		obj.getData = function (username) {
			deferred = $q.defer();

			var accountData = {};

			$http.get(serverConfig.apiUrl(username + ".json"))
				.then(function (response) {
					var i, length,
						project, projectsGrouped,
						data;

					// Groups projects under accounts
					projectsGrouped = {};
					for (i = 0, length = response.data.projects.length; i < length; i += 1) {
						project = response.data.projects[i];
						if (!(project.account in projectsGrouped)) {
							projectsGrouped[project.account] = [];
						}
						data = {
							name: project.project,
							timestamp: (project.timestamp !== null) ? UtilsService.formatTimestamp(project.timestamp) : ""
						};
						projectsGrouped[project.account].push(data);
					}

					accountData = response.data;
					accountData.projectsGrouped = projectsGrouped;

					accountData.avatarURL = serverConfig.apiUrl(username + ".jpg");
					deferred.resolve(accountData);
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

		obj.getProjectsBid4FreeStatus = function (username) {
			bid4free = $q.defer();
			$http.get(serverConfig.apiUrl(username + ".json"), {params: {bids: true}})
				.then(function (response) {
					bid4free.resolve(response);
				});
			return bid4free.promise;
		};

		/**
		 * Create a new project
		 *
		 * @param projectData
		 * @returns {*|promise}
		 */
		obj.newProject = function (projectData) {
			var data = {
				desc: "",
				type: (projectData.type === "Other") ? projectData.otherType : projectData.type
			};
			return doPost(data, projectData.account + "/" + projectData.name);
		};

		obj.uploadModel = function (projectData) {
			console.log(projectData);
			var data = new FormData();
			data.append("file", projectData.uploadFile);
			return doPost(data, projectData.account + "/" + projectData.project + "/upload", {'Content-Type': undefined});
		};

		return obj;
	}
}());
