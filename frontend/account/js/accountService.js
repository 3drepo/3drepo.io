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

		// obj.getModelsBid4FreeStatus = function (username) {
		// 	bid4free = $q.defer();
		// 	$http.get(serverConfig.apiUrl(serverConfig.GET_API, username + ".json"), {params: {bids: true}})
		// 		.then(function (response) {
		// 			bid4free.resolve(response);
		// 		});
		// 	return bid4free.promise;
		// };

		/**
		 * Create a new model
		 *
		 * @param modelData
		 * @returns {*|promise}
		 */
		obj.newModel = function (modelData) {
			var data = {
				desc: "",
				project : modelData.project,
				type: (modelData.type === "Other") ? modelData.otherType : modelData.type,
				unit: modelData.unit,
				code: modelData.code
			};
			return doPost(data, modelData.teamspace + "/" + encodeURIComponent(modelData.name));
		};

		/**
		 * Upload file/model 
		 *
		 * @param modelData
		 * @returns {*|promise}
		 */
		obj.uploadModel = function (modelData) {
			var data = new FormData();
			data.append("file", modelData.uploadFile);
			return doPost(data, modelData.teamspace + "/" + modelData.model + "/upload", {'Content-Type': undefined});
		};

		/**
		 * Get upload status
		 *
		 * @param modelData
		 * @returns {*|promise}
		 */
		obj.uploadStatus = function (modelData) {
			return UtilsService.doGet(modelData.teamspace + "/" + modelData.model + ".json");
		};


		/**
		 * Create a new subscription
		 *
		 * @param teamspace
		 * @param data
		 * @returns {*|promise}
		 */
		obj.newSubscription = function (teamspace, data) {
			return doPost(data, teamspace + "/subscriptions");
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
