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

import { NotificationEvents } from "../../notifications/js/notification.events";
import { NotificationService } from "../../notifications/js/notification.service";

class ViewsController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$timeout",
		"$element",

		"DialogService",
		"AuthService",
		"ClientConfigService",
		"ViewpointsService",
		"NotificationService"
	];

	private onShowItem: any;
	private onHideItem: any;
	private account: string;
	private model: string;
	private onContentHeightRequest: any;
	private viewpoints: any[];
	private toShow: string;
	private loading: boolean;
	private selectedView: any;
	private savingView: any;
	private canAddView: any;
	private modelSettings: any;
	private newView: any;
	private editSelectedView: any;
	private viewpointNameMaxlength: number;
	private viewsNotifications: NotificationEvents;

	constructor(
		private $scope: ng.IScope,
		private $timeout: ng.ITimeoutService,
		private $element: ng.IRootElementService,

		private DialogService,
		private AuthService,
		private ClientConfigService: any,
		private ViewpointsService: any,
		private notificationsService: NotificationService
	) {}

	public $onInit() {
		this.newView = {};
		this.ViewpointsService.getViewpoints(this.account, this.model).then(() => {
			this.loading = false;
		});
		this.toShow = "views";
		this.loading = true;
		this.savingView = false;
		this.canAddView = false;
		this.viewpoints = [];
		this.editSelectedView = false;
		this.viewpointNameMaxlength = 80;
		this.watchers();
		console.log("models " + this.model + "account " + this.account);
		this.viewsNotifications = this.notificationsService.getChannel(this.account, this.model).views;
		this.watchNotification();
	}

	public $onDestroy() {
		this.ViewpointsService.reset();
		this.viewpoints = [];
		this.viewsNotifications.unsubscribeFromCreated(this.createdViewpoint);
		this.viewsNotifications.unsubscribeFromUpdated(this.deleteViewpoint);
		this.viewsNotifications.unsubscribeFromDeleted(this.saveEditedView);
	}

	public watchers() {

		this.$scope.$watch(() => {
			return this.ViewpointsService.state;
		}, (newState, oldState) => {
			angular.extend(this, newState);
		}, true);

		this.$scope.$watchCollection("vm.viewpoints", () => {
			this.setContentHeight();
		});

		this.$scope.$watch("vm.hideItem", (newValue) => {
			if (newValue) {
				this.toShow = "views";
				this.setContentHeight();
			}
		});

		this.$scope.$watch("vm.modelSettings", () => {
			if (this.modelSettings) {
				this.canAddView = this.AuthService.hasPermission(
					this.ClientConfigService.permissions.PERM_CREATE_ISSUE,
					this.modelSettings.permissions
				);
			}

		});

	}

	public selectView(view: any) {

		if (view) {
			if (this.editSelectedView && this.selectedView !== view) {
				this.resetEditState();
			}

			if (this.selectedView) {
				this.selectedView.selected = false;
			}
			this.selectedView = view;
			this.selectedView.selected = true;

			this.ViewpointsService.showViewpoint(this.account, this.model, view);
		}

	}

	/*** Realtime sync  */
	public watchNotification() {
		this.viewsNotifications.subscribeToUpdated(this.updatedViewpoint, this);
		this.viewsNotifications.subscribeToCreated(this.createdViewpoint, this);
	}

	public updatedViewpoint(data) {
		this.ViewpointsService.replaceStateViewpoint(data);
	}

	public createdViewpoint(data) {
		console.log("viewpoint being created", data);
		this.ViewpointsService.updatedCreatedViewpoint(data);
	}

	public createViewpoint() {
		this.ViewpointsService.createViewpoint(this.account, this.model, this.newView.name)
			.catch((error) => {
				this.handleViewError("create", error);
			});
		this.toShow = "views";
		this.onHideItem();
	}

	public deleteViewpoint() {
		this.ViewpointsService.deleteViewpoint(this.account, this.model, this.selectedView)
			.then(() => {
				this.resetEditState();
				this.selectedView = null;
			})
			.catch((error) => {
				this.handleViewError("delete", error);
			});
	}

	public editView(view: any) {
		if (this.editSelectedView === view) {
			this.editSelectedView = null;
		} else {
			this.editSelectedView = Object.assign({}, view);
		}
		this.$timeout();
	}

	public saveEditedView() {
		if (this.editSelectedView.name) {
			this.ViewpointsService.updateViewpoint(this.account, this.model, this.editSelectedView)
				.then(() => {
					this.selectedView.name = this.editSelectedView.name;
					this.resetEditState();
				})
				.catch((error) => {
					this.handleViewError("update", error);
					this.resetEditState();
				});
		}
	}

	public resetEditState() {
		this.editSelectedView = null;
		this.$timeout();
	}

	public addView() {
		this.newView = { name: "View " + (this.viewpoints.length + 1) };
		this.showNewViewPane();
	}

	public addViewDisabled() {
		return !this.canAddView || this.editSelectedView;
	}

	public showNewViewPane() {
		this.toShow = "view";
		this.onShowItem();
		this.focusViewpointName();
	}

	public focusViewpointName() {
		this.$timeout(() => {
			const input: HTMLElement = this.$element[0].querySelector("#viewpointName");
			input.focus();
		});
	}

	public handleViewError(method: string, error: Error) {
		console.error(error);
		const content = `We tried to ${method} your view but it failed.
			If this continues please message support@3drepo.org.`;
		const escapable = true;
		this.DialogService.text(`View Error`, content, escapable);
	}

	public setContentHeight() {

		if (this.toShow === "view") {
			return 250;
		}

		let contentHeight = 0;
		const minContentHeight = 169;
		const viewHeight = 95;
		const actionBar = 52;

		if (this.viewpoints && this.viewpoints.length) {
			contentHeight = (this.viewpoints.length * viewHeight) + actionBar;
		}

		this.onContentHeightRequest({height: Math.max(contentHeight, minContentHeight) });

	}

}

export const ViewpointsComponent: ng.IComponentOptions = {
	bindings: {
		account: "<",
		model: "<",
		revision: "<",
		modelSettings: "<",
		onContentHeightRequest: "&",
		onShowItem: "&",
		onHideItem: "&",
		hideItem: "<"
	},
	controller: ViewsController,
	controllerAs: "vm",
	templateUrl: "templates/viewpoints.html"
};

export const ViewpointsComponentModule = angular
	.module("3drepo")
	.component("viewpoints", ViewpointsComponent);
