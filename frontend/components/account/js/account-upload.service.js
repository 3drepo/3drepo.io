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

	AccountUploadService.$inject = ["$q", "ClientConfigService", "UtilsService", "RevisionsService", "APIService"];

	function AccountUploadService($q, ClientConfigService, UtilsService, RevisionsService, APIService) {
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
			return APIService.post(modelData.teamspace + "/" + modelName, data);
		}

		/**
		 * Get upload status
		 *
		 * @param modelData
		 * @returns {*|promise}
		 */
		function uploadStatus(modelData) {
			return APIService.get(modelData.teamspace + "/" + modelData.model + ".json");
		}

		function uploadRevisionToModel(uploadFileData) {
			return uploadFileToModel(uploadFileData);
		}

		/**
		 * Upload file/model to model
		 * @param file
		 * @param tag
		 * @param desc
		 */
		function uploadFileToModel(uploadFileData) {

			var uploadPromise = $q.defer();
			var validTag = RevisionsService.isTagFormatInValid(uploadFileData.tag);

			if(uploadFileData.tag && validTag){

				// Check it's a valid tag
				uploadPromise.reject("Invalid revision name; check length is between 1 and 20 and uses alphanumeric characters");

			} else if (uploadFileData.file.size > ClientConfigService.uploadSizeLimit) {

				// Check for file size limit
				var maxSize = parseInt(ClientConfigService.uploadSizeLimit / 1048576).toFixed(0);
				uploadPromise.reject("File exceeds size limit of " + maxSize + "mb");

			} else {

				var formData = new FormData();
				formData.append("file", uploadFileData.file);

				if(uploadFileData.tag){
					formData.append("tag", uploadFileData.tag);
				}

				if(uploadFileData.desc){
					formData.append("desc", uploadFileData.desc);
				}
				
				var endpoint = uploadFileData.account + "/" + uploadFileData.model.model + "/upload";
				var headers =  {"Content-Type": undefined};

				APIService.post(endpoint, formData, headers)
					.then(function (response) {
						if ((response.status === 400) || (response.status === 404)) {
							// Upload error
							uploadPromise.reject(UtilsService.getErrorMessage(response.data));
						} else {
							uploadPromise.resolve();
						}
					})
					.catch(function(error){
						uploadPromise.reject(error);
					});

			}

			return uploadPromise.promise;

		}

	}
}());
