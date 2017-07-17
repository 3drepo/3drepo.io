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
		// https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#services

		var service = {
			getUserInfo : getUserInfo,
			newSubscription : newSubscription,
			uploadStatus : uploadStatus,
			uploadModel : uploadModel,
			newModel : newModel,
			updatePassword : updatePassword,
			updateInfo : updateInfo
		};

		return service;


		///////////

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
		function updateInfo(username, info) {
			return doPut(info, username);
		}

		/**
		 * Update the user password
		 *
		 * @param {String} username
		 * @param {Object} passwords
		 * @returns {*}
		 */
		function updatePassword(username, passwords) {
			return doPut(passwords, username);
		}

		/**
		 * Create a new model
		 *
		 * @param modelData
		 * @returns {*|promise}
		 */
		function newModel(modelData) {
			var data = {
				desc: "",
				project : modelData.project,
				type: (modelData.type === "Other") ? modelData.otherType : modelData.type,
				unit: modelData.unit,
				code: modelData.code
			};
			return doPost(data, modelData.teamspace + "/" + encodeURIComponent(modelData.name));
		}

		/**
		 * Upload file/model 
		 *
		 * @param modelData
		 * @returns {*|promise}
		 */
		function uploadModel(modelData) {
			var data = new FormData();
			data.append("file", modelData.uploadFile);
			return doPost(data, modelData.teamspace + "/" + modelData.model + "/upload", {"Content-Type": undefined});
		}

		/**
		 * Get upload status
		 *
		 * @param modelData
		 * @returns {*|promise}
		 */
		function uploadStatus(modelData) {
			return UtilsService.doGet(modelData.teamspace + "/" + modelData.model + ".json");
		}


		/**
		 * Create a new subscription
		 *
		 * @param teamspace
		 * @param data
		 * @returns {*|promise}
		 */
		function newSubscription(teamspace, data) {
			return doPost(data, teamspace + "/subscriptions");
		}

		/**
		 * Get user info
		 *
		 * @param username
		 * @returns {*|promise}
		 */
		function getUserInfo(username) {
			return UtilsService.doGet(username + ".json");
		}


	}
}());
