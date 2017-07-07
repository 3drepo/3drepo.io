/**
 *  Copyright (C) 2014 3D Repo Ltd
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

(function() {
	"use strict";

	angular.module("3drepo")
	.factory("authInterceptor", ["EventService", "$q", function(EventService, $q) {
		return {
			responseError: function(res)
			{
				if (res.status === 401) {
					EventService.send(EventService.EVENT.USER_NOT_AUTHORIZED);
				}

				return $q.reject(res);
			}
		};
	}])
	.config(["$httpProvider", function ($httpProvider) {
		var checkAuthorization = ["$q", "$location", function($q, $location) {
			var onSuccess = function (res) { return res;};
			var onError = function(res) {
				if (res.status === 401 || res.status === 400) {
					return $q.reject(res);
				} else {
					return $q.reject(res);
				}
			};

			return function (promise) {
				return promise.then(onSuccess, onError);
			};
		}];

		$httpProvider.interceptors.push(checkAuthorization);
		$httpProvider.defaults.withCredentials = true;
		$httpProvider.interceptors.push("authInterceptor");
	}]);
})();
