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
import {MODEL_ROLES_TYPES} from "../../../constants/model-permissions";

const UNDEFINED_PERMISSIONS = "undefined";
const PERMISSION_COLUMN_SIZE = 12;

const MODES = {
	PROJECTS: "projects",
	MODELS: "models"
};

class PermissionsListController implements ng.IController {
	public static $inject: string[] = [
		"$mdDialog",
		"$timeout",
		"ProjectsService"
	];

	private SORT_TYPES = SORT_TYPES;
	private MODEL_ROLES_TYPES = MODEL_ROLES_TYPES;
	private MODES = MODES;

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
	private ngDisabled;
	private currentUser;
	private mode;

	constructor(
		private $mdDialog: any,
		private $timeout: any,
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
				this.onSelectionChange();
			}

			this.isLoading = false;
			this.permissionsForSelected = UNDEFINED_PERMISSIONS;

			if (data.currentValue) {
				this.currentUser = data.currentValue.find(({isCurrentUser}) => isCurrentUser);
			}
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
		this.onSelectionChange();
	}

	/**
	 * Filter and sort the data
	 * @param param
	 */
	public processData() {
		const filteredPermissions = this.getFilteredData(this.data, this.searchText);
		const processedData = this.getSortedData(filteredPermissions);
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
	public toggleAllItems(isIndenterminate): void {
		if (isIndenterminate) {
			this.hasSelectedItem = false;
			this.shouldSelectAllItems = false;
		}

		this.data = this.data.map((row) => {
			const isVisible = this.processedData.some(({user}) => user === row.user);
			const isUnavailable = row.isAdmin || row.isCurrentUser || row.isOwner;
			return {...row, isSelected: this.shouldSelectAllItems && isVisible && !isUnavailable};
		});
		this.processedData = this.processData();
		this.onSelectionChange();
	}

	public onSelectionChange(): void {
		const selectedItems = this.processedData.filter(({isSelected}) => isSelected);
		this.hasSelectedItem = Boolean(selectedItems.length);
		this.shouldSelectAllItems = this.hasSelectedItem && selectedItems.length === this.processedData.length;
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
			.reduce((permissionsList, row) => {
				if (row.isSelected && !this.isDisabledRow(row)) {
					permissionsList.push({...row, key: selectedPermission});
				}
				return permissionsList;
			}, []);

		this.onChange({updatedPermissions});
	}

	/**
	 * Check if row should be disabled
	 */
	public isDisabledRow(row): boolean {
		const passBaseValidation = this.ngDisabled || row.isDisabled || row.isOwner || row.isAdmin || row.isCurrentUser;

		if (passBaseValidation) {
			return true;
		}

		if (!passBaseValidation) {
			if (this.mode === MODES.PROJECTS && row.isProjectAdmin) {
				return !(this.currentUser.isAdmin || this.currentUser.isOwner || this.currentUser.isProjectAdmin);
			}

			if (this.mode === MODES.MODELS && row.isProjectAdmin) {
				return true;
			}

			if (this.mode === MODES.MODELS && row.isModelAdmin) {
				return !(this.currentUser.isAdmin || this.currentUser.isOwner || this.currentUser.isProjectAdmin);
			}
		}

		return false;
	}
}

export const PermissionsListComponent: ng.IComponentOptions = {
	bindings: {
		data: "<?",
		currentTeamspace: "<?",
		permissions: "<?",
		onChange: "&?",
		ngDisabled: "<",
		messageEmptyList: "@?",
		mode: "@"
	},
	controller: PermissionsListController,
	controllerAs: "vm",
	templateUrl: "templates/permissions-list.html"
};

export const PermissionsListComponentModule = angular
	.module("3drepo")
	.component("permissionsList", PermissionsListComponent);
