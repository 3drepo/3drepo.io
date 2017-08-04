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
		.service("AccountUploadService", AccountUploadService);

	AccountUploadService.$inject = ["$http", "$q", "serverConfig", "UtilsService", "RevisionsService"];

	function AccountUploadService($http, $q, serverConfig, UtilsService, RevisionsService) {
		// https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#services

		var service = {

			uploadStatus : uploadStatus,
			newModel : newModel,
			uploadFileToModel: uploadFileToModel,
			uploadRevisionToModel : uploadRevisionToModel
		};

		return service;


		///////////


		/**
		 * Create a new model
		 *
		 * @param modelData
		 * @returns {*|promise}
		 */
		function newModel(modelData) {
			var data = {
				desc: "",
				project : modelData.project,
				type: (modelData.type === "Other") ? modelData.otherType : modelData.type,
				unit: modelData.unit,
				code: modelData.code
			};
			var modelName = encodeURIComponent(modelData.name);
			return UtilsService.doPost(data, modelData.teamspace + "/" + modelName);
		}

		/**
		 * Get upload status
		 *
		 * @param modelData
		 * @returns {*|promise}
		 */
		function uploadStatus(modelData) {
			return UtilsService.doGet(modelData.teamspace + "/" + modelData.model + ".json");
		}

		function uploadRevisionToModel(uploadFileData) {

			var uploadPromise = $q.defer();

			var validTag = RevisionsService.isTagFormatInValid(uploadFileData.tag);

			if(uploadFileData.tag && validTag){
				uploadPromise.reject("Invalid revision name");
			} else {
				var endpoint = uploadFileData.account + "/" + uploadFileData.model + "/revisions.json";
				UtilsService.doGet(endpoint)
					.then(function(response){
						var revisions = response.data;
						if(uploadFileData.tag){
							revisions.forEach(function(rev){
								if(rev.tag === uploadFileData.tag){
									uploadPromise.reject("Revision name already exists");
								}
							});
						}

						// Run upload file as normal as revision tags are OK
						uploadFileToModel(uploadFileData)
							.then(function(){
								uploadPromise.resolve();
							})
							.catch(function(errorMessage){
								uploadPromise.reject(errorMessage);
							});
						
					})
					.catch(function(error){
						console.error(error);
						uploadPromise.reject("Error uploading!");
					});
			}

			return uploadPromise.promise;
		}

		/**
		 * Upload file/model to model
		 * @param file
		 * @param tag
		 * @param desc
		 */
		function uploadFileToModel(uploadFileData) {

			var formData;
			var uploadPromise = $q.defer();

			// Check the quota
			UtilsService.doGet(uploadFileData.account + ".json")
				.then(function () {

					// Check for file size limit
					if (uploadFileData.file.size > serverConfig.uploadSizeLimit) {

						uploadPromise.reject("File exceeds size limit");

					} else {

						formData = new FormData();
						formData.append("file", uploadFileData.file);

						if(uploadFileData.tag){
							formData.append("tag", uploadFileData.tag);
						}

						if(uploadFileData.desc){
							formData.append("desc", uploadFileData.desc);
						}
						
						var endpoint = uploadFileData.account + "/" + uploadFileData.model.model + "/upload";
						var postData =  {"Content-Type": undefined};

						return UtilsService.doPost(formData, endpoint, postData)
							.then(function (response) {
								if ((response.status === 400) || (response.status === 404)) {
									// Upload error
									uploadPromise.reject(UtilsService.getErrorMessage(response.data));
								} else {
									uploadPromise.resolve();
								}
							});
					}
				});
		
			return uploadPromise.promise;
		}

	}
}());
