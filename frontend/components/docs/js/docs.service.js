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
		.factory("DocsService", DocsService);

	DocsService.$inject = ["$http", "$q", "ClientConfigService"];

	function DocsService($http, $q, ClientConfigService) {
		var getDocs = function (account, model, metadataId) {
			var i,
				length,
				data = {},
				deferred = $q.defer(),
				url = ClientConfigService.apiUrl(ClientConfigService.GET_API, account + "/" + model + "/meta/" + metadataId + ".json");

			$http.get(url)
				.then(
					function(json) {
						var dataType;
						// Set up the url for each PDF doc
						for (i = 0, length = json.data.meta.length; i < length; i += 1) {
							// Get data type
							dataType = json.data.meta[i].hasOwnProperty("mime") ? json.data.meta[i].mime : "Meta Data";
							if (dataType === "application/pdf") {
								dataType = "PDF";
							}

							// Add data to type group
							if (!data.hasOwnProperty(dataType)) {
								data[dataType] = {data: []};
							}
							data[dataType].data.push(json.data.meta[i]);

							// Setup PDF url
							json.data.meta[i].url = ClientConfigService.apiUrl(ClientConfigService.GET_API, account + "/" + model + "/" + json.data.meta[i]._id + ".pdf");
						}
						deferred.resolve(data);
					},
					function () {
						deferred.resolve();
					}
				);

			return deferred.promise;
		};

		return {
			getDocs: getDocs
		};
	}
}());
