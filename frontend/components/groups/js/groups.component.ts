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
		"IconsConstant"
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
	private toShow: string;
	private savingGroup: boolean;
	private changed: boolean;
	private groupColours: any[];
	private hexColor: string;
	private selectedObjectsLen: number;
	private dialogThreshold: number;
	private canAddGroup: boolean;
	private modelSettings: any;
	private savedGroupData: any;
	private customIcons: any;
	private lastColorOverride: any;

	constructor(
		private $scope: ng.IScope,
		private $timeout: ng.ITimeoutService,
		private $element: ng.IRootElementService,

		private GroupsService: any,
		private DialogService: any,
		private TreeService: any,
		private AuthService: any,
		private ClientConfigService: any,
		private IconsConstant: any
	) {}

	public $onInit() {

		this.customIcons = this.IconsConstant;

		this.canAddGroup = false;
		this.dialogThreshold = 0.5;
		this.changed = false;
		this.teamspace = this.account; // Workaround legacy naming
		this.onContentHeightRequest({height: 1000});
		this.GroupsService.reset();
		this.watchers();
		this.toShow = "groups";
		this.loading = true;
		this.GroupsService.getGroups(this.account, this.model, this.revision)
			.then(() => {
				this.loading = false;
			});

		this.groupColours = [
			[[255, 195, 18], [196, 229, 56], [52, 152, 219], [253, 167, 223], [237, 76, 103]],
			[[247, 159, 31], [163, 203, 56], [18, 137, 167], [217, 128, 250], [181, 52, 113]],
			[[238, 90, 36], [0, 148, 50], [6, 82, 221], [153, 128, 250], [131, 52, 113]],
			[[234, 32, 39], [0, 98, 102], [87, 88, 187], [27, 20, 100], [111, 30, 81]]
		];

	}

	public $onDestroy() {
		this.groups = [];
	}

	public watchers() {

		this.$scope.$watch(() => {
			return this.GroupsService.state;
		}, (newState, oldState) => {

			angular.extend(this, newState);
			this.changed = true;

		}, true);

		this.$scope.$watch("vm.groups", () => {
			this.setContentHeight();
		});

		this.$scope.$watch("vm.hideItem", (newValue) => {
			if (newValue) {
				this.toShow = "groups";
				this.setContentHeight();
				this.resetToSavedGroup();
				if (this.lastColorOverride) {
					this.GroupsService.colorOverride(this.lastColorOverride);
					this.lastColorOverride = null;
				}
			}
		});

		this.$scope.$watch("vm.hexColor", () => {
			if (this.hexColor) {
				const validHex = this.GroupsService.hexToRGBA(this.hexColor);
				if (validHex.length === 3) {
					this.setSelectedGroupColor(validHex, true);
				}
			}
		});

		this.$scope.$watch("vm.modelSettings", () => {
			if (this.modelSettings) {
				this.canAddGroup = this.AuthService.hasPermission(
					this.ClientConfigService.permissions.PERM_CREATE_ISSUE,
					this.modelSettings.permissions
				);
			}
		});

		this.$scope.$watchCollection(() => {
			return this.TreeService.currentSelectedNodes;
		}, () => {

			this.GroupsService.updateSelectedObjectsLen().then(() => {
				this.changed = true;
			});

		});

		this.$scope.$watch("vm.selectedMenuOption",
			(selectedOption: any) => {
				if (selectedOption && selectedOption.hasOwnProperty("value")) {
					switch (selectedOption.value) {
						case "overrideAll":
							this.GroupsService.colorOverrideAllGroups(selectedOption.selected);
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
		if (this.selectedGroup && this.savedGroupData) {
			this.selectedGroup.name = this.savedGroupData.name;
			this.selectedGroup.description = this.savedGroupData.description;
			this.selectedGroup.color = this.savedGroupData.color;
			this.GroupsService.updateSelectedGroupColor();
		}
	}

	public toggleColorOverride($event, group: any) {
		$event.stopPropagation();
		this.GroupsService.toggleColorOverride(group);
	}

	public handleGroupError(method: string) {
		const content = `Group ${method} failed.
			Contact support@3drepo.org if problem persists.`;
		const escapable = true;
		this.DialogService.text(`Group Error`, content, escapable);
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
		this.changed = false;

		// Save the color override to be re-enabled later
		if (this.GroupsService.hasColorOverride(this.selectedGroup)) {
			this.lastColorOverride = this.selectedGroup;
		}

		// We don't want color over ride when we're editing
		this.GroupsService.removeColorOverride(this.selectedGroup._id);
		this.showGroupPane();
	}

	public deleteGroup(group: any) {
		const deletePromises = this.GroupsService.deleteGroups(this.teamspace, this.model);

		deletePromises.then((deleteResponse) => {
			if (deleteResponse) {
				this.GroupsService.selectNextGroup();
			}
		})
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
		this.DialogService.confirm(`Confirm Delete`, content, escapable, "Yes", "Cancel")
			.then(() => {
				this.GroupsService.deleteAllGroups(this.teamspace, this.model);
			})
			.catch(() => {});
	}

	public addGroup() {

		this.GroupsService.generateNewGroup().then((newGroup) => {
			this.GroupsService.selectGroup(newGroup);
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
		this.DialogService.text("Error Deleting Groups", content, escapable);
	}

	public confirmUpdateDialog(saved: number, selected: number) {
		const content = `A significant change is about to be applied to this group
					(${saved} to ${selected} objects). Do you wish to proceed?`;
		const escapable = true;
		this.DialogService.confirm(`Confirm Group Update`, content, escapable, "Update", "Cancel")
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
		this.GroupsService.isolateGroup(group);
	}

	public setSelectedGroupColor(color: number[], isHex: boolean) {
		if (!isHex) {
			this.hexColor = "";
		}
		this.GroupsService.setSelectedGroupColor(color);
		this.changed = true;
	}

	public reselectGroup() {
		this.GroupsService.reselectGroup(this.selectedGroup);
	}

	public getRGBA(color: any) {
		return this.GroupsService.getRGBA(color);
	}

	public getGroupRGBAColor(group: any) {
		return this.GroupsService.getGroupRGBAColor(group);
	}

	public getFormattedDate(timestamp: number) {
		return (new Date(timestamp)).toLocaleDateString();
	}

	public updateGroup() {

		this.GroupsService.updateGroup(
			this.teamspace,
			this.model,
			this.selectedGroup._id,
			this.selectedGroup
		)
			.then(() => {
				this.savingGroup = false;
				this.savedGroupData = Object.assign({}, this.selectedGroup);
				// Wrapped in timeout to avoid watcher clashing
				this.$timeout(() => {
					this.changed = false;
				});

			})
			.catch((error) => {
				this.handleGroupError("update");
				this.savingGroup = false;
				console.error(error);
			});
	}

	public createGroup() {

		this.GroupsService.createGroup(
			this.teamspace,
			this.model,
			this.selectedGroup
		)
			.then(() => {
				this.savingGroup = false;
				this.savedGroupData = Object.assign({}, this.selectedGroup);
				// Wrapped in timeout to avoid watcher clashing
				this.$timeout(() => {
					this.changed = false;
				});

			})
			.catch((error) => {
				this.handleGroupError("create");
				this.savingGroup = false;
				console.error(error);
			});

	}

	public getColorOverrideRGBA(group: any): string {
		const hasOverride = this.GroupsService.hasColorOverride(group);
		if (hasOverride) {
			return this.getGroupRGBAColor(group);
		}
		return "rgba(0,0,0,0.54)";
	}

	public showGroupPane() {
		this.savedGroupData = Object.assign({}, this.selectedGroup);
		this.toShow = "group";
		this.hexColor = "";
		this.onContentHeightRequest({height: 310});
		this.onShowItem();
		this.focusGroupName();

	}

	public focusGroupName() {
		this.$timeout(() => {
			const input: HTMLElement = this.$element[0].querySelector("#groupName");
			input.focus();
		});
	}

	public selectGroup(group: any) {
		this.GroupsService.selectGroup(group);
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

		this.onContentHeightRequest({height: contentHeight });

	}

}

export const GroupsComponent: ng.IComponentOptions = {
	bindings: {
		account: "<",
		model: "<",
		revision: "<",
		modelSettings: "<",
		onContentHeightRequest: "&",
		onShowItem: "&",
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
