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
		.component("accountFederations", {
			restrict: "EA",
			templateUrl: "account-federations.html",
			bindings: {
				account: "=",
				accounts: "=",
				federation: "=",
				project: "=",
				federationData: "=",
				federationIndex: "=",
				onShowPage: "&",
				quota: "=",
				subscriptions: "=",
				isDefaultFederation: "@",
				getPotentialFederationModels: "=",
				saveFederation: "=",
				addToFederation: "=",
				isSaving: "="
			},
			controller: AccountFederationsCtrl,
			controllerAs: "vm"
		});

	AccountFederationsCtrl.$inject = ["$scope", "$location", "$timeout", "UtilsService", "serverConfig", "AuthService", "AnalyticService", "AccountDataService"];

	function AccountFederationsCtrl ($scope, $location, $timeout, UtilsService, serverConfig, AuthService, AnalyticService, AccountDataService) {
		var vm = this;
		// federationToDeleteIndex,
		// userAccount, // For creating federations
		// accountsToUse, // For listing federations
		// dialogCloseToId;


		vm.$onInit = function() {
			vm.isSaving = false;
			vm.modelRegExp = serverConfig.modelNameRegExp;
			vm.units = server_config.units;
			vm.dialogCloseTo = "accountFederationsOptionsMenu_" + vm.account.account;
			vm.dialogCloseToId = "#" + vm.dialogCloseTo;

		};

		vm.getProjects = function(teamspace) {
			var projects = AccountDataService.getProjectsByTeamspaceName(vm.accounts, teamspace);
			return projects;
		};


		vm.showMenu = function(model, account){
			
			var isUserAccount = account.account === vm.account.account;
			return AuthService.hasPermission(serverConfig.permissions.PERM_EDIT_FEDERATION, model.permissions) ||
				   AuthService.hasPermission(serverConfig.permissions.PERM_CHANGE_MODEL_SETTINGS, model.permissions) ||
				   AuthService.hasPermission(serverConfig.permissions.PERM_DELETE_MODEL, model.permissions) ||
				   isUserAccount;
		};

		/*
		 * Watch accounts input
		 */
		$scope.$watch("vm.accounts", function () {
			var i, length;
			var account;

			if (angular.isDefined(vm.accounts)) {
				// vm.showInfo = true;
				if (vm.accounts.length > 0) {
					accountsToUse = [];
					for (i = 0, length = vm.accounts.length; i < length; i += 1) {
						account = vm.accounts[i];

						// Default / Unassigned
						if(account.fedModels){
							account.fedModels.forEach(function(fedModel){
								fedModel.federationOptions = getFederationOptions(fedModel, account.account);
							});
						}

						// Assigned models to projects
						if (account.projects) {
							account.projects.forEach(function(project) {
								project.models.forEach(function(model) {
									if (model.federate) {
										model.federationOptions = getFederationOptions(model, account.account);
									}
								});
								
							});
						}
						

					}

					//vm.accountsToUse = angular.copy(accountsToUse);
				}
			}
		});


		function getFederationOptions(model, account){

			var isUserAccount = account.account === vm.account.account;
			return {
				edit: {
					label: "Edit",
					 icon: "edit", 
					 hidden: !AuthService.hasPermission(serverConfig.permissions.PERM_EDIT_FEDERATION, model.permissions)
				},
				delete: {
					label: "Delete", 
					icon: "delete", 
					color: "#F44336", 
					hidden: !AuthService.hasPermission(serverConfig.permissions.PERM_DELETE_MODEL, model.permissions)
				},
				permissions: {
					label: "Permissions", 
					icon: "group", 
					hidden: !vm.account === vm.userAccount
				},
				modelsetting: {
					label: "Settings",
					icon: "settings", 
					hidden: !AuthService.hasPermission(serverConfig.permissions.PERM_CHANGE_MODEL_SETTINGS, model.permissions)
				}
			};
			
		}


		/**
		 * Reset federation data back to empty object
		 */
		vm.resetFederationData = function() {
			vm.federationData = {};
		};


		/**
		 * Remove a model from a federation
		 */
		vm.removeFromFederation = function (modelName) {
			AccountDataService.removeFromFederation(vm.federationData, modelName);
		};


		/**
		 * Close the federation dialog
		 *
		 */
		vm.closeDialog = function () {
			vm.isSaving = false;
			UtilsService.closeDialog();
		};


		/**
		 * Open the federation in the viewer if it has sub models otherwise open edit dialog
		 *
		 * @param {Object} event
		 * @param {Object} accountIndex
		 * @param {Number} modelIndex
		 */

		vm.viewFederation = function (event, account, project, model) {

			if (!model.hasOwnProperty("subModels")) {
				setupEditFederation(event, model);
			} else {

				$location.path("/" + account.name + "/" + model.model, "_self").search({});

				AnalyticService.sendEvent({
					eventCategory: "Model",
					eventAction: "view",
					eventLabel: "federation"
				});

			}

		};

		/**
		 * Handle federation option selection
		 *
		 * @param event
		 * @param option
		 * @param federationIndex
		 */
		vm.doFederationOption = function (event, option, account, project, federation) {

			switch (option) {
			case "edit":
				setupEditFederation(event, account, project, federation);
				break;

			case "permissions":
				goToPermissions(event, account, project, federation);
				break;

			case "delete":
				setupDelete(event, account, project, federation);
				break;

			case "modelsetting":
				setupSetting(event, account, project, federation);
			}
		};


		/**
		 * Delete federation
		 */
		vm.deleteModel = function (federation) {

			var promise = UtilsService.doDelete({}, vm.currentAccount.name + "/" + vm.modelToDelete.model);

			promise.then(function (response) {
				if (response.status === 200) {
					var account = vm.currentAccount;
					if (vm.projectToDeleteFrom && vm.projectToDeleteFrom.name) {
						AccountDataService.removeModelByProjectName(vm.accounts, account.name, vm.projectToDeleteFrom.name, response.data.model);
					} else {
						
						for (var j = 0; j < account.fedModels.length; j++) { 
							if (account.fedModels[j].model === response.data.model) {
								account.fedModels.splice(j, 1);
								break;
							}
						}
					}
					
					vm.addButtons = false;
					vm.addButtonType = "add";
					vm.closeDialog();
					
					AnalyticService.sendEvent({
						eventCategory: "Model",
						eventAction: "delete",
						eventLabel: "federation"
					});
				} else {
					vm.deleteError = "Error deleting federation";
					if (response.data.message) {
						vm.deleteError = response.data.message;
					} 

				}
			});
		};

		/**
		 * Edit a federation
		 *
		 * @param event
		 * @param modelIndex
		 */
		function setupEditFederation (event, teamspace, project, model) {
			vm.federationData = model;
			vm.federationData.teamspace = teamspace.name;

			// Default projects wont have a name
			if (project && project.name) {
				vm.federationData.project = project.name;
			} else {
				vm.federationData.project = "default";
			}
			vm.federationData._isEdit = true;
			UtilsService.showDialog("federation-dialog.html", $scope, event, true);
		}

		function setupSetting(event, teamspace, project, federation){
			$location.search("proj", federation.name);
			$location.search("targetAcct", teamspace.account);
			vm.onShowPage({page: "modelsetting", callingPage: "teamspaces"});
		}

		/**
		 * Set up deleting of federation
		 *
		 * @param {Object} event
		 * @param {Object} index
		 */
		 function setupDelete (event, account, project, model) {
			vm.deleteError = null;
			vm.deleteTitle = "Delete Federation";
			vm.deleteWarning = "This federation will be lost permanently and will not be recoverable";
			vm.modelToDelete = model;
			vm.deleteName = model.name;
			vm.projectToDeleteFrom = project;
			vm.currentAccount = account;
			UtilsService.showDialog("delete-dialog.html", $scope, event, true, null, false, vm.dialogCloseToId);
		}

		/**
		 * Set up permissions of federation
		 *
		 * @param {Object} event
		 * @param {Object} index
		 */
		function goToPermissions (event, account, project, model) {

			// Account is an object here
			$location.search("account", account.account);
			$location.search("project", project.name);
			$location.search("model", model.model);
			$location.search("page", "assign");
			vm.onShowPage({page: "assign", callingPage: "teamspaces"});
		}


	}
}());
