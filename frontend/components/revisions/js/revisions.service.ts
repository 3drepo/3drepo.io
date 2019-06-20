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

export class RevisionsService {

	public static $inject: string[] = [
		'$filter',
		'ClientConfigService'
	];

	public status: any;
	public revisionDateFilter: any;

	constructor(
		private $filter,
		private ClientConfigService
	) {
		this.revisionDateFilter = this.$filter('prettyDate');
		this.status = {
			data: {},
			ready: false
		};
	}

	public isTagFormatInValid(tag) {
		return tag && !tag.match(this.ClientConfigService.tagRegExp);
	}

}

export const RevisionsServiceModule = angular
	.module('3drepo')
	.service('RevisionsService', RevisionsService);
