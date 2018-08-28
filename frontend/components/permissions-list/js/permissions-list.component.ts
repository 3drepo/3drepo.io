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
import {values, cond, matches, orderBy, sumBy} from "lodash";
import {SORT_TYPES, SORT_ORDER_TYPES} from "../../../constants/sorting";
import {PROJECT_ROLES_LIST, PROJECT_ROLES_TYPES} from "../../../constants/project-permissions";

import {sortByName} from "../../../helpers/sorting";

const UNDEFINED_PERMISSIONS = "undefined";
const PERMISSION_COLUMN_SIZE = 12;

class PermissionsListController implements ng.IController {
	public static $inject: string[] = [
		"$mdDialog",
		"ProjectsService"
	];

	private SORT_TYPES = SORT_TYPES;

	private data;
	private processedData;
	private currentTeamspace;
	private currentSort;
	private onChange;
	private searchText;
	private isLoading = true;
	private shouldSelectAllItems = false;
	private hasSelectedItem = false;
	private permissionsForSelected = UNDEFINED_PERMISSIONS;
	private permissions;
	private permissionsContainerSize;
	private permissionSize;

	constructor(
		private $mdDialog: any,
		private ProjectsService: any
	) {
		this.currentSort = {
			type: SORT_TYPES.USERS,
			order: SORT_ORDER_TYPES.ASCENDING
		};
	}

	public $onInit(): void {
		this.permissionsContainerSize = sumBy(this.permissions, "width");
	}

	public $onChanges({data, currentTeamspace}: {data?: any, currentTeamspace?: any}): void {
		if (currentTeamspace) {
			this.processedData = null;
		}

		if (data && this.currentSort) {
			this.isLoading = true;
			if (!this.processedData || !this.processedData.length) {
				this.processedData = this.processData();
			} else {
				this.processedData = this.processedData.map(({user}) => {
					return data.currentValue.find((newPermission) => newPermission.user === user);
				});
			}

			this.isLoading = false;
			this.permissionsForSelected = UNDEFINED_PERMISSIONS;
			this.onSelectionChange();
		}
	}

	/**
	 * Set new sort type and order
	 * @param type
	 * @param order
	 */
	public setSortType(type, order, config = {}): void {
		this.currentSort = {type, order, config};
		this.processedData = this.processData();
	}

	/**
	 * Search callback
	 */
	public onSearch(): void {
		this.processedData = this.processData();
	}

	/**
	 * Filter and sort the data
	 * @param param
	 */
	public processData(shouldSort = true) {
		const filteredPermissions = this.getFilteredData(this.data, this.searchText);
		const processedData = shouldSort ? this.getSortedData(filteredPermissions) : filteredPermissions;
		return processedData;
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
	public getSortedData(data = [], options = this.currentSort) {
		const {USERS, FIELD} = SORT_TYPES;
		const sort = cond([
			[matches({type: USERS}), sortByName.bind(null, data)],
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
	 * Toggle list items
	 */
	public toggleAllItems(): void {
		this.data = this.data.map((row) => {
			const isVisible = this.processedData.some(({user}) => user === row.user);
			return {...row, isSelected: this.shouldSelectAllItems && isVisible};
		});
		this.processedData = this.processData();
		this.hasSelectedItem = this.shouldSelectAllItems;
	}

	public onSelectionChange(): void {
		const selectedItems = this.processedData.filter(({isSelected}) => isSelected);
		this.hasSelectedItem = Boolean(selectedItems.length);
		this.shouldSelectAllItems = selectedItems.length === this.processedData.length;
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
		const updatedPermissions = this.processedData
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
		data: "<?",
		currentTeamspace: "<?",
		permissions: "<?",
		onChange: "&?"
	},
	controller: PermissionsListController,
	controllerAs: "vm",
	templateUrl: "templates/permissions-list.html"
};

export const PermissionsListComponentModule = angular
	.module("3drepo")
	.component("permissionsList", PermissionsListComponent);
