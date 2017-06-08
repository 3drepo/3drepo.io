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
		.directive("accountFederations", accountFederations);

	function accountFederations() {
		return {
			restrict: 'EA',
			templateUrl: 'accountFederations.html',
			scope: {
				account: "=",
				accounts: "=",
				federation: "=",
				project: "=",
				federationData: "=",
				federationIndex: "=",
				onShowPage: "&",
				quota: "=",
				subscriptions: "=",
				getPotentialFederationModels: "=",
				saveFederation: "=",
				addToFederation: "="
			},
			controller: AccountFederationsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountFederationsCtrl.$inject = ["$scope", "$location", "$timeout", "UtilsService", "serverConfig", "Auth", "AnalyticService", "AccountDataService"];

	function AccountFederationsCtrl ($scope, $location, $timeout, UtilsService, serverConfig, Auth, AnalyticService, AccountDataService) {
		var vm = this,
			federationToDeleteIndex,
			userAccount, // For creating federations
			accountsToUse, // For listing federations
			dialogCloseToId;

		vm.modelRegExp = serverConfig.modelNameRegExp;

		
		// Init
		// function getFederationOptions(model, account){

		// 	var isUserAccount = account.account === vm.account.account;
		// 	return {
		// 		edit: {label: "Edit", icon: "edit", hidden: !Auth.hasPermission(serverConfig.permissions.PERM_EDIT_FEDERATION, model.permissions)},
		// 		team: {label: "Team", icon: "group", hidden: !isUserAccount},
		// 		modelsetting: {label: "Settings", icon: "settings", hidden: !Auth.hasPermission(serverConfig.permissions.PERM_CHANGE_MODEL_SETTINGS, model.permissions)},
		// 		delete: {label: "Delete", icon: "delete", color: "#F44336", hidden: !Auth.hasPermission(serverConfig.permissions.PERM_DELETE_MODEL, model.permissions)}
		// 	};
			
		// };

		vm.getProjects = function(teamspace) {
			var projects = AccountDataService.getProjectsByTeamspaceName(vm.accounts, teamspace);
			return projects;
		}

		vm.units = server_config.units;
		vm.dialogCloseTo = "accountFederationsOptionsMenu_" + vm.account.account;
		dialogCloseToId = "#" + vm.dialogCloseTo;

		vm.showMenu = function(model, account){
			
			var isUserAccount = account.account === vm.account.account;
			return Auth.hasPermission(serverConfig.permissions.PERM_EDIT_FEDERATION, model.permissions) ||
				   Auth.hasPermission(serverConfig.permissions.PERM_CHANGE_MODEL_SETTINGS, model.permissions) ||
				   Auth.hasPermission(serverConfig.permissions.PERM_DELETE_MODEL, model.permissions) ||
				   isUserAccount;
		}

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
								})
								
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
				edit: {label: "Edit", icon: "edit", hidden: !Auth.hasPermission(serverConfig.permissions.PERM_EDIT_FEDERATION, model.permissions)},
				// team: {label: "Team", icon: "group", hidden: !isUserAccount},
				// modelsetting: {label: "Settings", icon: "settings", hidden: !Auth.hasPermission(serverConfig.permissions.PERM_CHANGE_MODEL_SETTINGS, model.permissions)},
				delete: {label: "Delete", icon: "delete", color: "#F44336", hidden: !Auth.hasPermission(serverConfig.permissions.PERM_DELETE_MODEL, model.permissions)}
			};
			
		};


		/**
		 * Reset federation data back to empty object
		 */
		vm.resetFederationData = function() {
			vm.federationData = {};
		}


		vm.removeFromFederation = function (modelName) {
			AccountDataService.removeFromFederation(vm.federationData, modelName);
		};


		/**
		 * Close the federation dialog
		 *
		 */
		vm.closeDialog = function () {
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
			}
			else {

				$location.path("/" + account.name + "/" + model.name, "_self").search({});

				AnalyticService.sendEvent({
					eventCategory: 'Model',
					eventAction: 'view',
					eventLabel: 'federation'
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

				case "team":
					setupEditTeam(event, account, project, federation);
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
		vm.delete = function (federation) {

			var promise = UtilsService.doDelete({}, vm.currentAccount.name + "/" + vm.deleteName);

			promise.then(function (response) {
				if (response.status === 200) {
					//vm.accountsToUse[vm.currentAccountIndex].fedModels.splice(federationToDeleteIndex, 1);
					//vm.showInfo = ((vm.accountsToUse.length === 1) && (vm.accountsToUse[vm.currentAccountIndex].fedModels.length === 0));

					vm.accounts.forEach(function(account) {
						if (account.name === vm.currentAccount.name) {
							account.projects.forEach(function(project) {
								if (project.name === vm.projectToDeleteFrom.name) {
									project.models.forEach(function(model, i) {
										if (model.model === vm.deleteName) {
											project.models.splice(i, 1);
										}
									})
								}
							});
						}
					})
	
					vm.closeDialog();

					AnalyticService.sendEvent({
						eventCategory: 'Model',
						eventAction: 'delete',
						eventLabel: 'federation'
					});
				}
				else {
					vm.deleteError = "Error deleting federation";
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
			vm.federationData.project = project.name;
			vm.federationData._isEdit = true;
			UtilsService.showDialog("federationDialog.html", $scope, event, true);
		}

		function setupSetting(event, account, project, model){
			$location.search("proj", model.name);
			$location.search("targetAcct", account.account);
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
			vm.deleteName = model.model;
			vm.projectToDeleteFrom = project
			vm.currentAccount = account
			UtilsService.showDialog("deleteDialog.html", $scope, event, true, null, false, dialogCloseToId);
		}

		/**
		 * Set up team of federation
		 *
		 * @param {Object} event
		 * @param {Object} index
		 */
		function setupEditTeam (event, account, project, model) {
			vm.item = model;
			vm.currentAccount = account;
			UtilsService.showDialog("teamDialog.html", $scope, event, true, null, false, dialogCloseToId);
		}
	}
}());
