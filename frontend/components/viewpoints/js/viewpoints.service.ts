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
	viewpoints: any[];
}

export class ViewpointsService {

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
	 * Reset the data model for viewpoints
	 */
	public reset() {
		this.state = {
			viewpoints : []
		};
	}

	/**
	 * Get full URL for given thumbnail
	 * @param thumbnail URI for thumbnail
	 */
	public getThumbnailUrl(thumbnail: string) {
		return (thumbnail) ? this.APIService.getAPIUrl(thumbnail) : "";
	}

	/**
	 * get a list of viewpoints from the view API
	 * @param teamspace teamspace name
	 * @param model the model id
	 * @return promise
	 */
	public getViewpoints(teamspace: string, model: string) {

		const viewpointsUrl = `${teamspace}/${model}/viewpoints/`;
		return this.APIService.get(viewpointsUrl)
			.then((response) => {
				response.data.forEach((viewpoint) => {
					if (!viewpoint.screenshot) {
						viewpoint.screenshot = {};
					}
					viewpoint.screenshot.thumbnailUrl = this.getThumbnailUrl(viewpoint.screenshot.thumbnail);
				});
				this.state.viewpoints = response.data;
			});

	}

	/**
	 * Update a given view
	 * @param teamspace teamspace name
	 * @param model the model id
	 * @param view the original view that will be updated
	 * @return promise
	 */
	public updateViewpoint(teamspace: string, model: string, view: any) {
		const viewId = view._id;
		const viewpointsUrl = `${teamspace}/${model}/viewpoints/${viewId}/`;
		return this.APIService.put(viewpointsUrl, { name: view.name });
	}

	public updatedCreatedViewpoint(view) {
		view.screenshot.thumbnailUrl = this.getThumbnailUrl(view.screenshot.thumbnail);
		this.state.viewpoints.push(view);
	}

	public updateDeletedViewpoint(viewId) {
		for (let i = 0; i < this.state.viewpoints.length; ++i) {
			if (viewId === this.state.viewpoints[i]._id) {
				this.state.viewpoints.splice(i, 1);
				break;
			}
		}
	}

	/**
	 * Create a new view given a view name. Will create screenshot and viewpoint.
	 * @param teamspace teamspace name
	 * @param model the model id
	 * @param viewName the name of the view to create
	 * @return promise
	 */
	public createViewpoint(teamspace: string, model: string, viewName: string) {
		return this.generateViewpointObject(teamspace, model, viewName)
			.then((view: any) => {
				const viewpointsUrl = `${teamspace}/${model}/viewpoints/`;
				return this.APIService.post(viewpointsUrl, view)
					.then((response: any) => {
						view._id = response.data._id;
						view.screenshot.thumbnailUrl = this.getThumbnailUrl(viewpointsUrl + view._id + "/thumbnail.png");
						this.state.viewpoints.push(view);
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
	public deleteViewpoint(teamspace: string, model: string, view: any) {
		if (view && view._id) {
			const viewpointsUrl = `${teamspace}/${model}/viewpoints/${view._id}`;
			return this.APIService.delete(viewpointsUrl)
				.then(() => {
					this.state.viewpoints = this.state.viewpoints.filter((v) => {
						return v._id !== view._id;
					});
				});
		} else {
			return Promise.resolve();
		}
	}

	/**
	 * Replaces a view in the list of internal saved viewpoints
	 * @param newView the view to replace the old view
	 */
	public replaceStateViewpoint(newView: any) {
		let index;
		this.state.viewpoints.forEach((v, i) => {
			if (v._id === newView._id) {
				index = i;
			}
		});
		this.state.viewpoints[index] = newView;
	}

	/**
	 * Create a new view object with screenshot and viewpoint
	 * @param teamspace teamspace name
	 * @param model the model id
	 * @param viewName the name of the new view point
	 * @return promise
	 */
	public generateViewpointObject(teamspace: string, model: string, viewName: string) {
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

			if (view.clippingPlanes) {
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
}

export const ViewpointsServiceModule = angular
	.module("3drepo")
	.service("ViewpointsService", ViewpointsService);
