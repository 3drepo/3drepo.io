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
				onShowPage: "&",
				quota: "=",
				subscriptions: "="
			},
			controller: AccountFederationsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountFederationsCtrl.$inject = ["$scope", "$location", "$timeout", "UtilsService", "serverConfig", "Auth", "AnalyticService"];

	function AccountFederationsCtrl ($scope, $location, $timeout, UtilsService, serverConfig, Auth, AnalyticService) {
		var vm = this,
			federationToDeleteIndex,
			userAccount, // For creating federations
			accountsToUse, // For listing federations
			dialogCloseToId;

		vm.modelRegExp = serverConfig.modelNameRegExp;
		
		// Init
		function getFederationOptions(model, account){

			var isUserAccount = account === vm.account;
			return {
				edit: {label: "Edit", icon: "edit", hidden: !Auth.hasPermission(serverConfig.permissions.PERM_EDIT_model, model.permissions)},
				team: {label: "Team", icon: "group", hidden: !isUserAccount},
				modelsetting: {label: "Settings", icon: "settings", hidden: !Auth.hasPermission(serverConfig.permissions.PERM_CHANGE_model_SETTINGS, model.permissions)},
				delete: {label: "Delete", icon: "delete", color: "#F44336", hidden: !Auth.hasPermission(serverConfig.permissions.PERM_DELETE_model, model.permissions)}
			};
			
		};

		vm.units = server_config.units;
		vm.dialogCloseTo = "accountFederationsOptionsMenu_" + vm.account;
		dialogCloseToId = "#" + vm.dialogCloseTo;

		vm.showMenu = function(model, account){
		
			var isUserAccount = account === vm.account;
			return Auth.hasPermission(serverConfig.permissions.PERM_EDIT_model, model.permissions) ||
				Auth.hasPermission(serverConfig.permissions.PERM_CHANGE_model_SETTINGS, model.permissions) ||
				Auth.hasPermission(serverConfig.permissions.PERM_DELETE_model, model.permissions) ||
				isUserAccount;
		}

		/*
		 * Watch accounts input
		 */
		$scope.$watch("vm.accounts", function () {
			var i, length;

			if (angular.isDefined(vm.accounts)) {
				vm.showInfo = true;
				if (vm.accounts.length > 0) {
					accountsToUse = [];
					for (i = 0, length = vm.accounts.length; i < length; i += 1) {

						if (i === 0) {
							vm.accounts[i].showModels = true;
							accountsToUse.push(vm.accounts[i]);
							if (vm.accounts[i].fedProjects.length > 0) {
								vm.showInfo = false;
							}
							userAccount = vm.accounts[i];
						}
						else if (vm.accounts[i].fedProjects.length > 0) {
							vm.accounts[i].showModels = true;
							accountsToUse.push(vm.accounts[i]);
							vm.showInfo = false;
						}

						if(vm.accounts[i].fedProjects){
							vm.accounts[i].fedProjects.forEach(function(fedModel){
								fedModel.federationOptions = getFederationOptions(fedModel, vm.accounts[i].account);
							});
						}

					}



					vm.accountsToUse = angular.copy(accountsToUse);
					console.log('accountsToUse', vm.accountsToUse);
				}
			}
		});

		/*
		 * Watch for change in edited federation
		 */
		$scope.$watch("vm.newFederationData", function () {
			if (vm.federationOriginalData === null) {
				vm.newFederationButtonDisabled = (angular.isUndefined(vm.newFederationData.model)) || (vm.newFederationData.model === "" || !vm.newFederationData.unit);
			}
			else {
				vm.newFederationButtonDisabled = angular.equals(vm.newFederationData, vm.federationOriginalData);
			}
		}, true);

		/**
		 * Open the federation dialog
		 *
		 * @param event
		 */
		vm.setupNewFederation = function (event, accountIndex) {

			vm.currentAccountIndex = accountIndex;
			vm.userAccount = angular.copy(vm.accountsToUse[vm.currentAccountIndex]);
			vm.federationOriginalData = null;
			vm.newFederationData = {
				desc: "",
				type: "",
				subModels: []
			};
			vm.errorMessage = '';
			UtilsService.showDialog("federationDialog.html", $scope, event, true, null, false, dialogCloseToId);
		};

		/**
		 * Close the federation dialog
		 *
		 */
		vm.closeDialog = function () {
			UtilsService.closeDialog();
		};

		/**
		 * Toggle showing of models in an account
		 *
		 * @param index
		 */
		vm.toggleShowModels = function (index) {
			vm.accountsToUse[index].showModels = !vm.accountsToUse[index].showModels;
			vm.accountsToUse[index].showModelsIcon = vm.accountsToUse[index].showModels ? "folder_open" : "folder";
		};

		/**
		 * Add a model to a federation
		 *
		 * @param modelIndex
		 */
		vm.addToFederation = function (modelIndex) {
			vm.showRemoveWarning = false;

			vm.newFederationData.subModels.push({
				database: vm.userAccount.account,
				modelIndex: modelIndex,
				model: vm.userAccount.models[modelIndex].model
			});

			vm.userAccount.models[modelIndex].federated = true;
		};

		/**
		 * Remove a model from a federation
		 *
		 * @param index
		 */
		vm.removeFromFederation = function (index) {
			var i, length,
				item;

			// Cannot have existing federation with no sub models
			if (vm.newFederationData.hasOwnProperty("timestamp") && vm.newFederationData.subModels.length === 1) {
				vm.showRemoveWarning = true;
			}
			else {
				item = vm.newFederationData.subModels.splice(index, 1);
				for (i = 0, length = vm.userAccount.models.length; i < length; i += 1) {
					if (vm.userAccount.models[i].model === item[0].model) {
						vm.userAccount.models[i].federated = false;
						break;
					}
				}
			}
		};

		/**
		 * Save a federation
		 */
		vm.saveFederation = function () {
			var promise;

			if (vm.federationOriginalData === null) {
				promise = UtilsService.doPost(vm.newFederationData, vm.accountsToUse[vm.currentAccountIndex].account + "/" + vm.newFederationData.model);
				promise.then(function (response) {
					
					if(response.status !== 200 && response.status !== 201){
						vm.errorMessage = response.data.message;
					} else {
						vm.errorMessage = '';
						vm.showInfo = false;
						vm.newFederationData.timestamp = (new Date()).toString();
						vm.newFederationData.permissions = response.data.permissions;
						vm.newFederationData.federationOptions = getFederationOptions(vm.newFederationData, vm.accountsToUse[vm.currentAccountIndex].account);
						vm.accountsToUse[vm.currentAccountIndex].fedProjects.push(vm.newFederationData);
						vm.closeDialog();

						AnalyticService.sendEvent({
							eventCategory: 'Model',
							eventAction: 'create',
							eventLabel: 'federation'
						});
					}



				});
			}
			else {
				promise = UtilsService.doPut(vm.newFederationData, vm.accountsToUse[vm.currentAccountIndex].account + "/" + vm.newFederationData.model);
				promise.then(function (response) {
					console.log(response);
					vm.federationOriginalData.subModels = vm.newFederationData.subModels;
					vm.closeDialog();
				});
			}

			$timeout(function () {
				$scope.$apply();
			});
		};

		/**
		 * Open the federation in the viewer if it has sub models otherwise open edit dialog
		 *
		 * @param {Object} event
		 * @param {Object} accountIndex
		 * @param {Number} modelIndex
		 */

		vm.viewFederation = function (event, accountIndex, modelIndex) {
			console.log(vm.accountsToUse[accountIndex]);
			if ((accountIndex === 0) && !vm.accountsToUse[accountIndex].fedProjects[modelIndex].hasOwnProperty("subModels")) {
				setupEditFederation(event, accountIndex, modelIndex);
			}
			else {
				$location.path("/" + vm.accountsToUse[accountIndex].account + "/" +  vm.accountsToUse[accountIndex].fedProjects[modelIndex].model, "_self").search({});
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
		vm.doFederationOption = function (event, option, accountIndex, federationIndex) {
			switch (option) {
				case "edit":
					setupEditFederation(event, accountIndex, federationIndex);
					break;

				case "team":
					setupEditTeam(event, accountIndex, federationIndex);
					break;

				case "delete":
					setupDelete(event, accountIndex, federationIndex);
					break;

				case "modelsetting":
					setupSetting(event, accountIndex, federationIndex);
			}
		};

		/**
		 * Delete federation
		 */
		vm.delete = function () {
			var promise = UtilsService.doDelete({}, vm.accountsToUse[vm.currentAccountIndex].account + "/" + vm.accountsToUse[vm.currentAccountIndex].fedProjects[federationToDeleteIndex].model);
			promise.then(function (response) {
				if (response.status === 200) {
					vm.accountsToUse[vm.currentAccountIndex].fedProjects.splice(federationToDeleteIndex, 1);
					vm.showInfo = ((vm.accountsToUse.length === 1) && (vm.accountsToUse[vm.currentAccountIndex].fedProjects.length === 0));
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
		 * Toggle display of models for an account
		 *
		 * @param {Number} index
		 */
		vm.toggleModelsList = function (index) {
			vm.accountsToUse[index].showModels = !vm.accountsToUse[index].showModels;
			vm.accountsToUse[index].showModelsIcon = vm.accountsToUse[index].showModels ? "folder_open" : "folder";
		};

		/**
		 * Edit a federation
		 *
		 * @param event
		 * @param modelIndex
		 */
		function setupEditFederation (event, accountIndex, modelIndex) {
			var i, j, iLength, jLength;

			vm.showRemoveWarning = false;

			console.log('accountIndex', accountIndex);
			vm.currentAccountIndex = accountIndex;
			vm.userAccount = angular.copy(vm.accountsToUse[vm.currentAccountIndex]);
			vm.federationOriginalData = vm.accountsToUse[vm.currentAccountIndex].fedProjects[modelIndex];
			vm.newFederationData = angular.copy(vm.federationOriginalData);
			if (!vm.newFederationData.hasOwnProperty("subModels")) {
				vm.newFederationData.subModels = [];
			}

			// Disable models in the models list that are federated
			for (i = 0, iLength = vm.userAccount.models.length; i < iLength; i += 1) {
				vm.userAccount.models[i].federated = false;
				if (vm.federationOriginalData.hasOwnProperty("subModels")) {
					for (j = 0, jLength = vm.federationOriginalData.subModels.length; j < jLength; j += 1) {
						if (vm.federationOriginalData.subModels[j].model === vm.userAccount.models[i].model) {
							vm.userAccount.models[i].federated = true;
						}
					}
				}
			}

			UtilsService.showDialog("federationDialog.html", $scope, event, true, null, false, dialogCloseToId);
		}

		function setupSetting(event, accountIndex, modelIndex){
			$location.search("proj", vm.accountsToUse[accountIndex].fedProjects[modelIndex].model);
			$location.search("targetAcct", vm.accountsToUse[accountIndex].account);
			vm.onShowPage({page: "modelsetting", callingPage: "teamspaces", data: {tabIndex: 1}});
		}

		/**
		 * Set up deleting of federation
		 *
		 * @param {Object} event
		 * @param {Object} index
		 */
		 function setupDelete (event, accountIndex, index) {
			federationToDeleteIndex = index ;
			vm.deleteError = null;
			vm.deleteTitle = "Delete Federation";
			vm.deleteWarning = "This federation will be lost permanently and will not be recoverable";
			vm.deleteName = vm.accountsToUse[accountIndex].fedProjects[federationToDeleteIndex].model;
			vm.currentAccountIndex = accountIndex;
			UtilsService.showDialog("deleteDialog.html", $scope, event, true, null, false, dialogCloseToId);
		}

		/**
		 * Set up team of federation
		 *
		 * @param {Object} event
		 * @param {Object} index
		 */
		function setupEditTeam (event, accountIndex, index) {
			vm.item = vm.accountsToUse[accountIndex].fedProjects[index];
			vm.currentAccountIndex = accountIndex;
			UtilsService.showDialog("teamDialog.html", $scope, event, true, null, false, dialogCloseToId);
		}
	}
}());
