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

class ViewsController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$timeout",

		"ViewsService",
		"APIService"
	];

	private onShowItem: any;
	private account: string;
	private model: string;
	private onContentHeightRequest: any;
	private views: any[];
	private toShow: string;
	private loading: boolean;
	private selectedView: any;
	private savingView: any;
	private canAddView: any;
	private newView: any;
	private editSelectedView: boolean;

	constructor(
		private $scope: ng.IScope,
		private $timeout: ng.ITimeoutService,

		private ViewsService: any,
		private APIService: any
	) {}

	public $onInit() {
		this.newView = {};
		this.ViewsService.getViews(this.account, this.model).then(() => {
			this.loading = false;
		});
		this.toShow = "views";
		this.loading = true;
		this.savingView = false;
		this.canAddView = true;
		this.views = [];
		this.editSelectedView = false;
		this.watchers();
	}

	public $onDestroy() {
		this.ViewsService.reset();
	}

	public watchers() {

		this.$scope.$watch(() => {
			return this.ViewsService.state;
		}, (newState, oldState) => {
			angular.extend(this, newState);
		}, true);

		this.$scope.$watch("vm.views", () => {
			this.setContentHeight();
		});

		this.$scope.$watch("vm.hideItem", (newValue) => {
			if (newValue) {
				this.toShow = "views";
				this.setContentHeight();
			}
		});

	}

	public getThumbnailUrl(thumbnail: string) {
		if (thumbnail) {
			return this.APIService.getAPIUrl(thumbnail);
		}
		return "";
	}

	public createView() {
		this.ViewsService.createView(this.account, this.model, this.newView.name)
			.catch((error) => {
				console.error(error);
			});
		this.toShow = "views";
	}

	public selectView(view) {

		if (this.selectedView === undefined) {
			this.selectedView = view;
		} else {
			this.selectedView.selected = false;
		}
		//this.canAddView = true;
		this.selectedView = view;
		this.selectedView.selected = true;
	}

	public deleteView() {
		this.ViewsService.deleteView(this.account, this.model, this.selectedView);
	}

	public editView(view: any) {
		if (this.editSelectedView === view) {
			this.editSelectedView = null;
		} else {
			this.canAddView = false;
			this.editSelectedView = view;
		}
		this.$timeout();
	}

	public saveEditedView() {
		this.ViewsService.updateView(this.account, this.model, this.selectedView)
			.then(() => {
				this.canAddView = true;
				this.editSelectedView = null;
				this.$timeout();
			})
			.catch((error) => {
				console.error(error);
				this.canAddView = true;
				this.editSelectedView = null;
				this.$timeout();
			});
	}

	public addView() {
		this.newView = { name: "" };
		this.showGroupPane();
	}

	public showGroupPane() {
		this.toShow = "view";
		this.onContentHeightRequest({height: 310});
		this.onShowItem();
	}

	public setContentHeight() {

		if (this.toShow === "view") {
			return 250;
		}

		let contentHeight = 0;
		const viewHeight = 335;
		const actionBar = 52;

		if (this.views && this.views.length) {
			contentHeight = (this.views.length * viewHeight) + actionBar;
		} else {
			contentHeight = 130;
		}

		this.onContentHeightRequest({height: contentHeight });

	}

}

export const ViewsComponent: ng.IComponentOptions = {
	bindings: {
		account: "<",
		model: "<",
		revision: "<",
		modelSettings: "<",
		onContentHeightRequest: "&",
		onShowItem: "&",
		hideItem: "<"
	},
	controller: ViewsController,
	controllerAs: "vm",
	templateUrl: "templates/views.html"
};

export const ViewsComponentModule = angular
	.module("3drepo")
	.component("views", ViewsComponent);
