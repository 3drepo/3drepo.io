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
import {first, get, isUndefined, isNull, identity} from "lodash";
import {PROJECT_ROLES_TYPES, PROJECT_ROLES_LIST} from "../../../constants/project-permissions";
import {MODEL_ROLES_TYPES, MODEL_ROLES_LIST} from "../../../constants/model-permissions";

const UNDEFINED_PERMISSIONS = "undefined";

const PERMISSIONS_VIEWS = {
	PROJECTS: 0,
	MODELS: 1
};

class ProjectsPermissionsController implements ng.IController {
	public static $inject: string[] = [
		"ProjectsService",
		"DialogService",
		"$q",
		"$state",
		"ModelsService"
	];

	private PERMISSIONS_VIEWS = PERMISSIONS_VIEWS;
	private PROJECT_ROLES_LIST = PROJECT_ROLES_LIST;
	private MODEL_ROLES_LIST = MODEL_ROLES_LIST;

	private projects;
	private currentProject;
	private currentTeamspace;
	private members;
	private permissions;
	private models;
	private currentView;
	private assignedModelPermissions;
	private assignedProjectPermissions;
	private selectedModels;
	private projectRequestCanceler;

	constructor(
		private ProjectsService: any,
		private DialogService: any,
		private $q: any,
		private $state: any,
		private ModelsService: any
	) {}

	public $onInit(): void {
		const {project, view} = this.$state.params;

		if (project) {
			this.currentProject = project;
			this.currentView = parseInt(view, 10);
		}
	}

	public $onChanges(
		{projects, members, currentTeamspace}: {projects?: any, members?: any, currentTeamspace?: any}
	): void {
		const membersChanged = members && members.currentValue;
		const teamspaceChanged = currentTeamspace && currentTeamspace.currentValue;

		if (teamspaceChanged) {
			this.currentProject = null;
			this.permissions = [];
			this.models = [];

			if (this.projectRequestCanceler) {
				this.projectRequestCanceler.resolve();
			}
		}

		if (membersChanged && this.currentProject) {
			this.onProjectChange();
		}
	}

	public onProjectChange(): void {
		if (this.projectRequestCanceler) {
			this.projectRequestCanceler.resolve();
		}

		this.projectRequestCanceler = this.$q.defer();
		this.$state.go(this.$state.$current.name, {project: this.currentProject}, {notify: false});

		this.ProjectsService.getProject(this.currentTeamspace.account, this.currentProject, {
			timeout: this.projectRequestCanceler.promise
		}).then(({data: project}: {data: {permissions?: object[], models?: object[]}}) => {
				const projectData = this.projects.find(({name}) => name === this.currentProject);
				this.models = get(projectData, "models", []);
				this.selectedModels = [];
				this.assignedProjectPermissions = this.getExtendedProjectPermissions(project.permissions);
				this.assignedModelPermissions = this.getExtendedModelPermissions();
			}).catch(identity)
			.finally(() => {
				this.projectRequestCanceler = null;
			});
	}

	/**
	 * Bind project permissions with members data
	 * @param projectPermissions
	 */
	public getExtendedProjectPermissions = (projectPermissions) => {
		return projectPermissions
			.map(({user, permissions = [], isSelected = false}: {user: string, permissions: string[], isSelected?: boolean}) => {
				const memberData = this.members.find((member) => member.user === user) || {};
				let projectPermissionsKey = PROJECT_ROLES_TYPES.UNASSIGNED;
				if (memberData.isAdmin) {
					projectPermissionsKey = PROJECT_ROLES_TYPES.ADMINSTRATOR;
				} else {
					projectPermissionsKey = first(permissions) || PROJECT_ROLES_TYPES.UNASSIGNED;
				}

				return {
					...memberData,
					permissions,
					key: projectPermissionsKey,
					isSelected
				};
			});
	}

	/**
	 * Bind model permissions with members data
	 * @param modelPermissions
	 */
	public getExtendedModelPermissions = (modelPermissions?) => {
		return this.members.map((memberData) => {
			const memberModelPermissions = (modelPermissions || []).find(({user}) => user === memberData.user);
			let modelPermissionsKey = MODEL_ROLES_TYPES.UNASSIGNED;

			if (memberData.isAdmin) {
				modelPermissionsKey = MODEL_ROLES_TYPES.ADMINSTRATOR;
			} else {
				modelPermissionsKey = memberModelPermissions ?
					memberModelPermissions.permission || MODEL_ROLES_TYPES.UNASSIGNED :
					UNDEFINED_PERMISSIONS;
			}

			return {
				...memberData,
				permissions: get(memberModelPermissions, "permissions", []),
				key: modelPermissionsKey,
				isDisabled: !modelPermissions,
				isSelected: get(memberModelPermissions, "isSelected", false)
			};
		});
	}

	/**
	 * Send updated data to the server
	 * @param updatedPermissions
	 */
	public onPermissionsChange(updatedPermissions: any[]): void {
		if (this.currentView === PERMISSIONS_VIEWS.PROJECTS) {
			this.onProjectPermissionsChange(updatedPermissions);
		} else {
			this.onModelPermissionsChange(updatedPermissions);
		}
	}

	public onProjectPermissionsChange(updatedPermissions: any[]): void {
		const permissionsToSave = this.assignedProjectPermissions
			.map(({user, permissions}: {user: string, permissions: string}) => {
				const newPermissions = updatedPermissions.find((permission) => permission.user === user);

				if (newPermissions) {
					return {
						user,
						isSelected: newPermissions.isSelected,
						permissions: newPermissions.key ? [newPermissions.key] : []
					};
				}

				return {user, permissions};
			});

		const updateData = {name: this.currentProject, permissions: permissionsToSave};
		this.ProjectsService.updateProject(this.currentTeamspace.account, updateData)
			.then(() => {
				this.assignedProjectPermissions = [...this.getExtendedProjectPermissions(permissionsToSave)];
			}).catch(this.DialogService.showError.bind(null, "update", "project permissions"));
	}

	public onModelPermissionsChange(updatedPermissions: any[]): void {
		if (this.selectedModels.length) {
			const permissionsList = this.selectedModels.map((selectedModel) => {
				const newPermissions = selectedModel.permissions.map((currentPermission) => {
					const memberPermission = updatedPermissions.find(({user}) => user === currentPermission.user);

					if (memberPermission) {
						return {
							user: currentPermission.user,
							isSelected: memberPermission.isSelected,
							permission: memberPermission.key
						};
					}

					return {
						user: currentPermission.user,
						permission: currentPermission.permission
					};
				}).filter(({permission}) => permission);

				return {
					model: selectedModel.model,
					permissions: newPermissions
				};
			});

			this.ModelsService.updateMulitpleModelsPermissions(this.currentTeamspace.account, permissionsList)
				.then(() => {
					this.selectedModels = permissionsList.map(({permissions}, index) => {
						const {model, federate, name} = this.selectedModels[index];
						return {model, permissions, federate, name};
					});
					const permissionsToShow = this.selectedModels.length === 1 ?
						this.selectedModels[0].permissions :
						updatedPermissions.map(({user, isSelected}) => ({user, isSelected, permission: UNDEFINED_PERMISSIONS}));

					this.assignedModelPermissions = [...this.getExtendedModelPermissions(permissionsToShow)];
				}).catch(this.DialogService.showError.bind(null, "update", "model/federation permissions"));
		}
	}

	public onModelSelectionChange(selectedModels: any[]): void {
		if (selectedModels.length) {
			const requiredModels = selectedModels.map(({model}) => model);
			this.ModelsService
				.getMulitpleModelsPermissions(this.currentTeamspace.account, requiredModels)
				.then(({data: modelsWithPermissions}) => {
					this.selectedModels = modelsWithPermissions;
					const permissionsToShow = this.selectedModels.length === 1 ? this.selectedModels[0].permissions : [];
					this.assignedModelPermissions = this.getExtendedModelPermissions(permissionsToShow);
				});
		} else {
			this.selectedModels = [];
			this.assignedModelPermissions = this.getExtendedModelPermissions();
		}
	}

	public toggleView(): void {
		const nextView = this.currentView === PERMISSIONS_VIEWS.MODELS ?
			PERMISSIONS_VIEWS.PROJECTS :
			PERMISSIONS_VIEWS.MODELS;

		this.$state.go(this.$state.$current.name, { view: nextView}, {notify: false});
		this.currentView = nextView;
	}
}

export const ProjectsPermissionsComponent: ng.IComponentOptions = {
	bindings: {
		currentTeamspace: "<",
		members: "<",
		projects: "<"
	},
	controller: ProjectsPermissionsController,
	controllerAs: "vm",
	templateUrl: "templates/projects-permissions.html"
};

export const ProjectsPermissionsComponentModule = angular
	.module("3drepo")
	.component("projectsPermissions", ProjectsPermissionsComponent);
