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
		"$scope"
	];

	private onShowItem: any;

	private onContentHeightRequest: any;
	private views: any[];
	private toShow: string;
	private loading: boolean;
	private selectedView: any;
	private savingView: any;
	private canAddView: any;

	constructor(
		private $scope: ng.IScope
	) {}

	public $onInit() {
		this.views = [{
			name: "View 1",
			author: "Richard",
			createdAt: Date.now(),
			description: "How do I load a big model?",
			selected: true
		},
		{
			name: "View 2",
			author: "Richard",
			createdAt: Date.now(),
			description: "Will you hire my son?",
			selected: false
		}];
		this.toShow = "views";
		this.loading = false;
		this.savingView = false;
		this.canAddView = true;
		this.selectedView = this.views[0];
		this.watchers();
	}

	public $onDestroy() {

	}

	public watchers() {
		this.$scope.$watch("vm.hideItem", (newValue) => {
			if (newValue) {
				console.log("show views");
				this.toShow = "views";
				// this.setContentHeight();
				// this.resetToSavedGroup();
				// if (this.lastColorOverride) {
				// 	this.GroupsService.colorOverride(this.lastColorOverride);
				// 	this.lastColorOverride = null;
				// }
			}
		});
	}

	public selectView(view) {
		this.selectedView.selected = false;
		this.selectedView = view;
		this.selectedView.selected = true;
	}

	public saveDisabled() {
		return false;
	}

	public addView() {
		this.showGroupPane();
	}

	public showGroupPane() {
		this.toShow = "view";
		this.onContentHeightRequest({height: 310});
		console.log("calling on showItems")
		this.onShowItem();
	}

	// public setContentHeight() {

	// 	if (this.toShow === "group") {
	// 		return 310;
	// 	}

	// 	let contentHeight = 0;
	// 	const groupHeight = 110;
	// 	const actionBar = 52;

	// 	if (this.views && this.views.length) {
	// 		contentHeight = (this.views.length * groupHeight) + actionBar;
	// 	} else {
	// 		contentHeight = 130;
	// 	}

	// 	this.onContentHeightRequest({height: contentHeight });

	// }

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
