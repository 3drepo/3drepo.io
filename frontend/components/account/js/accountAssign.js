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
		.directive("accountAssign", accountAssign);

	function accountAssign() {
		return {
			restrict: 'EA',
			templateUrl: 'accountAssign.html',
			scope: {
				account: "=",
			},
			controller: accountAssignCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	accountAssignCtrl.$inject = ["$scope", "$window", "$http", "$q", "$location", "UtilsService", "serverConfig"];

	function accountAssignCtrl($scope, $window, $http,  $q, $location, UtilsService, serverConfig) {
		var vm = this,
			promise,
			check

		/*
		 * Init
		 */	
		vm.$onInit = function() {
			vm.loading = true;
			vm.modelReady = false;
			vm.teamspaces = [];
			vm.projects = [];
			vm.models = {};
			vm.selectedRole = {};

			check = $location.search();
			vm.isFromUrl = check.account && check.project && check.model;
			if (vm.isFromUrl) {
				vm.selectedIndex = 2;
			}
			vm.getTeamspaces();

			vm.teamspacePermissions = {

				teamspace_admin : "Admin",
				assign_licence	: "Assign Licence",
				revoke_licence	: "Assign Licence",
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
			
		}

		var getStateFromParams = function() {
			
			if (check) {
				vm.fromURL = {}
				vm.fromURL.projectSelected = check.project;
				vm.fromURL.modelSelected = check.model;

				// Trigger the first watcher (teamspace)
				vm.teamspaceSelected = check.account;
			}
		}

		// GET TEAMSPACES
		vm.getTeamspaces = function() {
			
			var url = serverConfig.apiUrl(serverConfig.GET_API, vm.account + ".json" );
			$http.get(url)
			.then(function(response) {

				vm.teamspaces = response.data.accounts.filter(function(teamspace){
					return teamspace.isAdmin === true;
				});

				vm.teamspaces.forEach(getUsers);
				getStateFromParams();
				vm.loading = false;

			})
			.catch(function (err) {
				console.trace(err);
			});
		}

		// GET PROJECTS

		vm.setProjects = function(account) {
			var url = serverConfig.apiUrl(serverConfig.GET_API, account + "/projects");
			return $http.get(url)
						.then(
							function(response) {
								vm.projects = response.data;
								vm.projectsLoading = false;
							},
							function (err) {
								console.trace(err);
							}
						);
		}
	

		vm.postPermissionChange = function(user, permission, addOrRemove) {
			
			// Add or remove a permission
			if (addOrRemove === "add") {
				user.permissions.push(permission); 
			} else {
				var index = user.permissions.indexOf(permission);
				if (index > -1) user.permissions.splice(index, 1);
			}

			// Update the permissions user for the selected teamspace
			var endpoint = vm.selectedTeamspace.account + "/permissions/" + user.assignedUser;
			var url = serverConfig.apiUrl(serverConfig.POST_API, endpoint);
			$http.put(url, {
				permissions: user.permissions
			})
		}

		vm.stateChange = function(user, permission) {
			var addOrRemove = vm.userHasPermissions(user, permission) === true ? "remove" : "add";
			vm.postPermissionChange(user, permission, addOrRemove)
		}

		vm.userHasPermissions = function(user, permission) {

			var hasPermissions = false;
			vm.selectedTeamspace.assignUsers.forEach(function(iUser){
				if (iUser.assignedUser === user.assignedUser) {
					hasPermissions = user.permissions.indexOf(permission) !== -1;
				} 
			});
			
			return hasPermissions;
		}

		vm.appendUserPermissions = function(teamspace) {

			var url = serverConfig.apiUrl(serverConfig.GET_API, teamspace.account + "/permissions" );
			return $http.get(url).then(function(response) {
				var permissionsUsers = response.data;
				var found;
				teamspace.assignUsers.forEach(function(user){
					found = false
					permissionsUsers.forEach(function(permissionsUser) {
						if (permissionsUser.user === user.assignedUser) {
							user.permissions = permissionsUser.permissions;
							found = true;
						} 
					});
					if (!found) {
						user.permissions = [];
					}
				})
			});
			
		}

		$scope.$watch("vm.teamspaceSelected", function(){

			vm.projectSelected = undefined;
			vm.selectedProject = undefined;
			vm.models = {};
			vm.modelReady = false;
			vm.projectReady = false;

			if (vm.teamspaces.length) {

				// Find the matching teamspace to the one selected
				vm.selectedTeamspace = vm.teamspaces.find(function(teamspace){
					return teamspace.account === vm.teamspaceSelected;
				});

				if (vm.selectedTeamspace) {
					vm.setProjects(vm.teamspaceSelected).then(function(){
						// The property is set async so it won't be there immediately
						return $q(function(resolve, reject) {
							if (vm.selectedTeamspace && vm.selectedTeamspace.assignUsers) {				
								vm.appendUserPermissions(vm.selectedTeamspace).then(function(){
									vm.setPermissionTemplates(vm.selectedTeamspace).then(function() {
										if (vm.fromURL.projectSelected) {
											vm.projectSelected = vm.fromURL.projectSelected;
											delete vm.fromURL.projectSelected;
										}
										vm.projectReady = true;
										resolve(vm.selectedTeamspace.assignUsers);
									});
								});
							} else {
								vm.projectReady = true;
								resolve([]);
							}
						});		
					});
				}

				

			}
		
		});

		vm.setPermissionTemplates = function(teamspace){

			var permission = teamspace.account + "/permission-templates";
			var permissionUrl = serverConfig.apiUrl(serverConfig.GET_API, permission);
			
			return $http.get(permissionUrl).then(function(response) {
				vm.modelRoles = [];
				response.data.forEach(function(template){
					vm.modelRoles.push(template._id);
				});
			});

		}

		var getUsers = function(teamspace) {
			var url = serverConfig.apiUrl(serverConfig.GET_API, teamspace.account + "/subscriptions" );
			$http.get(url)
			.then(function(response) {
				teamspace.assignUsers = response.data;
			})
			.catch(function(response){
				console.error("error", response);
			});
		}

		// PROJECTS

		$scope.$watch("vm.projectSelected", function(){
			// Find the matching project to the one selected
			vm.selectedProject = vm.projects.find(function(project){
				return project.name === vm.projectSelected
			});

			if (vm.teamspaceSelected && vm.projectSelected) {
				return $q(function(resolve, reject) {
					if (vm.selectedProject && vm.selectedProject.models) {
						vm.modelIds = vm.selectedProject.models;
						vm.modelIds.forEach(vm.appendModelObjects);
						resolve(vm.models);
					}
				});
			} 
			
		});


		vm.projectStateChange = function(user, permission) {
			var addOrRemove = vm.userHasProjectPermissions(user, permission) === true ? "remove" : "add";
			vm.postProjectPermissionChange(user, permission, addOrRemove)
		}

		vm.userHasProjectPermissions = function(user, permission) {
			var hasPermission = false;
			vm.selectedProject.permissions.forEach(function(permissionUser){
				if (permissionUser.user === user.assignedUser) {
					if (permissionUser.permissions) {
						hasPermission = permissionUser.permissions.indexOf(permission) !== -1;
					}
				}
			});
			return hasPermission;
		}

		vm.postProjectPermissionChange = function(user, permission, addOrRemove) {

			//Add or remove a permission

			if (addOrRemove === "add") {

				var targetUser = vm.selectedProject.permissions.find(function(projectUser){
					return projectUser.user === user.assignedUser;
				});

				// If the user is already in the list we can add the persmission
				if (targetUser) {
					if (targetUser.permissions.indexOf(permission) === -1) {
						targetUser.permissions.push(permission);
					}
				} 
				// Else we create a new object and add it in
				else {
					vm.selectedProject.permissions.push({
						user : user.assignedUser,
						permissions: [permission]
					});
				}
				
			}

			//Update the permissions user for the selected teamspace
			var endpoint = vm.selectedTeamspace.account + "/projects/" + vm.selectedProject.name;
			var url = serverConfig.apiUrl(serverConfig.POST_API, endpoint);
			$http.put(url, {
				permissions: vm.selectedProject.permissions
			});

		}

		// MODELS

		$scope.$watch("vm.modelSelected", function(){
			// Find the matching project to the one selected

			vm.modelReady = false;
			if (vm.teamspaceSelected && vm.projectSelected && vm.modelSelected) {

				vm.selectedModel = vm.models[vm.modelSelected];
				
				return $q(function(resolve, reject) {

					var endpoint = vm.selectedTeamspace.account + "/" + vm.modelSelected +  "/" + "permissions"
					var url = serverConfig.apiUrl(serverConfig.POST_API, endpoint);
					$http.get(url).then(function(response){
						var users = response.data;
						vm.selectedModel.assignableUsers = users;
						vm.selectedModel.assignableUsers.forEach(function(user) {
							vm.selectedRole[user.user] = user.permission;
						})
						vm.modelReady = true;
						resolve();
					})
					.catch(function(error){
						console.error("Error", error)
						reject(error);
					});	
					
				});		
			}
			

		});

		

		vm.modelsAreLoaded = function() {
			return Object.keys(vm.models).length && 
				   vm.modelIds.length && 
				   Object.keys(vm.models).length === vm.modelIds.length;
		}

		vm.appendModelObjects = function(modelId) {
			var endpoint = vm.selectedTeamspace.account + "/" + modelId + ".json";
			var modelUrl = serverConfig.apiUrl(serverConfig.GET_API, endpoint);
			return $http.get(modelUrl)
						.then(function(response){
							vm.models[modelId] = response.data;
							if (vm.fromURL.modelSelected && vm.fromURL.modelSelected === modelId) {
								vm.modelSelected = vm.fromURL.modelSelected;
								delete vm.fromURL.modelSelected;
							}
						})
						.catch(function(response){
							console.log("error", response);
						});
		}


		vm.modelStateChange = function(user, role) {

			// Loop through the list of available users and find the selected user
			vm.selectedModel.assignableUsers.forEach(function(assignableUser) {
				if (user.assignedUser === assignableUser.user) {
					// Change the users role to the newly selected permission
					assignableUser.permission = role;
				}
			});
			
			// Send the update to the server
			vm.postModelRoleChange(user, role)
		}

		vm.userIsInTeam = function(user) {
			var isInTeam = false;
			vm.selectedModel.assignableUsers.forEach(function(assignable){
				if (assignable.user === user.assignedUser) {
					isInTeam = true;
				}
			});
			return isInTeam;
		}

		vm.postModelRoleChange = function(user, role) {

			//Update the permissions user for the selected teamspace
			// POST /{accountName}/{modelID}/permissions
			var endpoint = vm.selectedTeamspace.account + "/" + vm.modelSelected + "/permissions";
			var url = serverConfig.apiUrl(serverConfig.POST_API, endpoint);
			
			// We can use the assignable users object as its matches the required 
			// data structure the API expects
			$http.post(url, vm.selectedModel.assignableUsers)
			.then(function(response){
				console.log(response);
			})
			.catch(function(error) {
				console.error("Error: ", error);
			});

		}


	}
}());
