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
			vm.projects = [];
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

			vm.modelRoles = [];
			
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

		// GET TEAMSPACES
		vm.getTeamspaces = function() {
			
			var url = serverConfig.apiUrl(serverConfig.GET_API, vm.account + ".json" );
			$http.get(url)
				.then(function(response) {

					vm.teamspaces = response.data.accounts.filter(function(teamspace){
						return teamspace.isAdmin === true;
					});

					// Append all the assignable users to a teamspace
					var allTeamspacesPromises = [];
					vm.teamspaces.forEach(function(teamspace) {
						allTeamspacesPromises.push(
							$q(function(resolve, reject) {
								var endpoint = teamspace.account + "/subscriptions";
								var url = serverConfig.apiUrl(serverConfig.GET_API, endpoint);
								$http.get(url)
									.then(function(response) {
										teamspace.assignUsers = response.data;
										resolve(teamspace.assignUsers);
									})
									.catch(function(response){
										console.error("error", response);
										reject(response);
									});
							})
						);
					});

					// Wait for all the assignable users to be 
					// defined before contining
					var completed = $q.all(allTeamspacesPromises); 
					completed.then(function(){
						vm.getStateFromParams();
						vm.loadingTeamspaces = false;
					});
					

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
			vm.selectedTeamspace.assignUsers.forEach(function(iUser){
				if (iUser.assignedUser === user.assignedUser) {
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
					var found;
					teamspace.assignUsers.forEach(function(user){
						found = false;
						permissionsUsers.forEach(function(permissionsUser) {
							if (permissionsUser.user === user.assignedUser) {
								user.permissions = permissionsUser.permissions;
								found = true;
							} 
						});
						if (!found) {
							user.permissions = [];
						}
					});
				})
				.catch(function(error){
					console.error(error);
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

		vm.setPermissionTemplates = function(teamspace){

			var permission = teamspace.account + "/permission-templates";
			var permissionUrl = serverConfig.apiUrl(serverConfig.GET_API, permission);
			
			return $http.get(permissionUrl).then(function(response) {
				vm.modelRoles = [];
				response.data.forEach(function(template){
					vm.modelRoles.push(template._id);
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

				vm.selectedModel = vm.models.find(function(model){
					return model.model ===  vm.modelSelected;
				});
				
				return $q(function(resolve, reject) {

					var endpoint = vm.selectedTeamspace.account + "/" + vm.modelSelected +  "/" + "permissions";
					var url = serverConfig.apiUrl(serverConfig.POST_API, endpoint);

					$http.get(url)
						.then(function(response){
							var users = response.data;

							// Set the list of assignable users for the model
							vm.selectedModel.currentUsers = users;

							// Set the radio button for the associated users
							vm.selectedModel.currentUsers.forEach(function(user) {
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

			var userHasPerviousPermissions = false;
			// Loop through the list of available users and find the selected user
			vm.selectedModel.currentUsers.forEach(function(assignableUser) {
				if (user.assignedUser === assignableUser.user) {
					// Change the users role to the newly selected permission
					assignableUser.permission = role;
					userHasPerviousPermissions = true;
				}
			});

			// If the user isn't in the assignableUser list add them
			if (!userHasPerviousPermissions) {
				vm.selectedModel.currentUsers.push({
					user: user.assignedUser,
					permission: role
				});
			}
			
			// Send the update to the server

			// Update the permissions user for the selected teamspace
			// POST /{accountName}/{modelID}/permissions
			var endpoint = vm.selectedTeamspace.account + "/" + vm.modelSelected + "/permissions";
			var url = serverConfig.apiUrl(serverConfig.POST_API, endpoint);
			
			// We can use the current users object as its matches the required 
			// data structure the API expects
			$http.post(url, vm.selectedModel.currentUsers)
				.then(function(response){
					console.log(response);
				})
				.catch(function(error) {
					console.error("Error: ", error);
				});

		};

	}
}());
