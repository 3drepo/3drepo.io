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
		private teamspaces;
		private users;
		private jobs;
		private projects;

		private selectedTeamspace;
		private selectedTab;

		constructor() {}

		public $onInit(): void {
			this.selectedTeamspace = this.account;
		}

		public $onChanges({account: accountName, accounts}: {account?: any, accounts?: any}): void {
			if (accountName.currentValue && accounts.currentValue) {
				this.teamspaces = accounts.currentValue.filter(({isAdmin}) => isAdmin);
			}
		}

		/**
		 * Get teamspace details
		 */
		public onTeamspaceChange(): void {
			this.users = this.getTeamspaceUsers(this.selectedTeamspace);
			this.jobs = this.getTeamspaceJobs(this.selectedTeamspace);
			this.projects = this.getTeamspaceProjects(this.selectedTeamspace);
		}

		/**
		 * Get teamspace users list
		 * @param teamspaceName
		 */
		public getTeamspaceUsers(teamspaceName: string): object[] {
			if (!teamspaceName) {
				return [];
			}
			// TODO: Handle request
			return [];
		}

		/**
		 * Get teamspace jobs list
		 * @param teamspaceName
		 */
		public getTeamspaceJobs(teamspaceName: string): object[] {
			if (!teamspaceName) {
				return [];
			}
			// TODO: Handle request
			return [];
		}

		/**
		 * Get teamspace projects list
		 * @param teamspaceName
		 */
		public getTeamspaceProjects(teamspaceName: string): object[] {
			if (!teamspaceName) {
				return [];
			}
			// TODO: Handle request
			return [];
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
