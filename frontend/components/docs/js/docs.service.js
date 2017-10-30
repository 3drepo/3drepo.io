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
		.service("DocsService", DocsService);

	DocsService.$inject = ["$q", "ClientConfigService", "APIService", "TreeService"];

	function DocsService($q, ClientConfigService, APIService, TreeService) {

		var docTypeHeight = 50;
		var state = {
			disabled: false,
			active: false,
			show: false,
			updated: false,
			docs: false,
			allDocTypesHeight: 0
		};

		return {
			getDocs: getDocs,
			state : state,
			handleObjectSelected: handleObjectSelected
		};

		///////////////////

		function getDocs(account, model, metadataId) {
			var url = account + "/" + model + "/meta/" + metadataId + ".json";
			return APIService.get(url)
				.then(function(json){
					return handleDocs(account, model, metadataId, json);
				});
		}

		function handleObjectSelected(event) {
			
			// Get any documents associated with an object
			var object = event.value;

			var metadataIds = TreeService.treeMap.oIdToMetaId[object.id];
			if(metadataIds && metadataIds.length){
				getDocs(object.account, object.model, metadataIds[0])
					.then(function(data){

						if(!data){
							return;
						}
						
						state.docs = data;
						state.allDocTypesHeight = 0;

						// Open all doc types initially
						for (var docType in state.docs) {
							if (state.docs.hasOwnProperty(docType)) {
								state.docs[docType].show = true;
								state.allDocTypesHeight += docTypeHeight;
							}
						}

						state.show = true;
						state.updated = true;

					})
					.catch(function(error){
						console.error("Error getting metadata: ", error);
					});

			} else {
				state.show = false;
			}
		}

		function handleDocs(account, model, metadataId, json) {
			
			var docsData = {};

			var dataType;
			// Set up the url for each PDF doc
			for (var i = 0; i < json.data.meta.length; i += 1) {

				var meta = json.data.meta[i];

				// Get data type
				dataType = meta.hasOwnProperty("mime") ? 
					meta.mime : 
					"Meta Data";

				if (dataType === "application/pdf") {
					dataType = "PDF";
				}

				// Add data to type group
				if (!docsData.hasOwnProperty(dataType)) {
					docsData[dataType] = {data: []};
				}
				docsData[dataType].data.push(meta);

				// Setup PDF url
				var endpoint = account + "/" + model + "/" + meta._id + ".pdf";
				meta.url = ClientConfigService.apiUrl(
					ClientConfigService.GET_API,
					endpoint
				);
			}

			return docsData;

		}

	}
}());
