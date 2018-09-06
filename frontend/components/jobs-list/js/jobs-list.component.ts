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

import {sortByField} from "../../../helpers/sorting";

class JobsListController implements ng.IController {
	public static $inject: string[] = [
		"$mdDialog",

		"JobsService",
		"DialogService"
	];

	private SORT_TYPES = SORT_TYPES;

	private jobs;
	private processedJobs;
	private currentTeamspace;
	private currentSort;
	private onChange;
	private searchText;
	private isLoading = true;
	private shouldSelectAllItems;
	private hasSelectedItem;

	constructor(
		private $mdDialog: any,

		private JobsService: any,
		private DialogService: any
	) {
		this.currentSort = {
			type: SORT_TYPES.FIELD,
			order: SORT_ORDER_TYPES.ASCENDING,
			config: {
				field: "_id"
			}
		};
	}

	public $onInit(): void {}

	public $onChanges({jobs}: {jobs?: any}): void {
		if (jobs && jobs.currentValue && this.currentSort) {
			if (!this.processedJobs) {
				this.isLoading = false;
			}
			this.shouldSelectAllItems = false;
			this.hasSelectedItem = false;
			this.processedJobs = this.processData();
		}
	}

	/**
	 * Set new sort type and order
	 * @param type
	 * @param order
	 */
	public setSortType(type, order, config = {}): void {
		this.currentSort = {type, order, config};
		this.processedJobs = this.processData();
	}

	/**
	 * Search callback
	 */
	public onSearch(): void {
		this.processedJobs = this.processData();
	}

	public processData() {
		const filteredPermissions = this.getFilteredData(this.jobs, this.searchText);
		const processedJobs = this.getSortedData(filteredPermissions);
		return processedJobs;
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

		return data.filter(({_id}) => _id.includes(query));
	}

	/**
	 * Return list of sorted data
	 * @param data
	 * @param options
	 * @returns {Array}
	 */
	public getSortedData(data = [], options = this.currentSort) {
		return sortByField(data, options);
	}

	/**
	 * Remove job
	 * @param job
	 */
	public onRemove(job) {
		this.JobsService.delete(this.currentTeamspace.account, job._id)
			.then(() => {
				const jobs = this.jobs.filter(({_id}) => _id !== job._id);
				this.onChange({updatedJobs: jobs});
			})
			.catch(this.DialogService.showError.bind(null, "delete", "job"));
	}

	public onColorChange(job) {
		this.JobsService.update(this.currentTeamspace.account, job)
			.then(() => {
				this.onChange({updatedJobs: this.jobs});
			})
			.catch(this.DialogService.showError.bind(null, "delete", "job"));
	}
}

export const JobsListComponent: ng.IComponentOptions = {
	bindings: {
		jobs: "<",
		colors: "<",
		currentTeamspace: "<",
		onChange: "&",
		ngDisabled: "<",
		messageEmptyList: "@?"
	},
	controller: JobsListController,
	controllerAs: "vm",
	templateUrl: "templates/jobs-list.html"
};

export const JobsListComponentModule = angular
	.module("3drepo")
	.component("jobsList", JobsListComponent);
