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
		"$q",

		"APIService",
		"ViewerService"
	];

	private state;

	constructor(
		private $timeout: any,
		private $q: any,

		private APIService: any,
		private ViewerService: any
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

	public getViews(teamspace: string, model: string) {

		const viewsUrl = `${teamspace}/${model}/views/`;

		return this.APIService.get(viewsUrl)
			.then((response) => {
				console.debug(response);
				this.state.views = response.data;
			});

	}

	public createView(teamspace: string, model: string, viewName: string) {

		const viewpointDefer = this.$q.defer();
		const screenshotDefer = this.$q.defer();

		this.ViewerService.getCurrentViewpoint({
			promise: viewpointDefer,
			account: teamspace,
			model
		});

		this.ViewerService.getScreenshot(screenshotDefer);

		return Promise.all([viewpointDefer.promise, screenshotDefer.promise]).then((results) => {
			console.log(results);
			const viewpoint = results[0];
			const screenshot = results[1];
			viewpoint.name = viewName;
			viewpoint.screenshot = screenshot;
			const viewsUrl = `${teamspace}/${model}/views/`;

			return this.APIService.post(viewsUrl, viewpoint)
				.then((response) => {
					console.log(response);
					this.state.views.push(viewpoint);
				});
		});

	}

	public deleteView(view) 	{
		this.state.views = this.state.views.filter((v) => {
			return v._id !== view._id;
		});
	}

	public editView() {
		// editGroup
	}

}

export const ViewsServiceModule = angular
	.module("3drepo")
	.service("ViewsService", ViewsService);
