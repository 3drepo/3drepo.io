/**
 *	Copyright (C) 2016 3D Repo Ltd
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

class NewMemberFormController implements ng.IController {
	public static $inject: string[] = [
		"AccountService",
		"DialogService"
	];

	private newMember;
	private currentTeamspace;
	private searchText;
	private onSave;

	constructor(
		private AccountService: any,
		private DialogService: any
	) {}

	public $onInit(): void {
		this.newMember = {};
	}

	public selectedUserChange(): void {
		this.newMember.user = "test";
	}

	/**
	 * Search memebers by query
	 */
	public querySearch(): void {
		return this.AccountService.findMembers(this.currentTeamspace, this.searchText);
	}

	/**
	 * Prepare user data and send request
	 */
	public addMember(): void {
		return this.AccountService.addMember(this.currentTeamspace, this.newMember)
			.then((response) => {
				if (response.status === 200 && this.onSave) {
					this.onSave({newMember: response.data});
				} else if (response.status === 400) {
					throw (response);
				}
			})
			.catch(this.DialogService.showError.bind(null, "assign", "licence"));
	}
}

export const NewMemberFormComponent: ng.IComponentOptions = {
	bindings: {
		currentTeamspace: "<",
		jobs: "<",
		title: "<",
		onSave: "&"
	},
	controller: NewMemberFormController,
	controllerAs: "vm",
	templateUrl: "templates/new-member-form.html"
};

export const NewMemberFormComponentModule = angular
	.module("3drepo")
	.component("newMemberForm", NewMemberFormComponent);
