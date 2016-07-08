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
		.factory("HttpService", HttpService);

	HttpService.$inject = ["$http", "$q", "StateManager", "serverConfig"];

	function HttpService($http, $q, StateManager, serverConfig) {
		var handlerFactory = function(httpReq)
		{
			return function (type, url, success, failure)
			{
				var deferred = $q.defer();

				// Determine full url
				var getURI = serverConfig.apiUrl(type, url);

				// If not success function is specified then
				// provide a default one
				var successFunc = success || function (response) { deferred.resolve(response.data); };

				// If no failure function is specified then provide a default one
				var failureFunc = failure || function (response) {
					if (response.status === 404 || response.status === 401)
					{
						// If there is a not found error or an unauthorized error
						// then panic and clear the state. Don't worry everything will
						// recover. :)

						StateManager.clearState();
						StateManager.updateState();
					}

					deferred.resolve([]);
				};

				httpReq(getURI).then(successFunc, failureFunc);

				return deferred.promise;
			};
		};

		var get  = handlerFactory($http.get);
		var post = handlerFactory($http.post);

		return {
			get:  get,
			post: post
		};
	}
}());

