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
			currentPackage;

		function doPost(data, urlEnd) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(state.account + "/" + state.project + "/" + urlEnd),
				config = {
					withCredentials: true
				};
			$http.post(url, data, config)
				.then(function (response) {
					deferred.resolve(response);
				});
			return deferred.promise;
		}

		function doGet(urlEnd) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(state.account + "/" + state.project + "/" + urlEnd);
			$http.get(url).then(
				function (response) {
					deferred.resolve(response);
				},
				function () {
					deferred.resolve([]);
				});
			return deferred.promise;
		}

		obj.addPackage = function (data) {
			return doPost(data, "packages.json");
		};

		obj.inviteSubContractor = function (packageName, data) {
			return doPost(data, "packages/" + packageName + "/bids.json");
		};

		obj.acceptInvite = function (packageName) {
			return doPost({}, "packages/" + packageName + "/bids/mine/accept");
		};

		obj.awardBid = function (packageName, bidId) {
			return doPost({}, "packages/" + packageName + "/bids/" + bidId + "/award");
		};

		// Get all or named package(s)
		obj.getPackage = function (name) {
			var part = angular.isDefined(name) ? ("/" + name) : "";
			return doGet("packages" + part + ".json");
		};

		// Get all or named package(s)
		obj.getProjectPackage = function (account, project, name) {
			state.account = account;
			state.project = project;
			var part = angular.isDefined(name) ? ("/" + name) : "";
			return doGet("packages" + part + ".json");
		};

		// Get all bids for a package
		obj.getBids = function (packageName) {
			return doGet("packages/" + packageName + "/bids.json");
		};

		// Get user bids for a package
		obj.getUserBid = function (packageName) {
			return doGet("packages/" + packageName + "/bids/mine.json");
		};

		// Get user bids for a package
		obj.getProjectUserBids = function (account, project, packageName) {
			state.account = account;
			state.project = project;
			return doGet("packages/" + packageName + "/bids/mine.json");
		};

		Object.defineProperty(
			obj,
			"currentPackage",
			{
				get: function () {return currentPackage;},
				set: function (aPackage) {currentPackage = aPackage;}
			}
		);

		return obj;
	}
}());