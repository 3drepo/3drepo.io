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
import { AuthService } from "../../home/js/auth.service";
import { DialogService } from "../../home/js/dialog.service";
import { GroupsService } from "./groups.service";
import { NotificationEvents } from "../../notifications/js/notification.events";
import { NotificationService } from "../../notifications/js/notification.service";
import { TreeService } from "../../tree/js/tree.service";

class GroupsController implements ng.IController {
	public static $inject: string[] = [
		"$scope",
		"$timeout",
		"$element",
		"GroupsService",
		"DialogService",
		"TreeService",
		"AuthService",
		"ClientConfigService",
		"IconsConstant",
		"NotificationService"
	];

	private onContentHeightRequest: any;
	private groups: any;
	private selectedGroup: any;
	private teamspace: string;
	private model: string;
	private revision: string;
	private loading: boolean;
	private account: string;
	private onShowItem;
	private onHideItem;
	private toShow: string;
	private savingGroup: boolean;
	private changed: boolean;
	private groupColours: any[];
	private hexColor: string;
	private selectedObjectsLen: number;
	private dialogThreshold: number;
	private canAddGroup: boolean;
	private justUpdated: boolean;
	private modelSettings: any;
	private savedGroupData: any;
	private customIcons: any;
	private lastColorOverride: any;
	private selectedNodes: any[];
	private groupsNotifications: NotificationEvents;

	constructor(
		private $scope: ng.IScope,
		private $timeout: ng.ITimeoutService,
		private $element: ng.IRootElementService,
		private groupsService: GroupsService,
		private dialogService: DialogService,
		private treeService: TreeService,
		private authService: AuthService,
		private clientConfigService: any,
		private iconsConstant: any,
		private notificationService: NotificationService
	) {}

	public $onInit() {
		this.customIcons = this.iconsConstant;

		this.selectedNodes = [];
		this.canAddGroup = false;
		this.dialogThreshold = 0.5;
		this.teamspace = this.account; // Workaround legacy naming
		this.onContentHeightRequest({height: 1000});
		this.groupsService.reset();
		this.watchers();
		this.toShow = "groups";
		this.loading = true;
		this.groupsService.getGroups(this.account, this.model, this.revision)
			.then(() => {
				this.loading = false;
			});

		this.groupColours = [
			[[255, 195, 18], [196, 229, 56], [52, 152, 219], [253, 167, 223], [237, 76, 103]],
			[[247, 159, 31], [163, 203, 56], [18, 137, 167], [217, 128, 250], [181, 52, 113]],
			[[238, 90, 36], [0, 148, 50], [6, 82, 221], [153, 128, 250], [131, 52, 113]],
			[[234, 32, 39], [0, 98, 102], [87, 88, 187], [27, 20, 100], [111, 30, 81]]
		];

		this.groupsNotifications =  this.notificationService.getChannel(this.account, this.model).groups;
	}

	public $onDestroy() {
		this.groups = [];
		this.groupsNotifications.unsubscribeFromCreated(this.onGroupsCreated);
		this.groupsNotifications.unsubscribeFromUpdated(this.onGroupsUpdated);
		this.groupsNotifications.unsubscribeFromDeleted(this.onGroupsDeleted);
	}

	public watchers() {
		this.$scope.$watch("vm.filterText", (searchQuery: string) => {
			if (searchQuery !== undefined || searchQuery !== "") {
				this.groups = this.groupsService.groupsFilterSearch(searchQuery);
			}
		});

		this.$scope.$watch(() => {
			return this.groupsService.state;
		}, (newState, oldState) => {
			angular.extend(this, newState);
			this.updateChangeStatus();
		}, true);

		this.$scope.$watchCollection("vm.groups", () => {
			this.setContentHeight();
		});

		this.$scope.$watchCollection("vm.savedGroupData", () => {
			this.updateChangeStatus();
		});

		this.$scope.$watch("vm.hideItem", (newValue) => {
			if (newValue) {
				this.toShow = "groups";
				this.setContentHeight();
				this.resetToSavedGroup();
				if (this.lastColorOverride) {
					this.groupsService.colorOverride(this.lastColorOverride);
					this.lastColorOverride = null;
				}
			}
		});

		this.$scope.$watch("vm.hexColor", () => {
			if (this.hexColor) {
				const validHex = this.groupsService.hexToRGBA(this.hexColor);
				if (validHex.length === 3) {
					this.setSelectedGroupColor(validHex, true);
				}
			}
		});

		this.$scope.$watch("vm.modelSettings", () => {
			if (this.modelSettings) {
				this.canAddGroup = this.authService.hasPermission(
					this.clientConfigService.permissions.PERM_CREATE_ISSUE,
					this.modelSettings.permissions
				);

				this.watchNotification();
			}

		});

		this.$scope.$watchCollection(() => {
			return this.treeService.currentSelectedNodes;
		}, () => {
			this.groupsService.updateSelectedObjectsLen().then( () => {
				this.groupsService.getSelectedObjects().then((currentHighlights) => {
					this.selectedNodes = currentHighlights || [];
					this.updateChangeStatus();
				});
			});
		});

		this.$scope.$watch("vm.selectedMenuOption",
			(selectedOption: any) => {
				if (selectedOption && selectedOption.hasOwnProperty("value")) {
					switch (selectedOption.value) {
						case "overrideAll":
							this.groupsService.colorOverrideAllGroups(selectedOption.selected);
							break;
						case "deleteAll":
							this.deleteAllGroups();
							break;
						default:
							console.error("Groups option menu selection unhandled");
					}
				}
			});
	}

	public resetToSavedGroup() {
		if (this.selectedGroup && !this.selectedGroup.new && this.savedGroupData) {
			this.selectedGroup.name = this.savedGroupData.name;
			this.selectedGroup.description = this.savedGroupData.description;
			this.selectedGroup.color = this.savedGroupData.color;
			this.groupsService.selectGroup(this.selectedGroup);
		}
	}

	public toggleColorOverride($event, group: any) {
		$event.stopPropagation();
		this.groupsService.toggleColorOverride(group);
	}

	public handleGroupError(method: string) {
		const content = `Group ${method} failed.
			Contact support@3drepo.org if problem persists.`;
		const escapable = true;
		this.dialogService.text(`Group Error`, content, escapable);
	}

	public openColorMenu($mdMenu: any, event: any) {
		$mdMenu.open(event);
	}

	public saveDisabled() {
		return !this.canAddGroup ||
			!this.selectedGroup ||
			!this.selectedGroup.name ||
			!this.changed;
	}

	public editGroup() {
		// Save the color override to be re-enabled later
		if (this.groupsService.hasColorOverride(this.selectedGroup)) {
			this.lastColorOverride = this.selectedGroup;
		}

		// We don't want color over ride when we're editing
		this.groupsService.removeColorOverride(this.selectedGroup._id, false);
		this.showGroupPane();
	}

	public deleteHighlightedGroups() {
		this.groupsService.deleteHighlightedGroups(this.teamspace, this.model)
		.catch((error) => {
			this.errorDialog(error);
		});
	}

	public deleteAllGroups() {
		if (this.groups && this.groups.length > 0) {
			this.confirmDeleteAllDialog();
		}
	}

	public confirmDeleteAllDialog() {
		const content = `Delete all groups?`;
		const escapable = true;
		this.dialogService.confirm(`Confirm Delete`, content, escapable, "Yes", "Cancel")
			.then(() => {
				this.groupsService.deleteAllGroups(this.teamspace, this.model);
			})
			.catch(() => { });
	}

	public addGroup() {

		this.groupsService.generateNewGroup().then(() => {
			this.showGroupPane();
		});

	}

	public handleGroupSave() {

		this.savingGroup = true;
		if (this.selectedGroup.new) {
			this.createGroup();
		} else {

			const presentConfirmation = Math.abs(this.selectedGroup.totalSavedMeshes -
				this.selectedObjectsLen) / Math.max(this.selectedGroup.totalSavedMeshes,
					this.selectedObjectsLen) > this.dialogThreshold;

			if (presentConfirmation) {
				this.confirmUpdateDialog(this.selectedGroup.totalSavedMeshes, this.selectedObjectsLen);
			} else {
				this.updateGroup();
			}

		}

	}

	public errorDialog(error) {
		const content = "Delete group failed. Contact support@3drepo.io if problem persists.";
		const escapable = true;
		console.error(error);
		this.dialogService.text("Error Deleting Groups", content, escapable);
	}

	public confirmUpdateDialog(saved: number, selected: number) {
		const content = `A significant change is about to be applied to this group
					(${saved} to ${selected} objects). Do you wish to proceed?`;
		const escapable = true;
		this.dialogService.confirm(`Confirm Group Update`, content, escapable, "Update", "Cancel")
			.then(() => {
				this.updateGroup();
			})
			.catch(() => {
				this.savingGroup = false;
				this.reselectGroup();
			});
	}

	public isolateGroup($event, group: any) {
		$event.stopPropagation();
		this.groupsService.isolateGroup(group);
	}

	public setSelectedGroupColor(color: number[], isHex: boolean) {
		if (!isHex) {
			this.hexColor = "";
		}
		this.groupsService.setSelectedGroupColor(color);
	}

	public reselectGroup() {
		this.groupsService.reselectGroup(this.selectedGroup);
	}

	public getRGBA(color: any) {
		return this.groupsService.getRGBA(color);
	}

	public getGroupRGBAColor(group: any) {
		return this.groupsService.getGroupRGBAColor(group);
	}

	public getFormattedDate(timestamp: number) {
		return (new Date(timestamp)).toLocaleDateString();
	}

	public updateGroup() {
		this.groupsService.updateGroup(
			this.teamspace,
			this.model,
			this.selectedGroup._id,
			this.selectedGroup
		)
			.then(() => {
				this.savedGroupData = Object.assign({}, this.selectedGroup);
				this.savingGroup = false;
			})
			.catch((error) => {
				this.handleGroupError("update");
				this.savingGroup = false;
				console.error(error);
			});
	}

	public createGroup() {

		this.groupsService.createGroup(
			this.teamspace,
			this.model,
			this.selectedGroup
		)
			.then(() => {
				this.savingGroup = false;
				this.savedGroupData = Object.assign({}, this.selectedGroup);
				this.updateChangeStatus();
			})
			.catch((error) => {
				this.handleGroupError("create");
				this.savingGroup = false;
				console.error(error);
			});

	}

	public isEditing(): boolean {
		return this.toShow === "group";
	}

	public getColorOverrideRGBA(group: any): string {
		const hasOverride = this.groupsService.hasColorOverride(group);
		if (hasOverride) {
			return this.getGroupRGBAColor(group);
		}
		return "rgba(0,0,0,0.54)";
	}

	public showGroupPane() {
		this.savedGroupData = Object.assign({}, this.selectedGroup);
		this.toShow = "group";
		this.hexColor = "";

		this.onContentHeightRequest({ height: 310 });
		this.onShowItem();
		this.focusGroupName();
		this.groupsService.updateSelectedObjectsLen();
	}

	public cancelEdit() {
		this.hexColor = "";
		this.onHideItem();
	}

	public focusGroupName() {
		this.$timeout(() => {
			const input: HTMLElement = this.$element[0].querySelector("#groupName");
			input.focus();
		});
	}

	public selectGroup(group: any) {
		this.groupsService.selectGroup(group);
	}

	public updateChangeStatus(): void {
		if (!this.savedGroupData || !this.selectedGroup) {
			this.changed = false;
		} else {
			const differsFromSavedData = !this.groupsService.areGroupsEqual(this.savedGroupData, this.selectedGroup);
			const differsdObjects = !this.groupsService.areGroupObjectsEqual(this.selectedNodes, this.selectedGroup.objects);
			this.changed = (differsFromSavedData || differsdObjects);
		}
	}

	public setContentHeight() {

		if (this.toShow === "group") {
			return 310;
		}

		let contentHeight = 0;
		const groupHeight = 110;
		const actionBar = 52;

		if (this.groups && this.groups.length) {
			contentHeight = (this.groups.length * groupHeight) + actionBar;
		} else {
			contentHeight = 130;
		}

		this.onContentHeightRequest({ height: contentHeight });

	}

	/*** Realtime sync  */
	public watchNotification() {
		this.groupsNotifications.subscribeToCreated(this.onGroupsCreated, this);
		this.groupsNotifications.subscribeToUpdated(this.onGroupsUpdated, this);
		this.groupsNotifications.subscribeToDeleted(this.onGroupsDeleted, this);
	}

	public onGroupsCreated(group) {
		this.groupsService.state.groups.push(group);

		if (this.groupsService.state.overrideAll) {
			this.groupsService.colorOverride(group);
		}
	}

	public onGroupsDeleted(ids) {
		if (this.isEditing() && ids.indexOf(this.selectedGroup._id) >= 0 ) {
			this.cancelEdit();
		}

		this.groupsService.deleteStateGroupsByIdsDeferred(ids);
	}

	public onGroupsUpdated(group) {
		const shouldPaintObjects = this.groupsService.hasColorOverride(group);
		if (shouldPaintObjects) {
			this.groupsService.removeColorOverride(group._id);
		}

		this.justUpdated = !!this.selectedGroup && group._id === this.selectedGroup._id;
		this.savedGroupData = Object.assign({}, group);
		this.groupsService.replaceStateGroup(group);
		this.$timeout(this.resetJustUpdated.bind(this) , 4000);

		if (this.justUpdated) {
			this.groupsService.selectGroup(group);
		}

		if (shouldPaintObjects) {
			this.groupsService.colorOverride(group);
		}
	}

	private resetJustUpdated() {
		this.justUpdated = false;
	}

	/***/
}

export const GroupsComponent: ng.IComponentOptions = {
	bindings: {
		account: "<",
		model: "<",
		revision: "<",
		modelSettings: "<",
		filterText: "<",
		onContentHeightRequest: "&",
		onShowItem: "&",
		onHideItem: "&",
		hideItem: "<",
		selectedMenuOption: "="
	},
	controller: GroupsController,
	controllerAs: "vm",
	templateUrl: "templates/groups.html"
};

export const GroupsComponentModule = angular
	.module("3drepo")
	.component("groups", GroupsComponent);
