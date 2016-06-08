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
		.factory("GroupsService", GroupsService);

	GroupsService.$inject = ["$http", "$q", "serverConfig"];

	function GroupsService($http, $q, serverConfig) {
		var self = this,
			obj = {};

		/**
		 * Handle POST requests
		 * @param data
		 * @param urlEnd
		 * @returns {*}
		 */
		function doPost(data, urlEnd, headers) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.POST_API, self.account + "/" + self.project + "/" + urlEnd),
				config = {withCredentials: true};

			if (angular.isDefined(headers)) {
				config.headers = headers;
			}

			$http.post(url, data, config)
				.then(function (response) {
					deferred.resolve(response);
				});
			return deferred.promise;
		}

		/**
		 * Handle GET requests
		 * @param urlEnd
		 * @returns {*}
		 */
		function doGet(urlEnd, param) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.GET_API, self.account + "/" + self.project + "/" + urlEnd);

			var params = {};
			if (angular.isDefined(param)) {
				params.responseType = "arraybuffer";
			}
			$http.get(url, params).then(
				function (response) {
					deferred.resolve(response);
				},
				function (response) {
					deferred.resolve(response);
				});
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
				url = serverConfig.apiUrl(serverConfig.POST_API, self.account + "/" + self.project + "/" + urlEnd),
				config = {
					withCredentials: true
				};
			$http.put(url, data, config)
				.then(function (response) {
					deferred.resolve(response);
				});
			return deferred.promise;
		}

		/**
		 * Handle DELETE requests
		 *
		 * @param urlEnd
		 * @returns {Object}
		 */
		function doDelete(urlEnd) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.POST_API, self.account + "/" + self.project + "/" + urlEnd);
			$http.delete(url)
				.then(function (response) {
					deferred.resolve(response);
				});
			return deferred.promise;
		}

		/**
		 * Setup the account and project info
		 *
		 * @param {String} account
		 * @param {String} project
		 */
		obj.init = function (account, project) {
			self.account = account;
			self.project = project;
		};

		/**
		 * Get all the groups
		 *
		 * @return {Object}
		 */
		obj.getGroups = function () {
			return doGet("groups");
		};

		/**
		 * Create a group
		 *
		 * @param name
		 * @param color
		 * @returns {Object}
		 */
		obj.createGroup = function (name, color) {
			return doPost({name: name, color: color, parents: []}, "groups");
		};

		/**
		 * Delete a group
		 *
		 * @param {String} groupId
		 * @returns {Object}
		 */
		obj.deleteGroup = function (groupId) {
			return doDelete("groups/" + groupId);
		};

		/**
		 * Update the group
		 *
		 * @param {Object} group
		 * @returns {Object}
		 */
		obj.updateGroup = function (group) {
			return doPut(group, "groups/" + group._id);
		};

		return obj;
	}
}());
