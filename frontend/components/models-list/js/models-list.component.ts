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

import {sortByName} from "../../../helpers/sorting";

class ModelsListController implements ng.IController {
	public static $inject: string[] = [
		"$mdDialog"
	];

	private SORT_TYPES = SORT_TYPES;

	private models;
	private processedModels;
	private currentTeamspace;
	private currentSort;
	private onChange;
	private searchText;
	private isLoading = true;
	private shouldSelectAllItems;
	private hasSelectedItem;

	constructor(
		private $mdDialog: any
	) {
		this.currentSort = {
			type: SORT_TYPES.USERS,
			order: SORT_ORDER_TYPES.ASCENDING
		};
	}

	public $onInit(): void {}

	public $onChanges({models}: {models?: any}): void {
		if (models && models.currentValue && this.currentSort) {
			if (!this.processedModels) {
				this.isLoading = false;
			}
			this.shouldSelectAllItems = false;
			this.hasSelectedItem = false;
			this.processedModels = this.processData();
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
		this.processedModels = this.processData();
	}

	/**
	 * Search callback
	 */
	public onSearch(): void {
		this.processedModels = this.processData();
		this.onSelectionChange();
	}

	public processData() {
		const filteredModels = this.getFilteredData(this.models, this.searchText);
		const processedModels = this.getSortedData(filteredModels);
		return processedModels;
	}

	/**
	 * Filter models by query
	 * @param members
	 * @param options
	 * @returns {Array}
	 */
	public getFilteredData(data = [], query = ""): object[] {
		if (!query) {
			return data;
		}
		const lowercasedQuery = query.toLowerCase();
		const modelsRequired = "model".includes(lowercasedQuery);
		const federationsRequired = "federation".includes(lowercasedQuery);

		return data.filter(({name, federate}) => {
			return name.includes(query) ||
				(modelsRequired && !federate) ||
				(federationsRequired && federate);
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
			[matches({type: USERS}), sortByName.bind(null, data)]
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

		this.models = this.models.map((model) => {
			const isVisible = this.processedModels.some(({ user }) => user === model.user);
			return {...model, isSelected: this.shouldSelectAllItems && isVisible};
		});
		this.processedModels = this.processData();

		this.onSelectionChange();
	}

	public onSelectionChange(): void {
		const selectedItems = this.processedModels.filter(({isSelected}) => isSelected);
		this.hasSelectedItem = Boolean(selectedItems.length);
		this.shouldSelectAllItems = this.hasSelectedItem && selectedItems.length === this.models.length;
		this.onChange({selectedModels: selectedItems});
	}
}

export const ModelsListComponent: ng.IComponentOptions = {
	bindings: {
		models: "<",
		currentTeamspace: "<",
		onChange: "&",
		ngDisabled: "<",
		messageEmptyList: "@?"
	},
	controller: ModelsListController,
	controllerAs: "vm",
	templateUrl: "templates/models-list.html"
};

export const ModelsListComponentModule = angular
	.module("3drepo")
	.component("modelsList", ModelsListComponent);
