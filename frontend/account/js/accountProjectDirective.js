/**
 *
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
		.directive("accountProject", accountProject);

	function accountProject () {
		return {
			restrict: 'E',
			templateUrl: 'accountProject.html',
			scope: {
				projectData : "="
			},
			controller: AccountProjectCtrl,
			controllerAs: 'vm',
			bindToController: true,
			
		};
	}


	AccountProjectCtrl.$inject = ["$scope"];

	function AccountProjectCtrl ($scope) {
		var vm = this;

		vm.doProjectOption = function(option, project, teamspace) {
			switch (option) {
				case "delete":
					vm.projectData.deleteName = project.name;
					vm.projectData.deleteTeamspace = teamspace.name;
					vm.deleteWarning = "This will remove the project from your teamspace!";
					UtilsService.showDialog("deleteProjectDialog.html", $scope, event, true);	
					break;

				case "edit":
					vm.editProject(project, teamspace);
					break;
			}
		}

		vm.newProject = function() {
			vm.projectData.teamspaceDialog = "";
			vm.projectData.newProjectName = "";
			vm.projectData.oldProjectName = "";
			vm.projectData.errorMessage = '';
			UtilsService.showDialog("projectDialog.html", $scope, event, true);
		}

		vm.editProject = function(project, teamspace) {
			console.log(project)
			vm.projectData.oldProjectName = project.name;
			vm.projectData.teamspaceDialog = teamspace.name;
			vm.projectData.newProjectName = project.name;
			vm.projectData.errorMessage = '';
			UtilsService.showDialog("projectDialog.html", $scope, event, true);
		}

		vm.saveNewProject = function(teamspaceName, projectName) {
			var promise = UtilsService.doPost({"name": projectName}, teamspaceName + "/projects/");
			vm.handleProjectPromise(promise, teamspaceName, false);
		}

		vm.updateProject = function(teamspaceName, oldProjectName, newProjectName) {
			var promise = UtilsService.doPut({"name": newProjectName}, teamspaceName + "/projects/" + oldProjectName);
			vm.handleProjectPromise(promise, teamspaceName, {
				edit  : true,
				newProjectName: newProjectName, 
				oldProjectName : oldProjectName
			});
		}

		vm.deleteProject = function(teamspaceName, projectName) {
			var promise = UtilsService.doDelete({}, teamspaceName + "/projects/" + projectName);
			vm.handleProjectPromise(promise, teamspaceName, {
				projectName : projectName,
				delete: true
			});
		}

		vm.handleProjectPromise = function(promise, teamspaceName, update) {
			promise.then(function (response) {
				
				if(response.status !== 200 && response.status !== 201){
					vm.projectData.errorMessage = response.data.message;
				} else {

					var project = response.data;
					
					if (update.edit) {
						AccountDataService.renameProjectInTeamspace(
							vm.accounts, 
							teamspaceName, 
							update.newProjectName, 
							update.oldProjectName
						);
					} else if (update.delete) {
						AccountDataService.removeProjectInTeamspace(
							vm.accounts, 
							teamspaceName, 
							update.projectName, 
						);
					} else {
						AccountDataService.addProjectToTeamspace(
							vm.accounts, 
							teamspaceName, 
							project
						);
					}

					vm.errorMessage = '';
					delete vm.newProjectTeamspace;
					delete vm.newProjectName;
					vm.closeDialog();
				}

			});

		}


		
	}
}());
