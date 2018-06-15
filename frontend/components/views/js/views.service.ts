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

interface IViewState {
	views: any[];
}

export class ViewsService {

	public static $inject: string[] = [
		"$timeout",
		"$q",

		"APIService",
		"ClipService",
		"ViewerService"
	];

	private state: IViewState;

	constructor(
		private $timeout: any,
		private $q: any,

		private APIService: any,
		private ClipService: any,
		private ViewerService: any
	) {
		this.reset();
	}

	/**
	 * Reset the data model for views
	 */
	public reset() {
		this.state = {
			views : []
		};
	}

	/**
	 * get a list of views from the view API
	 * @param teamspace teamspace name
	 * @param model the model id
	 * @return promise
	 */
	public getViews(teamspace: string, model: string) {

		const viewsUrl = `${teamspace}/${model}/views/`;
		return this.APIService.get(viewsUrl)
			.then((response) => {
				this.state.views = response.data;
			});

	}

	/**
	 * Update a given view
	 * @param teamspace teamspace name
	 * @param model the model id
	 * @param view the original view that will be updated
	 * @return promise
	 */
	public updateView(teamspace: string, model: string, view: any) {

		const viewId = view._id;
		const viewsUrl = `${teamspace}/${model}/views/${viewId}/`;

		return this.APIService.put(viewsUrl, { name: view.name });
	}

	/**
	 * Create a new view given a view name. Will create screenshot and viewpoint.
	 * @param teamspace teamspace name
	 * @param model the model id
	 * @param viewName the name of the view to create
	 * @return promise
	 */
	public createView(teamspace: string, model: string, viewName: string) {

		return this.generateViewObject(teamspace, model, viewName)
			.then((view: any) => {
				const viewsUrl = `${teamspace}/${model}/views/`;
				return this.APIService.post(viewsUrl, view)
					.then((response: any) => {
						view._id = response.data._id;
						view.screenshot.thumbnail = viewsUrl + view._id + "/thumbnail.png";
						this.state.views.push(view);
					});
			});

	}

	/**
	 * Delete a given view
	 * @param teamspace teamspace name
	 * @param model the model id
	 * @param view the name of the view to create
	 * @return promise
	 */
	public deleteView(teamspace: string, model: string, view: any) 	{

		const viewsUrl = `${teamspace}/${model}/views/${view._id}`;
		return this.APIService.delete(viewsUrl)
			.then(() => {
				this.state.views = this.state.views.filter((v) => {
					return v._id !== view._id;
				});
			});

	}

	/**
	 * Replaces a view in the list of internal saved views
	 * @param newView the view to replace the old view
	 */
	public replaceStateView(newView: any) {
		let index;
		this.state.views.forEach((v, i) => {
			if (v._id === newView._id) {
				index = i;
			}
		});
		this.state.views[index] = newView;
	}

	/**
	 * Create a new view object with screenshot and viewpoint
	 * @param teamspace teamspace name
	 * @param model the model id
	 * @param viewName the name of the new view point
	 * @return promise
	 */
	public generateViewObject(teamspace: string, model: string, viewName: string) {
		const viewpointDefer = this.$q.defer();
		const screenshotDefer = this.$q.defer();

		this.ViewerService.getCurrentViewpoint({
			promise: viewpointDefer,
			account: teamspace,
			model
		});

		this.ViewerService.getScreenshot(screenshotDefer);
		return Promise.all([viewpointDefer.promise, screenshotDefer.promise])
			.then((results: any) => {
				const viewpoint: any = {};
				const base64Screenshot = results[1];
				viewpoint.name = viewName;
				viewpoint.clippingPlanes = results[0].clippingPlanes;
				viewpoint.viewpoint = {};
				viewpoint.viewpoint.position = results[0].position;
				viewpoint.viewpoint.up = results[0].up;
				viewpoint.viewpoint.look_at = results[0].look_at;
				viewpoint.viewpoint.view_dir = results[0].view_dir;
				viewpoint.viewpoint.right = results[0].right;
				viewpoint.screenshot = {
					base64 : base64Screenshot
				};
				return viewpoint;
			});
	}

	/**
	 * Load viewpoint
	 * @param teamspace Teamspace name
	 * @param model Model id
	 * @param view The view
	 */
	public showViewpoint(teamspace: string, model: string, view: any) {
		if (view) {
			if (view.viewpoint) {
				view.viewpoint.account = teamspace;
				view.viewpoint.model = model;

				this.ViewerService.setCamera(view.viewpoint);
			}

			const clipData = {
				clippingPlanes: view.clippingPlanes,
				fromClipPanel: false,
				account: teamspace,
				model
			};

			this.ClipService.updateClippingPlane(clipData);
		}
	}
}

export const ViewsServiceModule = angular
	.module("3drepo")
	.service("ViewsService", ViewsService);
