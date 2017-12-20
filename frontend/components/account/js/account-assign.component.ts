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

class AccountAssignController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$window",
		"$q",
		"$mdDialog",
		"$location",

		"APIService",
	];

	private account;
	private teamspaces;
	private selectedTeamspace;
	private projectSelected;
	private selectedProject;
	private projects;
	private modelReady;
	private teamspaceSelected;
	private modelSelected;
	private selectedModel;
	private models;
	private selectedRole;
	private loadingTeamspaces;
	private fromURL;
	private check;
	private teamspaceAdmin;
	private modelRoles;
	private isFromUrl;
	private projectsLoading;
	private selectedIndex;
	private teamspacePermissions;
	private projectPermissions;

	constructor(
		private $scope: ng.IScope,
		private $window: ng.IWindowService,
		private $q: ng.IQService,
		private $mdDialog: any,
		private $location: ng.ILocationService,

		private APIService,
	) {}

	public $onInit() {

		this.teamspaceAdmin = "teamspace_admin";
		this.loadingTeamspaces = true;
		this.modelReady = false;
		this.teamspaces = [];
		this.projects = {};
		this.models = [];
		this.selectedRole = {};

		this.check = this.$location.search();
		this.isFromUrl = this.check.account && this.check.project && this.check.model;
		if (this.isFromUrl) {
			this.selectedIndex = 2;
		}
		this.getTeamspaces();

		this.teamspacePermissions = {

			teamspace_admin : "Admin",
			// assign_licence	: "Assign Licence",
			// revoke_licence	: "Revoke Licence",
			// create_project	: "Create Project",
			// create_job	: "Create Job",
			// delete_job	: "Delete Job",
			// assign_job : "Assign Job"

		};

		this.projectPermissions = {
			// create_model : "Create Model",
			// create_federation : "Create Federation",
			// delete_project : "Delete Project",
			// edit_project :  "Edit Project",
			admin_project : "Admin Project",
		};

		this.modelRoles = ["unassigned"];

		this.watchers();

	}

	public watchers() {

		this.$scope.$watch("vm.teamspaceSelected", () => {

			// Teamspace has changed so we must reset all
			// associate model and project data
			this.clearModelState();
			this.clearProjectState();

			if (this.teamspaces.length) {

				// Find the matching teamspace to the one selected
				this.selectedTeamspace = this.teamspaces.find((teamspace) => {
					return teamspace.account === this.teamspaceSelected;
				});

				if (this.selectedTeamspace) {
					this.handleTeamspaceSelected()
						.then((permissions) => {
							this.selectedTeamspace.teamspacePermissions = permissions;
						})
						.catch((error) => {
							console.error(error);
						});
				}

			}

		});

		this.$scope.$watch("vm.projectSelected", () => {
			// Find the matching project to the one selected

			if (this.projectSelected) {
				this.selectedProject = this.projects[this.projectSelected];

				const endpoint = this.selectedTeamspace.account +
								"/projects/" + this.projectSelected;

				// We can use the current users object as its matches the required
				// data structure the API expects
				this.APIService.get(endpoint)
					.then((response) => { this.handleProjectSelected(response); })
					.catch((error) => {
						console.error(error);
						const title = "Issue Getting Project Permissions";
						this.showError(title, error);
					});

			}

		});

		this.$scope.$watch("vm.modelSelected", () => {
			// Find the matching project to the one selected
			this.modelReady = false;
			this.resetSelectedModel();

			if (this.teamspaceSelected && this.projectSelected && this.modelSelected) {

				this.selectedModel = this.models.find((model) => {
					return model.model ===  this.modelSelected;
				});

				return this.setPermissionTemplates(this.teamspaceSelected, this.modelSelected)
					.then(() => {
						return this.handleSetPermissionTemplate();
					});

			}

		});

	}

	public handleSetPermissionTemplate() {
		return this.$q((resolve, reject) => {

			const endpoint = this.selectedTeamspace.account + "/" +
							this.modelSelected +  "/permissions";

			this.APIService.get(endpoint)
				.then((response) => {

					const users = response.data;

					// Add the teamspace admin if they don't appear in the list
					if (this.selectedTeamspace.account === this.account && users.length === 0) {
						users.push({
							permissions: ["admin"],
							user : this.account,
						});
					}

					users.forEach((user) => {

						// If its the teamspace then we can disable
						// and assign admin role
						if (user.user === this.account || (this.isTeamspaceAdmin(user) || this.isProjectAdmin(user)) ) {
							this.selectedRole[user.user] = "admin";
						} else {
							this.selectedRole[user.user] = user.permission || "unassigned";
						}

					});
					this.modelReady = true;

					resolve();
				})
				.catch((error) => {
					const title = "Issue Retrieving Model Permissions";
					this.showError(title, error);

					reject(error);
				});

		});
	}

	public resetState() {
		this.fromURL = {};
		this.$location.search("account", null);
		this.$location.search("project", null);
		this.$location.search("model", null);
		this.checkIfAdminChanged();
	}

	public getStateFromParams() {

		if (this.check) {
			this.fromURL = {};
			this.fromURL.projectSelected = this.check.project;
			this.fromURL.modelSelected = this.check.model;

			// Trigger the first watcher (teamspace)
			this.teamspaceSelected = this.check.account;
		}

	}

	// TEAMSPACES

	public teamspacesToAssign() {
		return this.selectedTeamspace &&
				this.selectedTeamspace.teamspacePermissions &&
				(this.selectedTeamspace.teamspacePermissions.length === 0 ||
					(this.selectedTeamspace.teamspacePermissions.length === 1 &&
					this.selectedTeamspace.teamspacePermissions[0].user === this.account)
				);
	}

	public teamspaceAdminDisabled(user, permission) {
		return (permission !== this.teamspaceAdmin && this.userHasPermissions(user, this.teamspaceAdmin)) ||
				this.selectedTeamspace.account === user.user;
	}

	public teamspaceAdminChecked(user, permission) {
		return this.userHasPermissions(user, this.teamspaceAdmin) ||
				this.userHasPermissions(user, permission);
	}

	public adminstrableTeamspaces(teamspaces) {
		const permission = this.teamspaceAdmin;
		return teamspaces.filter((teamspace) => {
			return teamspace.permissions.indexOf(permission) !== -1;
		});
	}

	public adminstrableProjectTeamspaces(teamspaces) {
		const permission = "admin_project";
		return teamspaces.filter((teamspace) => {
			let hasAdminstrableProject = false;
			teamspace.projects.forEach((project) => {
				if (project.permissions.indexOf(permission) !== -1) {
					hasAdminstrableProject = true;
				}
			});
			return hasAdminstrableProject;
		});
	}

	public getTeamspaces() {

		const accountUrl = this.account + ".json";

		this.APIService.get(accountUrl)
			.then((response) => {
				this.teamspaces = response.data.accounts;
				this.getStateFromParams();
				this.loadingTeamspaces = false;

			})
			.catch((error) => {
				const title = "Issue Getting Teamspaces";
				this.showError(title, error);
			});
	}

	public postTeamspacePermissionChange(user, permission, addOrRemove) {

		if (user) {
			// Add or remove a permission
			if (addOrRemove === "add") {
				user.permissions.push(permission);
			} else {
				const index = user.permissions.indexOf(permission);
				if (index > -1) {
					user.permissions.splice(index, 1);
				}
			}

			// Update the permissions user for the selected teamspace
			const url = this.selectedTeamspace.account + "/permissions/";

			const permissionData = {
				user : user.user,
				permissions: user.permissions,
			};

			// Move them to unassigned role if we remove there admin privilidges
			if (permission === "teamspace_admin" && this.modelRoles && this.modelRoles.length > 1) {
				this.selectedRole[user.user] = "unassigned";
			}

			this.checkIfAdminChanged();

			this.APIService.post(url, permissionData)
				.catch((error) => {
					const title = "Issue Updating Teamspace Permissions";
					this.showError(title, error);
				});

		} else {
			console.error("User data is corrupt: ", user, permission, addOrRemove);
		}

	}

	public teamspaceStateChange(user, permission) {
		const addOrRemove = this.userHasPermissions(user, permission) === true ? "remove" : "add";
		this.postTeamspacePermissionChange(user, permission, addOrRemove);
	}

	public userHasPermissions(user, permission) {
		let hasPermissions = false;
		if (this.selectedTeamspace.teamspacePermissions) {
			this.selectedTeamspace.teamspacePermissions.forEach((permissionUser) => {
				if (permissionUser.user === user.user) {
					hasPermissions = permissionUser.permissions.indexOf(permission) !== -1;
				}
			});
		}

		return hasPermissions;
	}

	public appendTeamspacePermissions(teamspace) {

		const endpoint = teamspace.account + "/permissions";
		return this.APIService.get(endpoint)
			.then((response) => {
				const permissionsUsers = response.data;
				teamspace.teamspacePermissions = permissionsUsers;
			})
			.catch((error) => {
				if (error.status !== 401) {
					const title = "Issue Populating Teamspace Users";
					this.showError(title, error);
					console.error(error);
				}
			});

	}

	public setPermissionTemplates(teamspace, model) {

		let permissionUrl = teamspace.account + "/permission-templates";
		if (model) {
			permissionUrl = teamspace.account + "/" + model + "/permission-templates" ;
		}

		return this.APIService.get(permissionUrl)
			.then((response) => {
				this.modelRoles = ["unassigned"];

				response.data.forEach((template) => {
					this.modelRoles.push(template._id);
				});
			})
			.catch((error) => {
				// We can ignore unathorised permission template attempts
				// TODO: Can't we just avoid sending the request
				if (error.status !== 401) {
					const title = "Issue Getting Permission Templates";
					this.showError(title, error);
				}
			});

	}

	public handleTeamspaceSelected() {

		this.setProjects();

		// The property is set async so it won't be there immediately
		return this.$q((resolve, reject) => {
			this.appendTeamspacePermissions(this.selectedTeamspace)
				.then(() => {
					this.setPermissionTemplates(this.selectedTeamspace,  this.modelSelected)
						.then(() => {
							if (this.fromURL.projectSelected) {
								this.projectSelected = this.fromURL.projectSelected;
								delete this.fromURL.projectSelected;
							}
							resolve(this.selectedTeamspace.teamspacePermissions);
						});
				})
				.catch((error) => {
					const title = "Issue Populating Teamspace Permissions";
					this.showError(title, error);
					reject(error);
				});

		});

	}

	// PROJECTS

	public projectsToAssign() {
		return this.selectedProject &&
				this.selectedProject.userPermissions &&
				this.selectedProject.userPermissions.length === 0;
	}

	public adminChecked(user, permission) {
		return this.userHasProjectPermissions(user, permission) ||
				this.userHasProjectPermissions(user, "admin_project") ||
				this.userHasPermissions(user, "teamspace_admin");
	}

	public adminDisabled(user, permission) {
		return (permission !== "admin_project" &&
			this.userHasProjectPermissions(user, "admin_project")) ||
			this.userHasPermissions(user, "teamspace_admin");
	}

	public setProjects() {

		this.projects = {};
		this.selectedTeamspace.projects.forEach((project) => {
			this.projects[project.name] = project;
		});

	}

	public clearProjectState() {
		this.projectSelected = undefined;
		this.selectedProject = undefined;
	}

	public handleProjectSelected(response) {

		this.selectedProject.userPermissions = response.data.permissions;

		// We should put the teamspace owner in the list if they
		// aren't in it already
		if (this.selectedProject.userPermissions.length === 0
			&& this.selectedTeamspace.account === this.account) {

			this.selectedProject.userPermissions.push({
				permissions: ["admin_project"],
				user : this.account,
			});

		}

		// Reset the models
		this.clearModelState();
		const projectSelected = this.teamspaceSelected && this.projectSelected;
		const projectReady = this.selectedProject && this.selectedProject.models;

		if (projectSelected && projectReady) {

			this.models = this.selectedProject.models.sort(this.sortModels);

			if (this.fromURL.modelSelected && this.fromURL.modelSelected) {
				this.modelSelected = this.fromURL.modelSelected;
				delete this.fromURL.modelSelected;
				this.fromURL = {};
				this.isFromUrl = false;
			}

		}

	}

	public projectStateChange(user, permission) {
		const hasPermission = this.userHasProjectPermissions(user, permission);
		const addOrRemove = hasPermission === true ? "remove" : "add";
		this.postProjectPermissionChange(user, permission, addOrRemove);
	}

	public userHasProjectPermissions(user, permission) {

		let hasPermission = false;

		if (this.selectedProject && this.selectedProject.userPermissions) {
			// Loop through all the project users and see if they have
			// permissions. If so we can set the tick box to checked

			this.selectedProject.userPermissions.forEach((permissionUser) => {
				if (permissionUser.user === user.user) {
					const userPermissions = permissionUser.permissions;
					if (userPermissions) {
						hasPermission = userPermissions.indexOf(permission) !== -1;
					}
				}
			});
		}

		return hasPermission;
	}

	public postProjectPermissionChange(user, permission, addOrRemove) {

		// Add or remove a permission
		if (addOrRemove === "add" || addOrRemove === "remove") {

			const targetUser = this.selectedProject.userPermissions.find((projectUser) => {
				return projectUser.user === user.user;
			});

			if (addOrRemove === "add") {

				if (targetUser) {
					// If the user is already in the list we can add the persmission
					if (targetUser.permissions.indexOf(permission) === -1) {
						targetUser.permissions.push(permission);
					}
				} else {
					// Else we create a new object and add it in
					this.selectedProject.userPermissions.push({
						user : user.user,
						permissions: [permission],
					});
				}

			} else if (addOrRemove === "remove") {

				// If we are removing the permission
				if (targetUser) {

					// If the user is already in the list we can add the persmission
					const index = targetUser.permissions.indexOf(permission);
					if (index !== -1) {
						targetUser.permissions.splice(index, 1);
					}

					// Move them to unassigned role if we remove there admin privilidges
					if (permission === "admin_project" && this.modelRoles && this.modelRoles.length > 1) {
						this.selectedRole[user.user] = "unassigned";
					}

				}

			}

			// Update the permissions user for the selected teamspace
			const endpoint = this.selectedTeamspace.account +
							"/projects/" + this.selectedProject.name;

			this.APIService.put(endpoint, {
				permissions: this.selectedProject.userPermissions,
			}).catch((error) => {
				const title = "Issue Updating Project Permissions";
				this.showError(title, error);
			});

			// Check if we removed or added an admins
			this.checkIfAdminChanged();

		}

	}

	// MODELS

	public isProjectAdmin(user) {

		let userObj;
		if (typeof(user) === "string") {
			userObj = {user};
		} else {
			userObj = user;
		}

		if (user.user === this.selectedTeamspace.account) {
			return true;
		}

		return this.userHasProjectPermissions(userObj, "admin_project");

	}

	public isTeamspaceAdmin(user) {

		let userObj;
		if (typeof(user) === "string") {
			userObj = {user};
		} else {
			userObj = user;
		}

		if (user.user === this.selectedTeamspace.account) {
			return true;
		}

		return this.userHasPermissions(userObj, "teamspace_admin");

	}

	public modelUsersToAssign() {
		return this.modelSelected && this.selectedRole && Object.keys(this.selectedRole).length === 0;
	}

	public modelUserValid(user) {
		return this.selectedTeamspace.account === user || this.account === user;
	}

	public modelDataReady() {
		return (!this.isFromUrl && !this.loadingTeamspaces && !this.projectsLoading) ||
				(this.isFromUrl && this.modelReady);
	}

	public modelsEmpty() {
		return Object.keys(this.models).length === 0;
	}

	public modelsLoaded() {
		return this.projectSelected && this.models;
	}

	public clearModelState() {
		this.resetSelectedModel();
		this.modelReady = false;
		this.modelSelected = undefined;
	}

	public resetSelectedModel() {
		this.selectedModel = undefined;
		this.selectedRole = {};
	}

	public checkIfAdminChanged() {

		if (this.selectedRole) {
			Object.keys(this.selectedRole).forEach((user) => {
				if (user && (this.isTeamspaceAdmin(user) || this.isProjectAdmin(user)) ) {
					this.selectedRole[user] = "admin";
				}
			});
		}
	}

	public sortModels(a, b) {

		if (a.name && b.name) {
			const nameA = a.name.toUpperCase(); // ignore upper and lowercase
			const nameB = b.name.toUpperCase(); // ignore upper and lowercase
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
		}

		// names must be equal
		return 0;
	}

	public formatModelName(model) {
		return (model.federate === true) ?
			model.name + " (Federation)" :
			model.name + " (Model)";
	}

	public modelStateChange(user, role) {

		// We don't want people to be able to set admins
		// as it should come from a higher priority
		const upperAdmin = this.isTeamspaceAdmin(user) || this.isProjectAdmin(user);
		if (role === "admin" || upperAdmin) {
			return;
		}

		const permissionsToSend = [];

		const validInput = user && role;
		if (validInput) {
			this.selectedRole[user] = role;
		}

		for (const roleUser in this.selectedRole) {
			if (roleUser && this.selectedRole.hasOwnProperty(roleUser)) {

				const permission = this.selectedRole[roleUser];
				const notUnassigned = permission !== "unassigned";

				if (notUnassigned) {
					permissionsToSend.push({
						user : roleUser,
						permission,
					});

				}

			}
		}

		// TODO: Check if the model is a federation and if so, check that they have some
		// permission on all submodel

		const permissionlessModels = [];

		if (this.selectedModel.federate && this.selectedModel.subModels.length > 0) {
			this.selectedModel.subModels.forEach((subModel) => {

				Object.keys(this.selectedProject.models).forEach((modelId) => {
					const projectModel = this.selectedProject.models[modelId];

					if (subModel.model === projectModel.model) {
						permissionlessModels.push(projectModel);
					}

				});
			});
		}

		if (permissionlessModels.length && role !== "unassigned") {

			let content = "Just to let you know, the assigned user will need permissions on submodels also to see them." +
			"<br><br> These are the models in question: <br><br>";
			permissionlessModels.forEach((model, i) => {
				content += " <strong>" + model.name + "</strong>";
				if (i !== permissionlessModels.length) {
					content += ",";
				}

				if ((i + 1) % 4 === 0) {
					content += "<br><br>";
				}
			});

			this.$mdDialog.show(
				this.$mdDialog.alert()
					.clickOutsideToClose(true)
					.title("Reminder about Federation Permissions")
					.htmlContent(content)
					.ariaLabel("Reminder about Federations")
					.ok("OK"),
			);
		}

		// Update the permissions user for the selected teamspace
		const endpoint = this.selectedTeamspace.account + "/"
						+ this.modelSelected + "/permissions";

		this.APIService.post(endpoint, permissionsToSend)
			.catch((error) => {
				const title = "Model Permission Assignment Error";
				this.showError(title, error);
			});

	}

	public showError(title, error) {

		if (error && error.data) {
			// Error for developer
			console.error("Error", error);

			// Error for user
			const conf = "Something went wrong: " +
			"<br><br> <code>Error - " + error.data.message + " (Status Code: " + error.status + ")" +
			"</code> <br><br> <md-container>";

			this.$mdDialog.show(
				this.$mdDialog.alert()
					.clickOutsideToClose(true)
					.title(title)
					.htmlContent(conf)
					.ariaLabel(title)
					.ok("OK"),
			);
		} else {
			console.error("Error, but no error response: ", error);
		}

	}

}

export const AccountAssignComponent: ng.IComponentOptions = {
	bindings: {
		account: "=",
	},
	controller: AccountAssignController,
	controllerAs: "vm",
	templateUrl: "templates/account-assign.html",
};

export const AccountAssignComponentModule = angular
	.module("3drepo")
	.component("accountAssign", AccountAssignComponent);
