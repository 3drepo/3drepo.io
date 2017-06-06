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
	

		/** FEDERATIONS */




		/** HELPERS */
        var getProjectsByTeamspaceName = function(accounts, name) {

			var projects = [];
			accounts.forEach(function(teamspace){
				if (teamspace.name === name) {
					projects = teamspace.projects
				}
			})
			
			return projects
	
		}

        var getTeamspaceByName = function(accounts, name) {
			return accounts.filter(function(teamspace){
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

		var getInividualModels = function(accounts, teamspace, project) {

			return getModels(accounts, teamspace, project)
			.filter(function(model) {
				// Check it's not a federation itself
				return !model.subModels;
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


		var accountDataService = {

			isSubModel : isSubModel,
			getNoneFederatedModels : getNoneFederatedModels,
            getModels : getModels,
            getProject : getProject,
            getProjectsByTeamspaceName : getProjectsByTeamspaceName,
            getTeamspaceByName : getTeamspaceByName,
			getInividualModels : getInividualModels,
			removeFromFederation: removeFromFederation

        };
	
		return accountDataService;

	}
}());
