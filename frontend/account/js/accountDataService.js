/**
 *  Copyright (C) 2017 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
	"use strict";

	angular.module("3drepo")
		.factory("AccountDataService", AccountDataService);

	AccountDataService.$inject = [];

	function AccountDataService() {
	
		/** HELPERS */

		var hasFederationsByProjectName = function(teamspaces, teamspaceName, projectName) {
			return getFederations(teamspaces, teamspaceName, projectName).length > 0;
		};

		var getFederationsByProjectName = function(teamspaces, teamspaceName, projectName) { 
			var project = getProject(teamspaces, teamspaceName, projectName)
			return project.models.filter(function(model) { return model.subModels });
		}

		var getIndividualModelsByProjectName = function(teamspaces, teamspaceName, projectName) {
			var project = getProject(teamspaces, teamspaceName, projectName)
			return project.models.filter(function(model) { return !model.subModels });
		}

		var getIndividualTeamspaceModels = function(teamspaces, teamspaceName) {
			var teamspace = getTeamspaceByName(teamspaces, teamspaceName)
			return teamspace.models.filter(function(model) { return !model.subModels });
		}

		var hasFederations = function(models) {
			return getFederations(models).length > 0;
		};

		var getFederations = function(models) { 
			return models.filter(function(model) { return model.subModels });
		}

		var getIndividualModels = function(models) {
			return models.filter(function(model) { return !model.subModels });
		}

		var removeProjectInTeamspace = function(teamspaces, teamspaceName, projectName) {
			var teamspace = getTeamspaceByName(teamspaces, teamspaceName)
			teamspace.projects.forEach(function(project, i){
				if (projectName === project.name) {
					teamspace.projects.splice(i, 1);
				}
			});
		}


		var renameProjectInTeamspace = function(teamspaces, teamspaceName, newProjectName, oldProjectName) {
			var teamspace = getTeamspaceByName(teamspaces, teamspaceName)
			teamspace.projects.forEach(function(project){
				if (project.name === oldProjectName) {
					project.name = newProjectName;
				}
			});
		}


		var addProjectToTeamspace = function(teamspaces, teamspaceName, project) {
			var teamspace = getTeamspaceByName(teamspaces, teamspaceName)
			teamspace.projects.push(project);
		}


        var getProjectsByTeamspaceName = function(teamspaces, name) {

			var projects = [];
			teamspaces.forEach(function(teamspace){
				if (teamspace.name === name) {
					projects = teamspace.projects
				}
			})
			
			return projects
	
		}

        var getTeamspaceByName = function(teamspaces, name) {
			return teamspaces.filter(function(teamspace){
				return teamspace.name === name 
			})[0];
		}

		var isSubModel = function(federation, model) {
			var isSubModelOfFed = false;
			federation.subModels.forEach(function(submodel) {
				if (submodel.model === model.model) {
					isSubModelOfFed = true;
				}
			});
			return isSubModelOfFed;
		}

		var getNoneFederatedModels = function(federation, models) {
			return models.filter(function(model){
				return !isSubModel(federation, model)
			});
		}

		var removeFromFederation = function (federation, modelName) {
			
			federation.subModels.forEach(function(submodel, i) {
				if (submodel.model === modelName) {
					federation.subModels.splice(i, 1);
				}
			});
			
		};

        var getProject = function(teamspaces, teamspaceName, projectName) {

			// Return models that are not federated (federations)
			var selectedTeamspace = teamspaces.filter(function(teamspace) {
				return teamspace.name === teamspaceName;
			})[0];

			var selectedProject = selectedTeamspace.projects.filter(function(project) {
				return project.name === projectName;
			})[0];

			return selectedProject;
	
		}


        var getModels = function(teamspaces, teamspaceName, projectName) {
			return getProject(teamspaces, teamspaceName, projectName).models;
		}

		var removeModelByProjectName = function(teamspaces, teamspaceName, projectName, modelName) {
			var models = getModels(teamspaces, teamspaceName, projectName);
			var project = getProject(teamspaces, teamspaceName, projectName);
			models.forEach(function(model, i) {
				if (model.model === modelName) {
					project.models.splice(i, 1);
					
				}
			});
		}

		var removeFromFederationByProjectName = function(teamspaces, teamspaceName, projectName, modelName) {		
			var federations = getFederationsByProjectName(teamspaces, teamspaceName, projectName);
			var project = getProject(teamspaces, teamspaceName, projectName);
			federations.forEach(function(model, i) {
				if (model.model === modelName) {
					model.subModels.splice(i, 1);
				}
			});
		};


		var accountDataService = {

			removeProjectInTeamspace : removeProjectInTeamspace,
			renameProjectInTeamspace : renameProjectInTeamspace,
			addProjectToTeamspace : addProjectToTeamspace,
			isSubModel : isSubModel,
			getNoneFederatedModels : getNoneFederatedModels,
            getModels : getModels,
            getProject : getProject,
            getProjectsByTeamspaceName : getProjectsByTeamspaceName,
            getTeamspaceByName : getTeamspaceByName,
			getIndividualModels : getIndividualModels,
			removeFromFederation: removeFromFederation,
			hasFederations : hasFederations,
			getFederations : getFederations,
			hasFederationsByProjectName : hasFederationsByProjectName,
			getFederationsByProjectName : getFederationsByProjectName,
			getIndividualModelsByProjectName : getIndividualModelsByProjectName,
			removeFromFederationByProjectName : removeFromFederationByProjectName,
			removeModelByProjectName : removeModelByProjectName,
			getIndividualTeamspaceModels : getIndividualTeamspaceModels

        };
	
		return accountDataService;

	}
}());
