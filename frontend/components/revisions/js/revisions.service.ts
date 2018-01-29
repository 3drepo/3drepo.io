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
		"$filter",
		"APIService",
		"ClientConfigService",
	];

	public status: any;
	public revisionDateFilter: any;

	constructor(
		private $filter,
		private APIService,
		private ClientConfigService,
	) {
		this.revisionDateFilter = this.$filter("revisionDate");
		this.status = {
			data: {},
			ready: false,
		};
	}

	public listAll(account, model) {

		return this.APIService.get(account + "/" + model + "/revisions.json")
			.then((response) => {

				if (response.status === 200) {
					this.status.ready = true;
					this.status.data[account + ":" + model] = response.data;
					return response.data;
				} else {
					this.status.ready = false;
					this.status.data[account + ":" + model] = null;
					return response.data;
				}

			});

	}

	public isTagFormatInValid(tag) {
		return tag && !tag.match(this.ClientConfigService.tagRegExp);
	}

}

export const RevisionsServiceModule = angular
	.module("3drepo")
	.service("RevisionsService", RevisionsService);
