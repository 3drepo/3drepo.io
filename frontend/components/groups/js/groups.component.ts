/**
 *	Copyright (C) 2017 3D Repo Ltd
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
		"GroupsService",
	];

	private onContentHeightRequest: any;
	private groups: any;
	private selectedGroup: any;
	private teamspace: string;
	private model: string;
	private loading: boolean;
	private account: string;
	private onShowItem;
	private toShow: string;
	private savingGroup: boolean;
	private changed: boolean;
	private groupColours: any[];

	constructor(
		private $scope: any,
		private GroupsService: any,
	) {}

	public $onInit() {
		this.changed = false;
		this.teamspace = this.account; // Workaround legacy naming 
		this.onContentHeightRequest({height: 130});
		this.watchers();
		this.toShow = "groups";
		this.loading = true;
		this.GroupsService.getGroups(this.account, this.model)
			.then(() => {
				this.loading = false;
			})

		this.groupColours = [
			[[255, 195, 18], [196, 229, 56], [52, 152, 219], [253, 167, 223], [237, 76, 103]],
			[[247, 159, 31], [163, 203, 56], [18, 137, 167], [217, 128, 250], [181, 52, 113]], 
			[[238, 90, 36], [0, 148, 50], [6, 82, 221], [153, 128, 250], [131, 52, 113]],
			[[234, 32, 39], [0, 98, 102], [87, 88, 187], [27, 20, 100], [111, 30, 81]]
		]
		
	}

	public $onDestroy() {
		
	}

	public watchers() {

		this.$scope.$watch(() => {
			return this.GroupsService.state;
		}, (state) => {
			angular.extend(this, state);
			this.changed = true;
		}, true)

		this.$scope.$watch("vm.groups", () => {
			this.setContentHeight();
		});

		this.$scope.$watch("vm.hideItem", (newValue) => {
			if (newValue) {
				this.toShow = "groups";
			}
		});

		this.$scope.$watch("vm.selectedGroup", () => {
			this.changed = true;
		}, true);

	}


	public openColorMenu($mdMenu, event) {
		$mdMenu.open(event);
	}


	public saveDisabled() {
		return !this.selectedGroup ||
			   !this.selectedGroup.name ||
			   !this.changed
	}

	public editGroup() {
		this.changed = false;
		this.showGroupPane();
	}

	public deleteGroup(group) {
		if (
			this.selectedGroup && 
			this.selectedGroup._id
		) {
			this.GroupsService.deleteGroup(
				this.teamspace,
				this.model,
				this.selectedGroup
			);
		}
	}

	public addGroup() {

		this.GroupsService.selectGroup({
			new: true,
			createdAt: Date.now(),
			author: this.teamspace,
			name: this.GroupsService.getDefaultGroupName(this.groups),
		})
		this.showGroupPane();
	}

	public handleGroupSave() {
		this.savingGroup = true;
		if (this.selectedGroup.new) {
			this.createGroup();
		} else {
			this.updateGroup();
		}
	}

	public isolateGroup(group) {
		this.GroupsService.isolateGroup(group);
	}

	public setSelectedGroupColor(color: number[]) {
		this.GroupsService.setSelectedGroupColor(color);
	}

	public getRGBA(color: any) {
		return this.GroupsService.getRGBA(color);
	}

	public getGroupRGBAColor(group: any) {
		return this.GroupsService.getGroupRGBAColor(group);
	}

	public updateGroup() {
		this.GroupsService.updateGroup(
			this.teamspace,
			this.model,
			this.selectedGroup._id,
			this.selectedGroup
		)
			.then(() => {
				this.changed = false;
				this.savingGroup = false;
			})
			.catch((error) => {
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
				this.changed = false;
				this.savingGroup = false;
			})
			.catch((error) => {
				this.savingGroup = false;
				console.error(error);
			});
	}

	public showGroupPane() {
		this.toShow = "group";
		this.onContentHeightRequest({height: 280});
		this.onShowItem();
	}

	public selectGroup(group) {
		this.GroupsService.selectGroup(group);
	}

	public setContentHeight() {
		let contentHeight = 0;
		if (this.groups && this.groups.length) {
			contentHeight = this.groups.length * 100;
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
	},
	controller: GroupsController,
	controllerAs: "vm",
	templateUrl: "templates/groups.html",
};

export const GroupsComponentModule = angular
	.module("3drepo")
	.component("groups", GroupsComponent);
