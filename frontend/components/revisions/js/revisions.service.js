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
		.service("RevisionsService", RevisionsService);

	RevisionsService.$inject = ["APIService", "ClientConfigService"];

	function RevisionsService(APIService, ClientConfigService) {
		var status = {
			ready: false,
			data: null
		};

		var service = {
			status: status,
			listAll: listAll,
			isTagFormatInValid: isTagFormatInValid
		};

		return service;

		///////////

		function listAll(account, model) {

			return APIService.get(account + "/" + model + "/revisions.json")
				.then(function(response){

					if(response.status === 200){
						status.ready = true;
						status.data = response.data;
						return response.data;
					} else {
						status.ready = false;
						status.data = response.data;
						return response.data;
					}
				});

		}

		function isTagFormatInValid(tag){
			return tag && !tag.match(ClientConfigService.tagRegExp);
		}

	}
}());
