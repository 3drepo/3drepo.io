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

(function () {
	"use strict";


	angular.module("3drepo")
		.service("serverConfig", serverConfig);


	function serverConfig() {

		server_config = server_config || {};

		server_config.api_algorithm = createRoundRobinAlgorithm();
		server_config.apiUrls = server_config.api_algorithm.apiUrls;
		server_config.apiUrl = server_config.api_algorithm.apiUrl.bind(server_config.api_algorithm);

		var C = server_config.C;

		server_config.GET_API = C.GET_API;
		server_config.POST_API = (server_config.apiUrls[C.POST_API]) ? C.POST_API : server_config.GET_API;
		server_config.MAP_API = (server_config.apiUrls[C.MAP_API]) ? C.MAP_API : server_config.GET_API;


		return server_config;

		/*******************************************************************************
		 * Round robin API configuration
		 * @param {Object} variable - variable to coalesce
		 * @param {Object} value - value to return if object is null or undefined
		 *******************************************************************************/
		function createRoundRobinAlgorithm() {

			var roundRobin = {
				apiUrls : server_config.apiUrls,
				apiUrlCounter: {}
			};

			for (var k in server_config.apiUrls) {
				if(server_config.apiUrls.hasOwnProperty(k)){
					roundRobin.apiUrlCounter[k] = 0;
				}
			}
			
			// self variable will be filled in by frontend
			roundRobin.apiUrl = function(type, path) {
				var typeFunctions = this.apiUrls[type];
				var functionIndex = this.apiUrlCounter[type] % Object.keys(typeFunctions).length;

				this.apiUrlCounter[type] += 1;

				return this.apiUrls[type][functionIndex](path);
			};

			return roundRobin;

		}

	}

})();