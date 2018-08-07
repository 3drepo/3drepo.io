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

class AccountUserManagementController implements ng.IController {

		public static $inject: string[] = [];

		private account;
		private accounts;
		private selectedTeamspace;
		private teamspaces;

		constructor() {}

		public $onInit() {
			this.selectedTeamspace = this.account;
		}

		public $onChanges({account: accountName, accounts}: {account?: any, accounts?: any}) {
			if (accountName.currentValue && accounts.currentValue) {
				this.teamspaces = accounts.currentValue.filter(({isAdmin}) => isAdmin);
			}
		}

		/**
		 * Calls when teamspace was changed
		 */
		public onTeamspaceChange() {
/* 			this.setProjects();

			// The property is set async so it won't be there immediately
			return this.$q((resolve, reject) => {
				this.appendTeamspacePermissions(this.selectedTeamspace)
					.then(() => {
						this.setPermissionTemplates(this.selectedTeamspace,  this.modelSelected)
							.then(() => {
								if (this.fromURL.projectSelected) {
									this.projectSelected = this.fromURL.projectSelected;
									delete this.fromURL.projectSelected;
								}
								resolve(this.selectedTeamspace.teamspacePermissions);
							});
					})
					.catch((error) => {
						const title = "Issue Populating Teamspace Permissions";
						this.showError(title, error);
						reject(error);
					});

			}); */

		}
}

export const AccountUserManagementComponent: ng.IComponentOptions = {
		bindings: {
			account: "<",
			accounts: "<",
			showPage: "&?"
		},
		controller: AccountUserManagementController,
		controllerAs: "vm",
		templateUrl: "templates/account-user-management.html"
};

export const AccountUserManagementComponentModule = angular
		.module("3drepo")
		.component("accountUserManagement", AccountUserManagementComponent);
