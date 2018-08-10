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
import {SORT_TYPES, SORT_ORDER_TYPES} from "../../../constants/sorting";
import {values, cond, matches, orderBy} from "lodash";

class UsersListController implements ng.IController {
	public static $inject: string[] = [
		"$rootScope",
		"$mdDialog",
		"APIService",
		"AccountService",
		"DialogService"
	];

	private TEAMSPACE_PERMISSIONS = values(TEAMSPACE_PERMISSIONS);
	private SORT_TYPES = SORT_TYPES;

	private members;
	private processedMembers;
	private jobs;
	private currentTeamspace;
	private currentSort;
	private onChange;
	private searchText;

	constructor(
		private $rootScope: any,
		private $mdDialog: any,
		private APIService: any,
		private AccountService: any,
		private DialogService: any
	) {
		this.members = [];
		this.setSortType(SORT_TYPES.USERS, SORT_ORDER_TYPES.ASCENDING);
	}

	public $onInit(): void {}

	public $onChanges({members}: {members?: any}): void {
		if (members && members.currentValue && this.currentSort) {
			this.processedMembers = this.processMembers();
		}
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
					this.DialogService.showError("remove", "licence", error);
				}

			});
	}

	/**
	* Remove license from user who is a team member of a model
	*/
	public removeLicenseConfirmed = (teamspace, member) => {
		this.AccountService.removeMemberCascade(teamspace, member.user)
			.then(this.onMemberRemove.bind(null, member))
			.catch(this.DialogService.showError.bind(null, "remove", "licence"));
	}

	/**
	 * Call on member remove
	 */
	public onMemberRemove = (member, response): void => {
		if (response.status === 200) {
			this.members = this.members.filter(({user}) => user !== member.user);
			this.processedMembers = this.processMembers();

			this.onChange({updatedMembers: this.members});
		}
		this.$mdDialog.cancel();
	}

	/**
	 * Update member job title
	 * @param member
	 */
	public onJobChange(member): void {
		const {job, user} = member;
		const updatePromise = this.AccountService[job ? "updateMemberJob" : "removeMemberJob"];
		const acionType = job ? "assign" : "unassign";

		member.isPending = true;
		updatePromise(this.currentTeamspace.account, job, user)
			.then((response) => {
				if (response.status !== 200) {
					throw (response);
				}
			})
			.catch(this.DialogService.showError.bind(null, acionType, "job"))
			.finally(() => {
				member.isPending = false;
				this.updateOriginMember(member);
			});
	}

	/**
	 * Update member permissions
	 * @param member
	 */
	public onPermissionsChange(member): void {
		const permissionData = {
			user: member.user,
			permissions: member.isAdmin ? [TEAMSPACE_PERMISSIONS.admin.key] : []
		};

		member.isPending = true;
		this.AccountService
			.setMemberPermissions(this.currentTeamspace.account, permissionData)
			.catch(this.DialogService.showError.bind(null, "update", "teamspace permissions"))
			.finally(() => {
				member.isPending = false;
				this.updateOriginMember(member);
			});
	}

	/**
	 * Set new sort type and order
	 * @param type
	 * @param order
	 */
	public setSortType(type, order): void {
		this.currentSort = {type, order};
		this.processedMembers = this.processMembers();
	}

	/**
	 * Search callback
	 */
	public onSearch(): void {
		this.processedMembers = this.processMembers();
	}

	public processMembers(): object[] {
		const filteredMembers = this.getFilteredMembers(this.members, this.searchText);
		const processedMembers = this.getSortedMembers(filteredMembers);
		return processedMembers;
	}

	/**
	 * Filter members by query
	 * @param members
	 * @param options
	 * @returns {Array}
	 */
	public getFilteredMembers(members = [], query = ""): object[] {
		if (!query) {
			return members;
		}

		return members.filter(({firstName, lastName, user, email}) => {
			return `${firstName} ${lastName} ${user} ${email}`.includes(query);
		});
	}

	/**
	 * Return list of sorted members
	 * @param members
	 * @param options
	 * @returns {Array}
	 */
	public getSortedMembers(members = [], options = this.currentSort): object[] {
		const {USERS, JOBS, PERMISSIONS} = SORT_TYPES;
		const sort = cond([
			[matches({type: USERS}), ({order}) => {
				return orderBy(
					members,
					({firstName, lastName}) => `${firstName} ${lastName}`.toLowerCase().trim(),
					order
				);
			}],
			[matches({type: JOBS}), ({order}) => {
				return orderBy(members, ["job"], order);
			}],
			[matches({type: PERMISSIONS}), ({order}) => {
				return orderBy(members, ["isAdmin"], order);
			}]
		]);
		return sort(options);
	}

	/**
	 * Refresh data on non processed members list
	 */
	public updateOriginMember(updatedMember) {
		const memberIndex = this.members.findIndex(({email}) => updatedMember.email);
		if (memberIndex !== -1) {
			this.members[memberIndex] = {...updatedMember};
			this.onChange({updatedMembers: this.members});
		}
	}
}

export const UsersListComponent: ng.IComponentOptions = {
	bindings: {
		members: "<?",
		jobs: "<?",
		currentTeamspace: "<?",
		onChange: "&?"
	},
	controller: UsersListController,
	controllerAs: "vm",
	templateUrl: "templates/users-list.html"
};

export const UsersListComponentModule = angular
	.module("3drepo")
	.component("usersList", UsersListComponent);
