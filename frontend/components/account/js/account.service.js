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
		.service("AccountService", AccountService);

	AccountService.$inject = ["UtilsService", "$q"];

	function AccountService(UtilsService, $q) {

		var accountPromise = $q.defer();

		var service = {

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
			getIndividualTeamspaceModels : getIndividualTeamspaceModels,
			isDuplicateFederation : isDuplicateFederation,
			newSubscription : newSubscription,
			updatePassword : updatePassword,
			updateInfo : updateInfo,
			getUserInfo : getUserInfo,
			accountPromise: accountPromise.promise

		};
	
		return service;
	
		///////////////

		function isDuplicateFederation(teamspaces, teamspaceName, projectName, name) {

			var duplicate = false;

			var feds = getFederationsByProjectName(teamspaces, teamspaceName, projectName);
			feds.forEach(function(fed){
				if (fed.name === name) {
					duplicate = true;
				}
			});

			return duplicate;
		}

		function hasFederationsByProjectName(teamspaces, teamspaceName, projectName) {
			return getFederations(teamspaces, teamspaceName, projectName).length > 0;
		}

		function getFederationsByProjectName(teamspaces, teamspaceName, projectName) { 
			var project = getProject(teamspaces, teamspaceName, projectName);
			return project.models.filter(function(model) {
				return model.subModels; 
			});
		}

		function getIndividualModelsByProjectName(teamspaces, teamspaceName, projectName) {
			var project = getProject(teamspaces, teamspaceName, projectName);
			return project.models.filter(function(model) {
				return !model.subModels; 
			});
		}

		function getIndividualTeamspaceModels(teamspaces, teamspaceName) {
			var teamspace = getTeamspaceByName(teamspaces, teamspaceName);
			return teamspace.models.filter(function(model) {
				return !model.subModels; 
			});
		}

		function hasFederations(models) {
			return getFederations(models).length > 0;
		}

		function getFederations(models) { 
			return models.filter(function(model) {
				return model.subModels; 
			});
		}

		function getIndividualModels(models) {
			return models.filter(function(model) {
				return !model.subModels; 
			});
		}

		function removeProjectInTeamspace(teamspaces, teamspaceName, projectName) {
			var teamspace = getTeamspaceByName(teamspaces, teamspaceName);
			teamspace.projects.forEach(function(project, i){
				if (projectName === project.name) {
					teamspace.projects.splice(i, 1);
				}
			});
		}

		function renameProjectInTeamspace(teamspaces, teamspaceName, newProjectName, oldProjectName) {
			var teamspace = getTeamspaceByName(teamspaces, teamspaceName);
			teamspace.projects.forEach(function(project){
				if (project.name === oldProjectName) {
					project.name = newProjectName;
				}
			});
		}


		function addProjectToTeamspace(teamspaces, teamspaceName, project) {
			var teamspace = getTeamspaceByName(teamspaces, teamspaceName);
			teamspace.projects.push(project);
		}


		function getProjectsByTeamspaceName(teamspaces, name) {

			var projects = [];
			teamspaces.forEach(function(teamspace){
				if (teamspace.name === name) {
					projects = teamspace.projects;
				}
			});
			
			return projects;
	
		}

		function getTeamspaceByName(teamspaces, name) {
			return teamspaces.filter(function(teamspace){
				return teamspace.name === name; 
			})[0];
		}

		function isSubModel(federation, model) {
			var isSubModelOfFed = false;
			federation.subModels.forEach(function(submodel) {
				if (submodel.model === model.model) {
					isSubModelOfFed = true;
				}
			});
			return isSubModelOfFed;
		}

		function getNoneFederatedModels(federation, models) {
			return models.filter(function(model){
				return !isSubModel(federation, model);
			});
		}

		function removeFromFederation(federation, modelId) {
			
			federation.subModels.forEach(function(submodel, i) {
				if (submodel.model === modelId) {
					federation.subModels.splice(i, 1);
				}
			});
			
		}

		function getProject(teamspaces, teamspaceName, projectName) {

			// Return models that are not federated (federations)
			var selectedTeamspace = teamspaces.filter(function(teamspace) {
				return teamspace.name === teamspaceName;
			})[0];

			var selectedProject = selectedTeamspace.projects.filter(function(project) {
				return project.name === projectName;
			})[0];

			return selectedProject;
	
		}


		function getModels(teamspaces, teamspaceName, projectName) {
			return getProject(teamspaces, teamspaceName, projectName).models;
		}

		function removeModelByProjectName(teamspaces, teamspaceName, projectName, modelName) {
			var models = getModels(teamspaces, teamspaceName, projectName);
			var project = getProject(teamspaces, teamspaceName, projectName);
			models.forEach(function(model, i) {
				if (model.model === modelName) {
					project.models.splice(i, 1);
					
				}
			});
		}

		function removeFromFederationByProjectName(teamspaces, teamspaceName, projectName, modelName) {		
			var federations = getFederationsByProjectName(teamspaces, teamspaceName, projectName);
			federations.forEach(function(model, i) {
				if (model.model === modelName) {
					model.subModels.splice(i, 1);
				}
			});
		}

		/**
		 * Update the user info
		 *
		 * @param {String} username
		 * @param {Object} info
		 * @returns {*}
		 */
		function updateInfo(username, info) {
			return UtilsService.doPut(info, username);
		}

		/**
		 * Update the user password
		 *
		 * @param {String} username
		 * @param {Object} passwords
		 * @returns {*}
		 */
		function updatePassword(username, passwords) {
			return UtilsService.doPut(passwords, username);
		}

		/**
		 * Create a new subscription
		 *
		 * @param teamspace
		 * @param data
		 * @returns {*|promise}
		 */
		function newSubscription(teamspace, data) {
			return UtilsService.doPost(data, teamspace + "/subscriptions");
		}


		/**
		 * Get user info
		 *
		 * @param username
		 * @returns {*|promise}
		 */
		function getUserInfo(username) {
			var currentAccount = UtilsService.doGet(username + ".json");
			accountPromise.resolve(currentAccount);
			return currentAccount;
		}

	}
}());
