/**
 *	Copyright (C) 2018 3D Repo Ltd
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

export class ViewsService {

	public static $inject: string[] = [
		"$timeout",
		"APIService"
	];

	private state;

	constructor(
		private $timeout: any,
		private APIService: any
	) {
		this.reset();
	}

	/**
	 * Reset the data model
	 */
	public reset() {
		this.state = {
			views : []
		};
	}

	public getViews(teamspace: string, model: string, revision: string) {

		// This is what we would do when we have the API
		// let viewsUrl;
		// if (revision) {
		// 	viewsUrl = `${teamspace}/${model}/views/revision/${revision}/?noIssues=true`;
		// } else {
		// 	viewsUrl = `${teamspace}/${model}/views/revision/master/head/?noIssues=true`;
		// }

		// return this.APIService.get(viewsUrl)
		// 	.then((response) => {
		// 		this.state.views = response.data;
		// 	});

		// Mocked until this can be a real API call
		return this.$timeout(() => {
			this.state.views = [{
				id : 1,
				name: "View 1",
				author: "Richard",
				createdAt: Date.now(),
				description: "How do I load a big model?",
				selected: false
			},
			{
				id: 2,
				name: "View 2",
				author: "Richard",
				createdAt: Date.now(),
				description: "Will you hire my son?",
				selected: false
			}];
		}, 3000);

	}

	public deleteView(view) 	{
		this.state.views = this.state.views.filter((v) => {
			return v.id !== view.id;
		});
	}

	public editView() {
		//editGroup
	}


}

export const ViewsServiceModule = angular
	.module("3drepo")
	.service("ViewsService", ViewsService);
