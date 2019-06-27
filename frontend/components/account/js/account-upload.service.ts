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
		'$q',
		'ClientConfigService',
		'APIService'
	];

	constructor(
		private $q,
		private ClientConfigService,
		private APIService
	) {}

	public $onInit() {}

	/**
	 * Create a new model
	 *
	 * @param modelData
	 */
	public newModel(modelData: any): Promise<any> {
		const data = {
			desc: '',
			project : modelData.project,
			type: (modelData.type === 'Other') ? modelData.otherType : modelData.type,
			unit: modelData.unit,
			code: modelData.code,
			modelName: modelData.name
		};
		return this.APIService.post(modelData.teamspace + '/model', data);
	}

	/**
	 * Get upload status
	 *
	 * @param modelData
	 */
	public uploadStatus(modelData: any): Promise<any> {
		return this.APIService.get(modelData.teamspace + '/' + modelData.model + '.json');
	}
}

export const AccountUploadServiceModule = angular
	.module('3drepo')
	.service('AccountUploadService', AccountUploadService);
