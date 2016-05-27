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
				url = serverConfig.apiUrl(serverConfig.POST_API, urlEnd),
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
		 * Handle PUT requests
		 * @param data
		 * @param urlEnd
		 * @returns {*}
		 */
		function doPut(data, urlEnd) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.POST_API, urlEnd),
				config = {withCredentials: true};

			$http.put(url, data, config)
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
		 * Update the user info
		 *
		 * @param {String} username
		 * @param {Object} info
		 * @returns {*}
		 */
		obj.updateInfo = function (username, info) {
			return doPut(info, username);
		};

		/**
		 * Update the user password
		 *
		 * @param {String} username
		 * @param {Object} passwords
		 * @returns {*}
		 */
		obj.updatePassword = function (username, passwords) {
			return doPut(passwords, username);
		};

		obj.getProjectsBid4FreeStatus = function (username) {
			bid4free = $q.defer();
			$http.get(serverConfig.apiUrl(serverConfig.GET_API, username + ".json"), {params: {bids: true}})
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

		/**
		 * Upload file/model to database
		 *
		 * @param projectData
		 * @returns {*|promise}
		 */
		obj.uploadModel = function (projectData) {
			var data = new FormData();
			data.append("file", projectData.uploadFile);
			return doPost(data, projectData.account + "/" + projectData.project + "/upload", {'Content-Type': undefined});
		};

		/**
		 * Get upload status
		 *
		 * @param projectData
		 * @returns {*|promise}
		 */
		obj.uploadStatus = function (projectData) {
			return UtilsService.doGet(projectData.account + "/" + projectData.project + ".json");
		};

		/**
		 * Create a new database
		 *
		 * @param account
		 * @param databaseName
		 * @returns {*|promise}
		 */
		obj.newDatabase = function (account, databaseName) {
			var data = {
				database: databaseName,
				plan: "THE-100-QUID-PLAN"
			};
			return doPost(data, account + "/database");
		};

		/**
		 * Create a new subscription
		 *
		 * @param account
		 * @returns {*|promise}
		 */
		obj.newSubscription = function (account) {
			var data = {
				plan: "THE-100-QUID-PLAN"
			};
			return doPost(data, account + "/subscriptions");
		};

		/**
		 * Get user info
		 *
		 * @param username
		 * @returns {*|promise}
		 */
		obj.getUserInfo = function (username) {
			return UtilsService.doGet(username + ".json");
		};

		return obj;
	}
}());
