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
		.factory("BidService", BidService);

	BidService.$inject = ["$http", "$q", "StateManager", "serverConfig"];

	function BidService($http, $q, StateManager, serverConfig) {
		var obj = {},
			state = StateManager.state,
			currentPackage,
			boq, boqTotal,
			self = this;

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

		obj.setAccountAndProject = function (account, project) {
			self.account = account;
			self.project = project;
		};

		obj.addPackage = function (data) {
			return doPost(data, "packages.json");
		};

		obj.inviteSubContractor = function (packageName, data) {
			return doPost(data, "packages/" + packageName + "/bids.json");
		};

		/**
		 * Accept or decline a package bid invitation
		 * @param packageName
		 * @returns {*}
		 */
		obj.acceptInvite = function (packageName, accept) {
			return doPost({accept: accept}, "packages/" + packageName + "/bids/mine/invitation");
		};

		obj.awardBid = function (packageName, bidId) {
			return doPost({}, "packages/" + packageName + "/bids/" + bidId + "/award");
		};

		/**
		 * Get all or named package(s)
		 * @param name
		 * @returns {*}
		 */
		obj.getPackage = function (name) {
			var part = angular.isDefined(name) ? ("/" + name) : "";
			return doGet("packages" + part + ".json");
		};

		/**
		 * Get all or named package(s)
		 * @param account
		 * @param project
		 * @param name
		 * @returns {*}
		 */
		obj.getProjectPackage = function (account, project, name) {
			state.account = account;
			state.project = project;
			var part = angular.isDefined(name) ? ("/" + name) : "";
			return doGet("packages" + part + ".json");
		};

		/**
		 * Get all bids for a package
		 * @param packageName
		 * @returns {*}
		 */
		obj.getBids = function (packageName) {
			return doGet("packages/" + packageName + "/bids.json");
		};

		/**
		 * Get user bids for a package
		 * @param packageName
		 * @returns {*}
		 */
		obj.getUserBid = function (packageName) {
			return doGet("packages/" + packageName + "/bids/mine.json");
		};

		/**
		 * Get user bids for a package
		 * @param account
		 * @param project
		 * @param packageName
		 * @returns {*}
		 */
		obj.getProjectUserBids = function (account, project, packageName) {
			state.account = account;
			state.project = project;
			return doGet("packages/" + packageName + "/bids/mine.json");
		};

		/**
		 * Get terms and conditions
		 * @param packageName
		 */
		obj.getTermsAndConditions = function (packageName) {
			return doGet("packages/" + packageName + "/bids/mine/termsAndConds.json");
		};

		/**
		 * Update terms and conditions
		 * @param packageName
		 * @param data
		 * @returns {*}
		 */
		obj.updateTermsAndConditions = function (packageName, data) {
			return doPut(data, "packages/" + packageName + "/bids/mine/termsAndConds.json");
		};

		/**
		 * Save files to DB
		 * @param packageName
		 * @param files
		 * @returns {*}
		 */
		obj.saveFiles = function (packageName, files) {
			var i, length, data = new FormData();
			for (i = 0, length = files.length; i < length; i += 1) {
				data.append("attachment", files[i]);
			}
			return doPost(data, "/packages/" + packageName + "/attachments", {'Content-Type': undefined});
		};

		obj.getFile = function (packageName, fileId) {
			return doGet("/packages/" + packageName + "/attachments/" + fileId, {});
		};

		/**
		 * Convert a date to a readable version
		 * @param date
		 * @returns {string}
		 */
		obj.prettyDate = function (date) {
			return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
		};

		Object.defineProperty(
			obj,
			"currentPackage",
			{
				get: function () {return currentPackage;},
				set: function (aPackage) {currentPackage = aPackage;}
			}
		);

		Object.defineProperty(
			obj,
			"boq",
			{
				get: function () {return boq;},
				set: function (data) {boq = data;}
			}
		);

		Object.defineProperty(
			obj,
			"boqTotal",
			{
				get: function () {return boqTotal;},
				set: function (total) {boqTotal = total;}
			}
		);

		return obj;
	}
}());
