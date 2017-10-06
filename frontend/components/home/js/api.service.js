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
		.service("AuthService", [
			"$injector", "$q", "$http", "$interval", "ClientConfigService",
			function(
				$injector, $q, $http, $interval, ClientConfigService
			) {

				var service = {
					delete: del,
					post: post,
					get: get,
					put: put
				};

				return service;

				////////

				/**
				 * Handle GET requests
				 * 
				 * @param url
				 * @returns {*|promise}
				 */
				function get(url) {
					var deferred = $q.defer(),
						urlUse = ClientConfigService.apiUrl(ClientConfigService.GET_API, url);

					$http.get(urlUse).then(
						function (response) {
							deferred.resolve(response);
						},
						function (response) {
							deferred.resolve(response);
						});
					return deferred.promise;
				}

				/**
				 * Handle POST requests
				 * @param data
				 * @param url
				 * @param headers
				 * @returns {*}
				 */
				function post(data, url, headers) {
					var deferred = $q.defer(),
						urlUse = ClientConfigService.apiUrl(ClientConfigService.POST_API, url),
						config = {withCredentials: true};

					if (angular.isDefined(headers)) {
						config.headers = headers;
					}

					$http.post(urlUse, data, config)
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
				 * @param url
				 * @returns {*}
				 */
				function put(data, url) {
					var deferred = $q.defer(),
						urlUse = ClientConfigService.apiUrl(ClientConfigService.POST_API, url),
						config = {withCredentials: true};

					$http.put(urlUse, data, config)
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
				 * Handle DELETE requests
				 * @param data
				 * @param url
				 * @returns {*}
				 */
				function del(data, url) {
					var deferred = $q.defer(),
						config = {
							method: "DELETE",
							url: ClientConfigService.apiUrl(ClientConfigService.POST_API, url),
							data: data,
							withCredentials: true,
							headers: {
								"Content-Type": "application/json"
							}
						};

					$http(config)
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


			}]);
			

})();




		