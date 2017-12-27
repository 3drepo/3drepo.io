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

 /**
 *	Copyright (C) 2017 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export class AccountUploadService {

	public static $inject: string[] = [
		"$q",
		"ClientConfigService",
		"APIService",
		"RevisionsService",
	];

	constructor(
		private $q,
		private ClientConfigService,
		private APIService,
		private RevisionsService,
	) {}

	public $onInit() {}

	/**
	 * Create a new model
	 *
	 * @param modelData
	 */
	public newModel(modelData: any): Promise<any> {
		const data = {
			desc: "",
			project : modelData.project,
			type: (modelData.type === "Other") ? modelData.otherType : modelData.type,
			unit: modelData.unit,
			code: modelData.code,
			modelName: modelData.name,
		};
		return this.APIService.post(modelData.teamspace + "/model", data);
	}

	/**
	 * Get upload status
	 *
	 * @param modelData
	 */
	public uploadStatus(modelData: any): Promise<any> {
		return this.APIService.get(modelData.teamspace + "/" + modelData.model + ".json");
	}

	public uploadRevisionToModel(uploadFileData) {
		return this.uploadFileToModel(uploadFileData);
	}

	/**
	 * Upload file/model to model
	 */
	public uploadFileToModel(uploadFileData: any) {

		const uploadPromise = this.$q.defer();
		const validTag = this.RevisionsService.isTagFormatInValid(uploadFileData.tag);

		if (uploadFileData.tag && validTag) {

			// Check it's a valid tag
			uploadPromise.reject("Invalid revision name; check length is between 1 and 20 and uses alphanumeric characters");

		} else if (uploadFileData.file.size > this.ClientConfigService.uploadSizeLimit) {

			// Check for file size limit
			const size: any = this.ClientConfigService.uploadSizeLimit / 1048576;
			const maxSize = parseInt(size, 10).toFixed(0);
			uploadPromise.reject("File exceeds size limit of " + maxSize + "mb");

		} else {

			const formData = new FormData();
			formData.append("file", uploadFileData.file);

			if (uploadFileData.tag) {
				formData.append("tag", uploadFileData.tag);
			}

			if (uploadFileData.desc) {
				formData.append("desc", uploadFileData.desc);
			}

			const endpoint = uploadFileData.account + "/" + uploadFileData.model.model + "/upload";
			const headers =  {"Content-Type": undefined};

			this.APIService.post(endpoint, formData, headers)
				.then((response) => {
					if ((response.status === 400) || (response.status === 404)) {
						// Upload error
						uploadPromise.reject(this.APIService.getErrorMessage(response.data));
					} else {
						uploadPromise.resolve();
					}
				})
				.catch((error) => {
					uploadPromise.reject(this.APIService.getErrorMessage(error.data));
				});

		}

		return uploadPromise.promise;

	}

}

export const AccountUploadServiceModule = angular
	.module("3drepo")
	.service("AccountUploadService", AccountUploadService);
