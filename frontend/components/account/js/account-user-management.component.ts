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

import {get, isNumber, uniq, compact} from "lodash";

import {TEAMSPACE_PERMISSIONS} from "../../../constants/teamspace-permissions";
import {PROJECT_ROLES_TYPES} from "../../../constants/project-permissions";
import { MODEL_ROLES_TYPES } from "../../../constants/model-permissions";

export const TABS_TYPES = {
	USERS: 0,
	PROJECTS: 1,
	JOBS: 2
};

const TABS = {
	[TABS_TYPES.USERS]: {
		id: TABS_TYPES.USERS,
		label: "Users"
	},
	[TABS_TYPES.PROJECTS]: {
		id: TABS_TYPES.PROJECTS,
		label: "Projects"
	},
	[TABS_TYPES.JOBS]: {
		id: TABS_TYPES.JOBS,
		label: "Jobs"
	}
};

class AccountUserManagementController implements ng.IController {

	public static $inject: string[] = [
		"$q",
		"$state",

		"AccountService",
		"DialogService",
		"JobsService"
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
	private isTeamspaceAdmin;

	private selectedTeamspace;
	private selectedTab;
	private selectedProject;
	private showAddingPanel;
	private selectedView;

	constructor(
		private $q: any,
		private $state: any,

		private AccountService: any,
		private DialogService: any,
		private JobsService: any
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
		const currentUserChanged = currentUser &&currentUser.currentValue;
		const accountsChanged = accounts && accounts.currentValue;

		if (currentUserChanged && !this.selectedTeamspace) {
			this.selectedTeamspace = currentUser.currentValue;
		}

		if (currentUserChanged && accountsChanged) {
			this.teamspaces = accounts.currentValue.reduce((teamspaces, account) => {
				const {isProjectAdmin, isModelAdmin} = account.projects.reduce((flags, { permissions, models }) => {
					flags.isProjectAdmin = permissions.includes(PROJECT_ROLES_TYPES.ADMINISTRATOR);
					flags.isModelAdmin = models.some((model) => model.permissions.includes(MODEL_ROLES_TYPES.ADMINISTRATOR));
					return flags;
				}, {});

				if (account.isAdmin || isProjectAdmin || isModelAdmin) {
					teamspaces.push({
						...account,
						isProjectAdmin
					});
				}
				return teamspaces;
			}, []);
		}
	}

	/**
	 * Get teamspace details
	*/
	public onTeamspaceChange = (): void => {
		this.isLoadingTeamspace = true;
		const currentTeamspace = this.teamspaces.find(({account}) => account === this.selectedTeamspace);
		const membersPromise = this.getTeamspaceMembersData(currentTeamspace.account);
		const jobsPromise = this.getTeamspaceJobsData(currentTeamspace.account);

		this.$state.go(this.$state.$current.name, {teamspace: this.selectedTeamspace}, {notify: false});
		this.isTeamspaceAdmin = currentTeamspace.isAdmin;

		this.$q.all([membersPromise, jobsPromise]).then(([membersData, jobsData]) => {
			this.currentTeamspace = currentTeamspace;
			this.members = membersData.members;
			this.licencesLimit = membersData.licencesLimit;
			this.jobs = jobsData.jobs;
			this.jobsColors = jobsData.colors;
			this.licencesLabel = this.getLicencesLabel();
			this.projects = this.currentTeamspace.projects.filter(({permissions}) => {
					return this.currentTeamspace.isAdmin || permissions.includes(PROJECT_ROLES_TYPES.ADMINISTRATOR);
				});
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
	public getTeamspaceMembersData(teamspaceName: string): void {
		const quotaInfoPromise = this.AccountService.getQuotaInfo(teamspaceName)
			.catch(this.DialogService.showError.bind(null, "retrieve", "subscriptions"));

		const memberListPromise = this.AccountService.getMembers(teamspaceName)
			.catch(this.DialogService.showError.bind(null, "retrieve", "members"));

		return this.$q.all([quotaInfoPromise, memberListPromise])
			.then(([quotaInfoResponse, membersResponse]) => {
				return {
					licencesLimit: get(quotaInfoResponse, "data.collaboratorLimit", 0),
					members: [...membersResponse.data.members.map(this.prepareMemberData.bind(null, teamspaceName))]
				};
			});
	}

	/**
	 * Convert member data to proper format
	 * @param member
	 * @returns
	 */
	public prepareMemberData = (teamspaceName, member): object => {
		return {
			...member,
			isAdmin: member.permissions.includes(TEAMSPACE_PERMISSIONS.admin.key),
			isCurrentUser: this.currentUser === member.user,
				isOwner: teamspaceName === member.user
		};
	}

	/**
	 * Get teamspace jobs list
	 * @param teamspaceName
	 */
	public getTeamspaceJobsData(teamspaceName: string): Promise<any> {
		const jobsPromises = [
			this.JobsService.getList(teamspaceName),
			this.JobsService.getColors(teamspaceName)
		];
		return Promise.all(jobsPromises)
			.catch(this.DialogService.showError.bind(null, "retrieve", "jobs"))
			.then(([jobsResponse, colorsResponse]) => {
				const jobs = get(jobsResponse, "data", []);
				const colors = get(colorsResponse, "data", []);

				return {jobs, colors};
			});
	}

	/**
	 * Change panel visibility
	 * @param forceHide
	 */
	public toggleNewDataPanel(forceHide = false): void {
		if (!this.isAddButtonDisabled()) {
			this.showAddingPanel = forceHide ? false : !this.showAddingPanel;
		}
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
	public onMemberSave = (newMember): void => {
		this.members = [
			...this.members,
			this.prepareMemberData(this.currentTeamspace.account, newMember)
		];
		this.licencesLabel = this.getLicencesLabel();
		this.showAddingPanel = false;
	}

	/**
	 * Add new job to local list of jobs
	 * @param updatedMembers
	 */
	public onJobSave(newJob): void {
		this.jobs = [...this.jobs, newJob];

		if (newJob.color && !this.jobsColors.includes(newJob.color)) {
			this.jobsColors = [...this.jobsColors, newJob.color];
		}
		this.showAddingPanel = false;
	}

	public onJobsChange(updatedJobs): void {
		this.jobs = [...updatedJobs];
	}

	public isAddButtonDisabled(): boolean {
		return (this.members && this.members.length === this.licencesLimit && this.selectedTab === this.TABS_TYPES.USERS)
			|| this.isLoadingTeamspace;
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
