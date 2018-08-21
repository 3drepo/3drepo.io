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
import {first, get} from "lodash";

class ProjectsPermissionsController implements ng.IController {
	public static $inject: string[] = [];

	private projects;
	private currentProject;

	public $onInit(): void {}

	public $onChanges({projects}: {projects?: any}): void {
		if (projects.currentValue && !this.currentProject) {
			this.currentProject = get(projects.currentValue, "[0].name", null);
			this.onProjectChange();
		}
	}

	public onProjectChange(): void {}

	public goToModelsPermissions(): void {}
}

export const ProjectsPermissionsComponent: ng.IComponentOptions = {
	bindings: {
		currentTeamspace: "<",
		members: "<",
		projects: "<",
		onPermissionsChange: "&"
	},
	controller: ProjectsPermissionsController,
	controllerAs: "vm",
	templateUrl: "templates/projects-permissions.html"
};

export const ProjectsPermissionsComponentModule = angular
	.module("3drepo")
	.component("projectsPermissions", ProjectsPermissionsComponent);
