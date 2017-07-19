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
		.factory("ModelService", ModelService);

	ModelService.$inject = ["$http", "$q", "StateManager", "serverConfig"];

	function ModelService($http, $q, StateManager, serverConfig) {
		var state = StateManager.state;

		var getModelInfo = function (account, model) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.GET_API, account + "/" + model + ".json");

			$http.get(url)
				.then(function(res){
					var data = res.data;
					data.account = account;
					data.model = model;
					data.settings = data.properties;
					
					deferred.resolve(data, function(){
						deferred.resolve();
					});
				})
				.catch(function(error){
					deferred.reject(error);
				});


			return deferred.promise;
		};

		function doGet(urlEnd) {
			var deferred = $q.defer(),
				url = serverConfig.apiUrl(serverConfig.GET_API, state.account + "/" + state.model + "/" + urlEnd);
			$http.get(url)
				.then(
					function (response) {
						deferred.resolve(response);
					},
					function () {
						deferred.resolve([]);
					}
				);
			return deferred.promise;
		}

		var getModelSummary = function () {
			return doGet("info.json");
		};

		return {
			getModelSummary: getModelSummary,
			getModelInfo: getModelInfo
		};
	}
}());
