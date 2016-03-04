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

	AccountService.$inject = ["$http", "$q", "serverConfig"];

	function AccountService($http, $q, serverConfig) {
		var obj = {},
			deferred;

		obj.updateInfo = function (username, info) {
			deferred = $q.defer();
			$http.post(serverConfig.apiUrl(username), info)
				.then(function successCallback(response) {
					console.log(response);
					deferred.resolve(response);
				});

			return deferred.promise;
		};

		obj.updatePassword = function (username, passwords) {
			deferred = $q.defer();
			$http.post(serverConfig.apiUrl(username), passwords)
				.then(function successCallback(response) {
					console.log(response);
					deferred.resolve(response);
				});

			return deferred.promise;
		};

		return obj;
	}
}());
