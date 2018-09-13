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

class NewJobFormController implements ng.IController {
	public static $inject: string[] = [
		"JobsService",
		"DialogService"
	];

	private newJob;
	private onSave;
	private currentTeamspace;

	constructor(
		private JobsService: any,
		private DialogService: any
	) {}

	public $onInit(): void {
		this.newJob = {};
	}

	public addJob(): void {
		this.JobsService.create(this.currentTeamspace, this.newJob)
			.then(({data: job}) => {
				if (this.onSave) {
					this.onSave({newJob: job});
				}
			})
			.catch(this.DialogService.showError.bind(null, "create", "job"));
	}
}

export const NewJobFormComponent: ng.IComponentOptions = {
	bindings: {
		currentTeamspace: "<",
		jobs: "<",
		colors: "<",
		onSave: "&",
		title: "@"
	},
	controller: NewJobFormController,
	controllerAs: "vm",
	templateUrl: "templates/new-job-form.html"
};

export const NewJobFormComponentModule = angular
	.module("3drepo")
	.component("newJobForm", NewJobFormComponent);
