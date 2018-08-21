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
import {PROJECT_ROLES_TYPES} from "../../../constants/project-permissions";

class ProjectsPermissionsController implements ng.IController {
	public static $inject: string[] = [
		"ProjectsService"
	];

	private projects: object[];
	private currentProject;
	private currentTeamspace;
	private members;
	private permissions;
	private models;

	constructor(private ProjectsService: any) {}

	public $onInit(): void {}

	public $onChanges({projects}: {projects?: any}): void {
		if (projects.currentValue && !this.currentProject) {
			this.currentProject = get(projects.currentValue, "[0].name", null);
			this.onProjectChange();
		}
	}

	public onProjectChange(): void {
		this.ProjectsService.getProject(this.currentTeamspace.account, this.currentProject)
			.then(({data: project}: {data: {permissions?: object[], models?: object[]}}) => {
				this.permissions = project.permissions.map(({user, permissions = []}: {user: string, permissions: string[]}) => {
					const memberData = this.members.find((member) => member.user === user) || {};
					const projectPermissionsKey = memberData.isAdmin ?
						PROJECT_ROLES_TYPES.ADMINSTRATOR :
						PROJECT_ROLES_TYPES.UNASSIGNED;

					return {
						...memberData,
						key: projectPermissionsKey
					};
				});
				this.models = project.models;
			});
	}

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
