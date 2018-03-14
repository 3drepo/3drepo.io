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
		"$q",

		"ViewerService",
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

	constructor(
		private $scope: any,
		private $q: any,

		private ViewerService: any,
		private GroupsService: any,
	) {}

	public $onInit() {
		this.onContentHeightRequest({height: 130});
		this.watchers();
		this.toShow = "groups";
		this.loading = true;
		this.getGroups(this.teamspace, this.model);
	}

	public $onDestroy() {
		
	}

	public watchers() {

		this.$scope.$watch("vm.groups", () => {
			this.setContentHeight();
		});

		this.$scope.$watch("vm.hideItem", (newValue) => {
			console.log("vm.hideItems", newValue)
			if (newValue) {
				this.toShow = "groups";
			}
			
		});

	}

	public getGroups(teamspace, model) {
		this.GroupsService.getGroups(this.model, this.teamspace)
			.then((groups) => {
				this.groups = groups;
				this.loading = false;
			});
	}

	public editGroup() {
		this.showGroupPane();
	}


	public addGroup() {
		this.selectedGroup = {
			new: true,
			date: new Date(),
			author: this.account,
		};
		this.showGroupPane();
	}

	public showGroupPane() {
		console.log(this.onShowItem);
		this.toShow = "group";
		this.onContentHeightRequest({height: 280});
		this.onShowItem();
	}

	public enableGroupEditing() {
		
	}

	public selectGroup(group) {
		if (this.selectedGroup) {
			this.selectedGroup.selected = false;
		}
		this.selectedGroup = group;
		this.selectedGroup.selected = true;
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
