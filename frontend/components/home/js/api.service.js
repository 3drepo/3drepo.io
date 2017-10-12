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
		.service("APIService", APIService);
		
	APIService.$inject = [
		"$http", "ClientConfigService"
	];
		
	function APIService(
		$http, ClientConfigService
	) {

		var service = {
			getAPIUrl: getAPIUrl,
			delete: del,
			post: post,
			get: get,
			put: put
		};

		return service;

		////////

		function getAPIUrl(url) {
			return ClientConfigService.apiUrl(ClientConfigService.GET_API, url);
		}
	
		/**
		 * Handle GET requests
		 * 
		 * @param url
		 * @returns {*|promise}
		 */
		function get(url) {

			checkUrl(url);
			url = encodeURI(url);
			var urlUse = ClientConfigService.apiUrl(
				ClientConfigService.GET_API, 
				url
			);

			var request = $http.get(urlUse);
			//var response = AuthService.handleSessionExpiration(request);

			return request;

		}

		/**
		 * Handle POST requests
		 * @param url
		 * @param data
		 * @param headers
		 * @returns {*}
		 */
		function post(url, data, headers) {
			
			checkUrl(url);
			url = encodeURI(url);

			var urlUse = ClientConfigService.apiUrl(
				ClientConfigService.POST_API, 
				url
			);
			var config = { 
				withCredentials: true 
			};

			if (headers) {
				config.headers = headers;
			}

			var request = $http.post(urlUse, data, config);

			return request;

		}

		/**
		 * Handle PUT requests
		 * @param url
		 * @param data
		 * @returns {*}
		 */
		function put(url, data) {
			
			checkUrl(url);
			url = encodeURI(url);

			var urlUse = ClientConfigService.apiUrl(
				ClientConfigService.POST_API, 
				url
			);
			var config = {withCredentials: true};

			var request = $http.put(urlUse, data, config);

			return request;

		}

		/**
		 * Handle DELETE requests
		 * @param url
		 * @param data
		 * @returns {*}
		 */
		function del(url, data) {

			checkUrl(url);

			url = encodeURI(url);
			url = ClientConfigService.apiUrl(
				ClientConfigService.POST_API, 
				url
			);

			var config = {
				data: data,
				withCredentials: true,
				headers: {
					"Content-Type": "application/json"
				}
			};
			
			var request = $http.delete(url, config);
			return request;
		}

		function checkUrl(url) {
			if (typeof url !== "string") {
				throw new Error("URL is not a string");
			} else if (url.length === 0) {
				throw new Error("Empty URL provided");
			}
		}

	}
			
})();




		