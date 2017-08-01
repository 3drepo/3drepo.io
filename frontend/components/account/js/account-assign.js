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

(function () {
	"use strict";

	angular.module("3drepo")
		.component("accountAssign", {
			restrict: "EA",
			templateUrl: "account-assign.html",
			bindings: {
				account: "="
			},
			controller: accountAssignCtrl,
			controllerAs: "vm"
		});
	

	accountAssignCtrl.$inject = ["$scope", "$window", "$http", "$q", "$location", "UtilsService", "serverConfig"];

	function accountAssignCtrl($scope, $window, $http,  $q, $location, UtilsService, serverConfig) {
		var vm = this;

		// TODO: All of this probably needs simplifying and definitely needs abstracting
		// to a service. I am not sure if the assign user logic is actually right

		/*
		 * Init
		 */	
		vm.$onInit = function() {
			vm.loadingTeamspaces = true;
			vm.modelReady = false;
			vm.teamspaces = [];
			vm.projects = {};
			vm.models = {};
			vm.selectedRole = {};

			vm.check = $location.search();
			vm.isFromUrl = vm.check.account && vm.check.project && vm.check.model;
			if (vm.isFromUrl) {
				vm.selectedIndex = 2;
			}
			vm.getTeamspaces();

			vm.teamspacePermissions = {

				teamspace_admin : "Admin",
				assign_licence	: "Assign Licence",
				revoke_licence	: "Revoke Licence",
				create_project	: "Create Project",
				create_job	: "Create Job",
				delete_job	: "Delete Job",
				assign_job : "Assign Job"

			};

			vm.projectPermissions = {

				create_model : "Create Model",
				create_federation : "Create Federation",
				admin_project : "Admin Project",
				edit_project :  "Edit Project",
				delete_project : "Delete Federation"

			};

			vm.modelRoles = ["unassigned"];
			
		};

		vm.resetState = function() {
			vm.fromURL = {};
			$location.search("account", null);
			$location.search("project", null);
			$location.search("model", null);
		};

		vm.getStateFromParams = function() {
			
			if (vm.check) {
				vm.fromURL = {};
				vm.fromURL.projectSelected = vm.check.project;
				vm.fromURL.modelSelected = vm.check.model;

				// Trigger the first watcher (teamspace)
				vm.teamspaceSelected = vm.check.account;
			}

		};

		vm.adminstrableTeamspaces = function(teamspaces) {
			var permission = "teamspace_admin";
			return teamspaces.filter(function(teamspace){
				return teamspace.permissions.indexOf(permission) !== -1;
			});
		};

		vm.adminstrableProjectTeamspaces = function(teamspaces) {
			var permission = "admin_project";
			return teamspaces.filter(function(teamspace){
				var hasAdminstrableProject = false;
				teamspace.projects.forEach(function(project){
					if (project.permissions.indexOf(permission) !== -1) {
						hasAdminstrableProject = true;
					}
				});	
				return hasAdminstrableProject;
			});
		};

		// vm.adminstrableProjects = function(projects) {

		// 	var filteredProjects = {};
		// 	var permission = "admin_project";
		// 	for (var project in projects) {

		// 		if (projects[project] && projects[project].permissions.indexOf(permission) !== -1) {
		// 			filteredProjects[project]  = projects[project];
		// 		}

		// 	}
		// 	return filteredProjects;
		// };

		// GET TEAMSPACES
		vm.getTeamspaces = function() {
			
			var url = serverConfig.apiUrl(serverConfig.GET_API, vm.account + ".json" );
			$http.get(url)
				.then(function(response) {

					vm.teamspaces = response.data.accounts;

					// .filter(function(teamspace){
					// 	// isAdmin is deprecated
					// 	return teamspace.permissions.indexOf("teamspace_admin") !== -1;
					// });

					// Append all the assignable users to a teamspace
					// var allTeamspacesPromises = [];
					// vm.teamspaces.forEach(function(teamspace) {

					// 	if (teamspace.permissions.indexOf("teamspace_admin") !== -1) {
					// 		allTeamspacesPromises.push(
					// 			$q(function(resolve, reject) {
					// 				var endpoint = teamspace.account + "/subscriptions";
					// 				var subscriptionsUrl = serverConfig.apiUrl(serverConfig.GET_API, endpoint);
					// 				$http.get(subscriptionsUrl)
					// 					.then(function(subscriptionsResponse) {
					// 						teamspace.assignUsers = subscriptionsResponse.data;
					// 						resolve(teamspace.assignUsers);
					// 					})
					// 					.catch(function(subscriptionsResponse){
					// 						console.error("error", subscriptionsResponse);
					// 						reject(subscriptionsResponse);
					// 					});
					// 			})
					// 		);
					// 	}

						
					// });

					// Wait for all the assignable users to be 
					// defined before contining
					// var completed = $q.all(allTeamspacesPromises); 
					// completed.then(function(){
						
					// });
					vm.getStateFromParams();
					vm.loadingTeamspaces = false;
					

				})
				.catch(function (err) {
					console.error(err);
				});
		};

		vm.postTeamspacePermissionChange = function(user, permission, addOrRemove) {
			
			// Add or remove a permission
			if (addOrRemove === "add") {
				user.permissions.push(permission); 
			} else {
				var index = user.permissions.indexOf(permission);
				if (index > -1) {
					user.permissions.splice(index, 1);
				}
			}

			//console.log("permissions", user.permissions);

			// Update the permissions user for the selected teamspace
			var endpoint = vm.selectedTeamspace.account + "/permissions/";
			var url = serverConfig.apiUrl(serverConfig.POST_API, endpoint);
			$http.post(url, {
				user : user.assignedUser,
				permissions: user.permissions
			}).catch(function(error){
				console.error(error);
			});
		};

		vm.teamspaceStateChange = function(user, permission) {
			var addOrRemove = vm.userHasPermissions(user, permission) === true ? "remove" : "add";
			vm.postTeamspacePermissionChange(user, permission, addOrRemove);
		};

		vm.userHasPermissions = function(user, permission) {

			var hasPermissions = false;
			vm.selectedTeamspace.assignUsers.forEach(function(permissionUser){
				if (permissionUser.user === user.assignedUser) {
					hasPermissions = user.permissions.indexOf(permission) !== -1;
				} 
			});
			
			return hasPermissions;
		};

		vm.appendUserPermissions = function(teamspace) {

			var url = serverConfig.apiUrl(serverConfig.GET_API, teamspace.account + "/permissions" );
			return $http.get(url)
				.then(function(response) {
					var permissionsUsers = response.data;
					console.log(permissionsUsers);
					teamspace.assignUsers = permissionsUsers;
				})
				.catch(function(error){
					if (error.status !== 401) {
						console.error(error);
					}
				});
			
		};

		$scope.$watch("vm.teamspaceSelected", function(){

			// Teamspace has changed so we must reset all 
			// associate model and project data 
			vm.clearModelState();
			vm.clearProjectState();
		
			if (vm.teamspaces.length) {

				// Find the matching teamspace to the one selected
				vm.selectedTeamspace = vm.teamspaces.find(function(teamspace){
					return teamspace.account === vm.teamspaceSelected;
				});

				if (vm.selectedTeamspace) {
					vm.handleTeamspaceSelected();
				}

			}
		
		});

		vm.setPermissionTemplates = function(teamspace){

			var permission = teamspace.account + "/permission-templates";
			var permissionUrl = serverConfig.apiUrl(serverConfig.GET_API, permission);
			
			return $http.get(permissionUrl)
				.then(function(response) {
					vm.modelRoles = ["unassigned"];

					response.data.forEach(function(template){
						vm.modelRoles.push(template._id);
					});
				})
				.catch(function(error){
					// We can ignore unathorised permission template attempts
					// TODO: Can't we just avoid sending the request
					if (error.status !== 401) {
						console.error(error);
					}
				});

		};

		vm.handleTeamspaceSelected = function() {
			
			vm.setProjects();

			// The property is set async so it won't be there immediately
			return $q(function(resolve, reject) {
				vm.appendUserPermissions(vm.selectedTeamspace)
					.then(function(){
						vm.setPermissionTemplates(vm.selectedTeamspace)
							.then(function() {
								if (vm.fromURL.projectSelected) {
									vm.projectSelected = vm.fromURL.projectSelected;
									delete vm.fromURL.projectSelected;
								}
								resolve(vm.selectedTeamspace.assignUsers);
							});
					})
					.catch(function(error){
						console.error(error);
						reject(error);
					});

			});		

		};

		// PROJECTS

		vm.setProjects = function() {

			vm.projects = {};
			vm.selectedTeamspace.projects.forEach(function(project){
				vm.projects[project.name] = project;
			});

		};

		vm.clearProjectState = function() {
			vm.projectSelected = undefined;
			vm.selectedProject = undefined;
		};

		$scope.$watch("vm.projectSelected", function(){
			// Find the matching project to the one selected

			if (vm.projectSelected) {
				vm.selectedProject = vm.projects[vm.projectSelected];

				var endpoint = vm.selectedTeamspace.account + "/projects/" + vm.projectSelected;
				var url = serverConfig.apiUrl(serverConfig.GET_API, endpoint);
				
				// We can use the current users object as its matches the required 
				// data structure the API expects
				$http.get(url)
					.then(function(response){
						
						vm.selectedProject.userPermissions = response.data.permissions;

						// Reset the models
						vm.clearModelState();

						if (vm.teamspaceSelected && vm.projectSelected) {

							if (vm.selectedProject && vm.selectedProject.models) {

								vm.models = vm.selectedProject.models;

								if (vm.fromURL.modelSelected && vm.fromURL.modelSelected) {
									vm.modelSelected = vm.fromURL.modelSelected;
									delete vm.fromURL.modelSelected;
								}

								
							}
							
						} 

					})
					.catch(function(error) {
						console.error("Error: ", error);
					});
		
			}
			
		});

		vm.projectStateChange = function(user, permission) {
			var hasPermission = vm.userHasProjectPermissions(user, permission);
			var addOrRemove = hasPermission === true ? "remove" : "add";
			vm.postProjectPermissionChange(user, permission, addOrRemove);
		};

		vm.userHasProjectPermissions = function(user, permission) {
			
			var hasPermission = false;
			if (vm.selectedProject && vm.selectedProject.userPermissions) {
				// Loop through all the project users and see if they have 
				// permissions. If so we can set the tick box to checked
				vm.selectedProject.userPermissions.forEach(function(permissionUser){
					if (permissionUser.user === user.assignedUser) {
						var userPermissions = permissionUser.permissions;
						if (userPermissions) {
							hasPermission = userPermissions.indexOf(permission) !== -1;
						}
					}
				});
			}
			
			//console.log(user.assignedUser, permission, hasPermission)
			return hasPermission;
		};

		vm.postProjectPermissionChange = function(user, permission, addOrRemove) {

			//Add or remove a permission
			if (addOrRemove === "add" || addOrRemove === "remove") {

				var targetUser = vm.selectedProject.userPermissions.find(function(projectUser){
					return projectUser.user === user.assignedUser;
				});

				if (addOrRemove === "add") {

					if (targetUser) {
						// If the user is already in the list we can add the persmission
						if (targetUser.permissions.indexOf(permission) === -1) {
							targetUser.permissions.push(permission);
						}
					} else {
						// Else we create a new object and add it in
						vm.selectedProject.userPermissions.push({
							user : user.assignedUser,
							permissions: [permission]
						});
					}
					
				} else if (addOrRemove === "remove") {

					// If we are removing the permission
					if (targetUser) {
						
						// If the user is already in the list we can add the persmission
						var index = targetUser.permissions.indexOf(permission);
						if (index !== -1) {
							targetUser.permissions.splice(index, 1);
						}
					} 
					
				} 

				//Update the permissions user for the selected teamspace
				var endpoint = vm.selectedTeamspace.account + "/projects/" + vm.selectedProject.name;
				var url = serverConfig.apiUrl(serverConfig.POST_API, endpoint);
				$http.put(url, {
					permissions: vm.selectedProject.userPermissions
				});

			}

		};

		// MODELS

		vm.modelsLoaded = function() {
			return vm.models && Object.keys(vm.models).length > 0;
		};

		vm.clearModelState = function() {
			vm.resetSelectedModel();
			vm.modelReady = false;
			vm.modelSelected = undefined;
		};

		vm.resetSelectedModel = function() {
			vm.selectedModel = undefined;
			vm.selectedRole = {};
		};

		$scope.$watch("vm.modelSelected", function(){
			// Find the matching project to the one selected

			vm.resetSelectedModel();

			if (vm.teamspaceSelected && vm.projectSelected && vm.modelSelected) {

				// Setup users
				vm.selectedTeamspace.assignUsers.forEach(function(permissionUser){
					if (vm.selectedRole[permissionUser.user] === undefined) {
						vm.selectedRole[permissionUser.user] = "unassigned";
					}
				});

				vm.selectedModel = vm.models.find(function(model){
					return model.model ===  vm.modelSelected;
				});

				return $q(function(resolve, reject) {

					var endpoint = vm.selectedTeamspace.account + "/" + vm.modelSelected +  "/" + "permissions";
					var url = serverConfig.apiUrl(serverConfig.POST_API, endpoint);

					$http.get(url)
						.then(function(response){
							var users = response.data;
							users.forEach(function(user){
								vm.selectedRole[user.user] = user.permission;
							});
							vm.modelReady = true;
							resolve();
						})
						.catch(function(error){
							console.error("Error", error);
							reject(error);
						});	
					
				});		
			}
			

		});

		vm.modelStateChange = function(user, role) {

			vm.selectedRole[user.assignedUser] = role;
			var permissionsToSend = [];

			for (var roleUser in vm.selectedRole) {

				var permission = vm.selectedRole[roleUser];
				var notUnassigned = permission !== "unassigned";

				if (notUnassigned) {

					permissionsToSend.push({
						user : roleUser,
						permission : permission
					});

				}
			}

			// Update the permissions user for the selected teamspace
			var endpoint = vm.selectedTeamspace.account + "/" + vm.modelSelected + "/permissions";
			var url = serverConfig.apiUrl(serverConfig.POST_API, endpoint);
			$http.post(url, permissionsToSend)
				.catch(function(error) {
					console.error("Error: ", error);
				});

		};


	}
}());
