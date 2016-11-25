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

	AccountFederationsCtrl.$inject = ["$scope", "$location", "$timeout", "UtilsService"];

	function AccountFederationsCtrl ($scope, $location, $timeout, UtilsService) {
		var vm = this,
			federationToDeleteIndex,
			userAccount, // For creating federations
			accountsToUse, // For listing federations
			dialogCloseToId;

		function checkProjectPermission(project, action){
			if(action === 'edit' || action === 'team'){
				
				return project.roleFunctions.indexOf('admin') !== -1 
				|| project.roleFunctions.indexOf('collaborator') !== -1;

			} else if (action === 'delete' || action === 'projectsetting') {
				return project.roleFunctions.indexOf('admin') !== -1;
			}
		}

		// Init
		function getFederationOptions(project){

			return {
				edit: {label: "Edit", icon: "edit", hidden: !checkProjectPermission(project, 'edit')},
				team: {label: "Team", icon: "group", hidden: !checkProjectPermission(project, 'team')},
				projectsetting: {label: "Settings", icon: "settings", hidden: !checkProjectPermission(project, 'projectsetting')},
				delete: {label: "Delete", icon: "delete", color: "#F44336", hidden: !checkProjectPermission(project, 'delete')}
			};
			
		};

		vm.units = server_config.units;
		vm.dialogCloseTo = "accountFederationsOptionsMenu_" + vm.account;
		dialogCloseToId = "#" + vm.dialogCloseTo;

		vm.showMenu = function(project){

			if(project.roleFunctions.indexOf('admin') !== -1 
				|| project.roleFunctions.indexOf('collaborator') !== -1){
				return true;
			}
		
			return false;
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
							vm.accounts[i].showProjects = true;
							accountsToUse.push(vm.accounts[i]);
							if (vm.accounts[i].fedProjects.length > 0) {
								vm.showInfo = false;
							}
							userAccount = vm.accounts[i];
						}
						else if (vm.accounts[i].fedProjects.length > 0) {
							vm.accounts[i].showProjects = true;
							accountsToUse.push(vm.accounts[i]);
							vm.showInfo = false;
						}

						if(vm.accounts[i].fedProjects){
							vm.accounts[i].fedProjects.forEach(function(fedProject){
								fedProject.federationOptions = getFederationOptions(fedProject);
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
				vm.newFederationButtonDisabled = (angular.isUndefined(vm.newFederationData.project)) || (vm.newFederationData.project === "" || !vm.newFederationData.unit);
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
				subProjects: []
			};
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
		 * Toggle showing of projects in an account
		 *
		 * @param index
		 */
		vm.toggleShowProjects = function (index) {
			vm.accountsToUse[index].showProjects = !vm.accountsToUse[index].showProjects;
			vm.accountsToUse[index].showProjectsIcon = vm.accountsToUse[index].showProjects ? "folder_open" : "folder";
		};

		/**
		 * Add a project to a federation
		 *
		 * @param projectIndex
		 */
		vm.addToFederation = function (projectIndex) {
			vm.showRemoveWarning = false;

			vm.newFederationData.subProjects.push({
				database: vm.userAccount.account,
				projectIndex: projectIndex,
				project: vm.userAccount.projects[projectIndex].project
			});

			vm.userAccount.projects[projectIndex].federated = true;
		};

		/**
		 * Remove a project from a federation
		 *
		 * @param index
		 */
		vm.removeFromFederation = function (index) {
			var i, length,
				item;

			// Cannot have existing federation with no sub projects
			if (vm.newFederationData.hasOwnProperty("timestamp") && vm.newFederationData.subProjects.length === 1) {
				vm.showRemoveWarning = true;
			}
			else {
				item = vm.newFederationData.subProjects.splice(index, 1);
				for (i = 0, length = vm.userAccount.projects.length; i < length; i += 1) {
					if (vm.userAccount.projects[i].project === item[0].project) {
						vm.userAccount.projects[i].federated = false;
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
				promise = UtilsService.doPost(vm.newFederationData, vm.accountsToUse[vm.currentAccountIndex].account + "/" + vm.newFederationData.project);
				promise.then(function (response) {
					console.log(response);
					vm.showInfo = false;
					vm.newFederationData.timestamp = (new Date()).toString();
					vm.newFederationData.roleFunctions = response.data.roleFunctions;
					vm.accountsToUse[vm.currentAccountIndex].fedProjects.push(vm.newFederationData);
					vm.closeDialog();
				});
			}
			else {
				promise = UtilsService.doPut(vm.newFederationData, vm.accountsToUse[vm.currentAccountIndex].account + "/" + vm.newFederationData.project);
				promise.then(function (response) {
					console.log(response);
					vm.federationOriginalData.subProjects = vm.newFederationData.subProjects;
					vm.closeDialog();
				});
			}

			$timeout(function () {
				$scope.$apply();
			});
		};

		/**
		 * Open the federation in the viewer if it has sub projects otherwise open edit dialog
		 *
		 * @param {Object} event
		 * @param {Object} accountIndex
		 * @param {Number} projectIndex
		 */

		vm.viewFederation = function (event, accountIndex, projectIndex) {
			console.log(vm.accountsToUse[accountIndex]);
			if ((accountIndex === 0) && !vm.accountsToUse[accountIndex].fedProjects[projectIndex].hasOwnProperty("subProjects")) {
				setupEditFederation(event, accountIndex, projectIndex);
			}
			else {
				$location.path("/" + vm.accountsToUse[accountIndex].account + "/" +  vm.accountsToUse[accountIndex].fedProjects[projectIndex].project, "_self").search({});
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

				case "projectsetting":
					setupSetting(event, accountIndex, federationIndex);
			}
		};

		/**
		 * Delete federation
		 */
		vm.delete = function () {
			var promise = UtilsService.doDelete({}, vm.accountsToUse[vm.currentAccountIndex].account + "/" + vm.accountsToUse[vm.currentAccountIndex].fedProjects[federationToDeleteIndex].project);
			promise.then(function (response) {
				if (response.status === 200) {
					vm.accountsToUse[vm.currentAccountIndex].fedProjects.splice(federationToDeleteIndex, 1);
					vm.showInfo = ((vm.accountsToUse.length === 1) && (vm.accountsToUse[vm.currentAccountIndex].fedProjects.length === 0));
					vm.closeDialog();
				}
				else {
					vm.deleteError = "Error deleting federation";
				}
			});
		};

		/**
		 * Toggle display of projects for an account
		 *
		 * @param {Number} index
		 */
		vm.toggleProjectsList = function (index) {
			vm.accountsToUse[index].showProjects = !vm.accountsToUse[index].showProjects;
			vm.accountsToUse[index].showProjectsIcon = vm.accountsToUse[index].showProjects ? "folder_open" : "folder";
		};

		/**
		 * Edit a federation
		 *
		 * @param event
		 * @param projectIndex
		 */
		function setupEditFederation (event, accountIndex, projectIndex) {
			var i, j, iLength, jLength;

			vm.showRemoveWarning = false;

			console.log('accountIndex', accountIndex);
			vm.currentAccountIndex = accountIndex;
			vm.userAccount = angular.copy(vm.accountsToUse[vm.currentAccountIndex]);
			vm.federationOriginalData = vm.accountsToUse[vm.currentAccountIndex].fedProjects[projectIndex];
			vm.newFederationData = angular.copy(vm.federationOriginalData);
			if (!vm.newFederationData.hasOwnProperty("subProjects")) {
				vm.newFederationData.subProjects = [];
			}

			// Disable projects in the projects list that are federated
			for (i = 0, iLength = vm.userAccount.projects.length; i < iLength; i += 1) {
				vm.userAccount.projects[i].federated = false;
				if (vm.federationOriginalData.hasOwnProperty("subProjects")) {
					for (j = 0, jLength = vm.federationOriginalData.subProjects.length; j < jLength; j += 1) {
						if (vm.federationOriginalData.subProjects[j].project === vm.userAccount.projects[i].project) {
							vm.userAccount.projects[i].federated = true;
						}
					}
				}
			}

			UtilsService.showDialog("federationDialog.html", $scope, event, true, null, false, dialogCloseToId);
		}

		function setupSetting(event, accountIndex, projectIndex){
			$location.search("proj", vm.accountsToUse[accountIndex].fedProjects[projectIndex].project);
			$location.search("targetAcct", vm.accountsToUse[accountIndex].account);
			vm.onShowPage({page: "projectsetting", callingPage: "repos", data: {tabIndex: 1}});
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
			vm.deleteName = vm.accountsToUse[accountIndex].fedProjects[federationToDeleteIndex].project;
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
