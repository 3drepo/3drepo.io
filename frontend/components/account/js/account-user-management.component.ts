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

import {TEAMSPACE_PERMISSIONS} from "../../../constants/teamspace-permissions";
import {get, uniq, map, isNumber} from "lodash";

export const TABS_TYPES = {
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

class AccountUserManagementController implements ng.IController {

		public static $inject: string[] = [
			"$q",
			"AccountService",
			"DialogService",
			"$state"
		];

		private TABS_TYPES = TABS_TYPES;

		private currentUser;
		private accounts;
		private teamspaces = [];
		private members;
		private jobs;
		private jobsColors;
		private projects;
		private currentTeamspace;
		private licencesLimit;
		private licencesLabel;
		private isLoadingTeamspace;

		private selectedTeamspace;
		private selectedTab;
		private selectedProject;
		private showAddingPanel;
		private selectedView;

		constructor(
			private $q: any,
			private AccountService: any,
			private DialogService: any,
			private $state: any
		) {
			const {tab, teamspace} = this.$state.params;
			this.selectedTab = parseInt(tab, 10);

			if (teamspace) {
				this.selectedTeamspace = teamspace;
			}
		}

		public $onInit(): void {
			this.onTeamspaceChange();
		}

		public $onChanges({currentUser, accounts}: {currentUser?: any, accounts?: any}): void {
			if (currentUser.currentValue && !this.selectedTeamspace) {
				this.selectedTeamspace = currentUser.currentValue;
			}

			if (currentUser.currentValue && accounts.currentValue) {
				this.teamspaces = accounts.currentValue.map((account) => {
					return {
						...account,
						isProjectAdmin: Boolean(account.projects.length)
					};
				});
			}
		}

		/**
		 * Get teamspace details
		 */
		public onTeamspaceChange = (): void => {
			this.isLoadingTeamspace = true;
			this.currentTeamspace = this.teamspaces.find(({account}) => account === this.selectedTeamspace);
			const membersPromise = this.setTeamspaceMembers(this.currentTeamspace.account);
			const jobsPromise = this.setTeamspaceJobs(this.currentTeamspace.account);

			this.$state.go(this.$state.$current.name, {teamspace: this.selectedTeamspace}, {notify: false});

			this.$q.all([membersPromise, jobsPromise]).then(() => {
				this.projects = [...this.currentTeamspace.projects];
				this.isLoadingTeamspace = false;
			});
		}

		/**
		 * Get teamspace details
		 */
		public onTabChange = (): void => {
			const newParams: any = {tab: this.selectedTab};

			if (this.selectedTab !== TABS_TYPES.PROJECTS) {
				newParams.view = null;
			}
			this.$state.go(this.$state.$current.name, newParams, {notify: false});
		}

		/**
		 * Get teamspace users list
		 * @param teamspaceName
		 */
		public setTeamspaceMembers(teamspaceName: string): void {
			const quotaInfoPromise = this.AccountService.getQuotaInfo(teamspaceName)
				.catch(this.DialogService.showError.bind(null, "retrieve", "subscriptions"));

			const memberListPromise = this.AccountService.getMembers(teamspaceName)
				.catch(this.DialogService.showError.bind(null, "retrieve", "members"));

			return this.$q.all([quotaInfoPromise, memberListPromise])
				.then(([quotaInfoResponse, membersResponse]) => {
					this.licencesLimit = get(quotaInfoResponse, "data.collaboratorLimit", 0);
					this.members = membersResponse.data.members.map(this.prepareMemberData);
					this.licencesLabel = this.getLicencesLabel();
				});
		}

		/**
		 * Convert member data to proper format
		 * @param member
		 * @returns
		 */
		public prepareMemberData = (member): object => {
			return {
				...member,
				isAdmin: member.permissions.includes(TEAMSPACE_PERMISSIONS.admin.key),
				isCurrentUser: this.currentUser === member.user
			};
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
				.catch(this.DialogService.showError.bind(null, "retrieve", "jobs"));
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
		 * Change panel visibility
		 * @param forceHide
		 */
		public toggleNewDataPanel(forceHide = false): void {
			this.showAddingPanel = forceHide ? false : !this.showAddingPanel;
		}

		/**
		 * Generate licences summary
		 */
		public getLicencesLabel(): string {
			const limit = isNumber(this.licencesLimit) ? this.licencesLimit : "unlimited";
			return `Assigned licences: ${this.members.length} out of ${limit}`;
		}

		/**
		 * Update local list of members
		 * @param updatedMembers
		 */
		public onMembersChange(updatedMembers): void {
			this.members = [...updatedMembers];
			this.licencesLabel = this.getLicencesLabel();
		}

		/**
		 * Add new member to local list of members
		 * @param updatedMembers
		 */
		public onMemberSave(newMember): void {
			this.members = [
				...this.members,
				this.prepareMemberData(newMember)
			];
			this.licencesLabel = this.getLicencesLabel();
			this.showAddingPanel = false;
		}
}

export const AccountUserManagementComponent: ng.IComponentOptions = {
		bindings: {
			currentUser: "<",
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
