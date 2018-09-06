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
import get from "lodash/get";
import pick from "lodash/pick";

import {TEAMSPACE_PERMISSIONS} from "../../../constants/teamspace-permissions";

class NewMemberFormController implements ng.IController {
	public static $inject: string[] = [
		"AccountService",
		"DialogService"
	];

	private newMember;
	private currentTeamspace;
	private searchText;
	private onSave;
	private selectedUser;

	constructor(
		private AccountService: any,
		private DialogService: any
	) {}

	public $onInit(): void {
		this.newMember = {};
	}

	public selectedUserChange(): void {
		this.newMember.user = get(this.selectedUser, "user", null);
	}

	public selectedJobChange(): void {
		this.newMember.user = get(this.selectedUser, "user", null);
	}

	/**
	 * Search memebers by query
	 */
	public querySearch(): void {
		return this.AccountService.findMembers(this.currentTeamspace, this.searchText)
			.then((response) => response.data);
	}

	/**
	 * Prepare user data and send request
	 */
	public addMember(): void {
		const member = {
			...pick(this.newMember, ["user", "job"]),
			permissions: this.newMember.isAdmin ? [TEAMSPACE_PERMISSIONS.admin.key] : []
		};

		this.AccountService.addMember(this.currentTeamspace, member)
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
