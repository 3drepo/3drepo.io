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

import {get, uniq, map, values} from "lodash";

const TABS_TYPES = {
	USERS: 0,
	JOBS: 1,
	PROJECTS: 2
};

const TABS = {
	[TABS_TYPES.USERS]: {
		id: TABS_TYPES.USERS,
		label: "Users"
	},
	[TABS_TYPES.JOBS]: {
		id: TABS_TYPES.JOBS,
		label: "Jobs"
	},
	[TABS_TYPES.PROJECTS]: {
		id: TABS_TYPES.PROJECTS,
		label: "Projects"
	}
};

const TEAMSPACE_PERMISSIONS = {
	admin: {
		isAdmin: true,
		key: "teamspace_admin",
		label: "Teamspace admin"
	},
	user: {
		isAdmin: false,
		label: "User"
	}
};

class AccountUserManagementController implements ng.IController {

		public static $inject: string[] = [
			"$q",
			"$rootScope",
			"$mdDialog",
			"APIService",
			"AccountService",
			"DialogService"
		];

		private TEAMSPACE_PERMISSIONS = values(TEAMSPACE_PERMISSIONS);

		private account;
		private accounts;
		private teamspaces = [];
		private members;
		private jobs;
		private jobsColors;
		private projects;
		private currentTeamspace;
		private currentTabConfig;
		private extraData = {
			totalLicenses: 0,
			usedLicences: 0
		};
		private isLoadingTeamspace;

		private selectedTeamspace;
		private selectedTab;
		private selectedProject;

		private shouldSelectAllUser;

		constructor(
			private $q: any,
			private $rootScope: any,
			private $mdDialog: any,
			private APIService: any,
			private AccountService: any,
			private DialogService: any
		) {}

		public $onInit(): void {
			this.onTeamspaceChange();
		}

		public $onChanges({account: accountName, accounts}: {account?: any, accounts?: any}): void {
			if (accountName.currentValue && accounts.currentValue) {
				this.teamspaces = accounts.currentValue.filter(({isAdmin}) => isAdmin);
			}
		}

		/**
		 * Get teamspace details
		 */
		public onTeamspaceChange = (): void => {
			this.isLoadingTeamspace = true;
			this.currentTeamspace = this.teamspaces.find(({account}) => account === this.account);
			const membersPromise = this.setTeamspaceMembers(this.currentTeamspace.account);
			const jobsPromise = this.setTeamspaceJobs(this.currentTeamspace.account);

			this.$q.all([membersPromise, jobsPromise]).then(() => {
				this.projects = [...this.currentTeamspace.projects];
				this.isLoadingTeamspace = false;
			});
		}

		/**
		 * Get teamspace details
		 */
		public onTabChange = (): void => {
			this.currentTabConfig = TABS[this.selectedTab];
		}

		/**
		 * Get teamspace users list
		 * @param teamspaceName
		 */
		public setTeamspaceMembers(teamspaceName: string): void {
			const quotaInfoPromise = this.AccountService.getQuotaInfo(teamspaceName)
				.catch((error) => {
					this.handleError("retrieve", "subscriptions", error);
				});

			const memberListPromise = this.AccountService.getMembers(teamspaceName)
				.catch((error) => {
					this.handleError("retrieve", "members", error);
				});

			return this.$q.all([quotaInfoPromise, memberListPromise])
				.then(([quotaInfoResponse, membersResponse]) => {
					this.extraData.totalLicenses = get(quotaInfoResponse, "data.collaboratorLimit", 0);
					this.members = membersResponse.data.members.map((member) => {
						return {
							...member,
							isAdmin: member.permissions.includes(TEAMSPACE_PERMISSIONS.admin.key),
							isCurrentUser: this.account === member.user
						};
					});
				});
		}

		/**
		 * Get teamspace jobs list
		 * @param teamspaceName
		 */
		public setTeamspaceJobs(teamspaceName: string): void {
			return this.AccountService.getJobs(teamspaceName)
				.then((response) => {
					this.jobs = get(response, "data", []);
					this.jobsColors = uniq(map(this.jobs, "color"));
				})
				.catch((error) => {
					this.handleError("retrieve", "jobs", error);
				});
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

		/**
		 * Remove license for a member
		 */
		public removeMember(member): void {
			this.AccountService.removeMember(this.currentTeamspace.account, member.user)
				.then(this.onMemberRemove.bind(null, member))
				.catch((error) => {
					if (error.status === 400) {
						const responseCode = this.APIService.getResponseCode("USER_IN_COLLABORATOR_LIST");
						if (error.data.value === responseCode) {
							const dialogData: any = this.$rootScope.$new();
							dialogData.models = error.data.models,
							dialogData.projects = error.data.projects,
							dialogData.onRemove = this.removeLicenseConfirmed.bind(null, this.currentTeamspace.account, member);

							if (error.data.teamspace) {
								dialogData.teamspacePerms = error.data.teamspace.permissions.join(", ");
							}

							this.DialogService.showDialog("remove-license-dialog.html", dialogData);
						}
					} else {
						this.handleError("remove", "licence", error);
					}

				});
		}

		/**
		* Remove license from user who is a team member of a model
		*/
		public removeLicenseConfirmed = (teamspace, member) => {
			this.AccountService.removeMemberCascade(teamspace, member.user)
				.then(this.onMemberRemove.bind(null, member))
				.catch((error) => {
					this.handleError("remove", "licence", error);
				});
		}

		/**
		 * Call on member remove
		 */
		public onMemberRemove = (member, response): void => {
			if (response.status === 200) {
				this.members = this.members.filter(({user}) => user !== member.user);
			}
			this.$mdDialog.cancel();
		}

		/**
		 * Handle an error from a request
		 */
		public handleError(action: string, type: string, error: any) {
			const message = get(error, "data.message", "");

			const title = "Error";
			const subtitle = action && type ?
			`Something went wrong trying to ${action} the ${type}:` :
			`Something went wrong:`;

			const content = `
				${subtitle}
				<br><br>
				<strong>${message}</strong>
				<br>
				${error.status ? `<code>(Status Code: ${error.status})</code>` : ""}
				<br><br>
				If this is unexpected please message support@3drepo.io.
			`;
			const escapable = true;

			this.DialogService.html(title, content, escapable);
			console.error(subtitle, error);
		}

		public toggleAllUsers() {
			this.members = this.members.map((member) => {
				return {...member, isSelected: this.shouldSelectAllUser};
			});
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
