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
import {values, cond, matches, orderBy} from "lodash";
import {SORT_TYPES, SORT_ORDER_TYPES} from "../../../constants/sorting";
import {PROJECT_ROLES_LIST, PROJECT_ROLES_TYPES} from "../../../constants/project-permissions";

class PermissionsListController implements ng.IController {
	public static $inject: string[] = [
		"$mdDialog",
		"ProjectsService"
	];

	private SORT_TYPES = SORT_TYPES;
	private PROJECT_PERMISSIONS = PROJECT_ROLES_LIST;

	private permissions;
	private processedPermissions;
	private currentTeamspace;
	private currentSort;
	private onChange;
	private searchText;
	private isLoading = true;
	private shouldSelectAllItems;
	private hasSelectedItem;
	private permissionsForSelected = PROJECT_ROLES_TYPES.NONE;

	constructor(
		private $mdDialog: any,
		private ProjectsService: any
	) {
		this.currentSort = {
			type: SORT_TYPES.USERS,
			order: SORT_ORDER_TYPES.ASCENDING
		};
	}

	public $onInit(): void {}

	public $onChanges({permissions}: {permissions?: any}): void {
		if (permissions && permissions.currentValue && this.currentSort) {
			if (!this.processedPermissions) {
				this.isLoading = false;
			}
			this.processedPermissions = this.processData();
		}
	}

	/**
	 * Set new sort type and order
	 * @param type
	 * @param order
	 */
	public setSortType(type, order, config = {}): void {
		this.currentSort = {type, order, config};
		this.processedPermissions = this.processData();
	}

	/**
	 * Search callback
	 */
	public onSearch(): void {
		this.processedPermissions = this.processData();
	}

	public processData(): object[] {
		const filteredPermissions = this.getFilteredData(this.permissions, this.searchText);
		const processedPermissions = this.getSortedData(filteredPermissions);
		return processedPermissions;
	}

	/**
	 * Filter members by query
	 * @param members
	 * @param options
	 * @returns {Array}
	 */
	public getFilteredData(members = [], query = ""): object[] {
		if (!query) {
			return members;
		}

		return members.filter(({firstName, lastName, user, company}) => {
			return `${firstName} ${lastName} ${user} ${company}`.includes(query);
		});
	}

	/**
	 * Return list of sorted data
	 * @param data
	 * @param options
	 * @returns {Array}
	 */
	public getSortedData(data = [], options = this.currentSort): object[] {
		const {USERS, FIELD} = SORT_TYPES;
		const sort = cond([
			[matches({type: USERS}), ({order}) => {
				return orderBy(
					data,
					({lastName}) => `${lastName}`.toLowerCase().trim(),
					order
				);
			}],
			[matches({type: FIELD}), ({order, config}) => {
				return orderBy(
					data,
					({key}) => key === config.key,
					order
				);
			}]
		]);
		return sort(options);
	}

	/**
	 * Refresh data on non processed members list
	 */
	public updateOriginMember(updatedMember): void {
		const memberIndex = this.permissions.findIndex(({email}) => updatedMember.email);
		if (memberIndex !== -1) {
			this.permissions[memberIndex] = {...updatedMember};
			this.onChange({updatedMembers: this.permissions});
		}
	}

	/**
	 * Toggle list items
	 */
	public toggleAllItems(): void {
		this.permissions = this.permissions.map((permission) => {
			return {...permission, isSelected: this.shouldSelectAllItems};
		});
		this.processedPermissions = this.processData();
		this.hasSelectedItem = this.shouldSelectAllItems;
	}

	public onSelectionChange(): void {
		const selectedItems = this.processedPermissions.filter(({isSelected}) => isSelected);
		this.hasSelectedItem = Boolean(selectedItems.length);
		this.shouldSelectAllItems = selectedItems.length === this.processedPermissions.length;
	}

	/**
	 * Pass single item to onChange callback
	 * @param permission
	 */
	public updatePermission(permission): void {
		this.onChange({updatedPermissions: [permission]});
	}

	/**
	 * Prepare data and call onChange callback
	 * @param selectedPermission
	 */
	public updatePermissionsForSelected(selectedPermission): void {
		const updatedPermissions = this.processedPermissions
			.reduce((permissionsList, permission) => {
				if (permission.isSelected && !permission.isAdmin) {
					permissionsList.push({...permission, key: selectedPermission});
				}
				return permissionsList;
			}, []);

		this.onChange({updatedPermissions});
	}
}

export const PermissionsListComponent: ng.IComponentOptions = {
	bindings: {
		permissions: "<?",
		currentTeamspace: "<?",
		onChange: "&?"
	},
	controller: PermissionsListController,
	controllerAs: "vm",
	templateUrl: "templates/permissions-list.html"
};

export const PermissionsListComponentModule = angular
	.module("3drepo")
	.component("permissionsList", PermissionsListComponent);
