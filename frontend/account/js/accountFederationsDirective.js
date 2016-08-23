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
			accountsToUse;

		// Init
		vm.federationOptions = {
			edit: {label: "Edit", icon: "edit"},
			team: {label: "Team", icon: "group"},
			delete: {label: "Delete", icon: "delete"}
		};

		/*
		 * Watch accounts input
		 */
		$scope.$watch("vm.accounts", function () {
			var i, length;

			// Currently only use the user DB for federation
			if (angular.isDefined(vm.accounts)) {
				accountsToUse = [];
				for (i = 0, length = vm.accounts.length; i < length; i += 1) {
					if (vm.accounts[i].account === vm.account) {
						accountsToUse.push(vm.accounts[i]);
						break;
					}
				}
				vm.accountsToUse = angular.copy(accountsToUse);
				console.log(vm.accountsToUse);

				vm.showInfo = ((vm.accountsToUse.length === 0) || (vm.accountsToUse[0].fedProjects.length === 0));
			}
		});

		/*
		 * Watch for change in edited federation
		 */
		$scope.$watch("vm.newFederationData", function () {
			if (vm.federationOriginalData === null) {
				vm.newFederationButtonDisabled = (angular.isUndefined(vm.newFederationData.name)) || (vm.newFederationData.name === "");
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
		vm.setupNewFederation = function (event) {
			vm.accountsToUse = angular.copy(accountsToUse);
			vm.federationOriginalData = null;
			vm.newFederationData = {
				desc: "",
				type: "",
				subProjects: []
			};
			UtilsService.showDialog("federationDialog.html", $scope, event);
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
		 * @param accountIndex
		 * @param projectIndex
		 */
		vm.addToFederation = function (accountIndex, projectIndex) {
			vm.showRemoveWarning = false;

			vm.newFederationData.subProjects.push({
				accountIndex: accountIndex,
				database: vm.accountsToUse[accountIndex].account,
				projectIndex: projectIndex,
				project: vm.accountsToUse[accountIndex].projects[projectIndex].project
			});

			vm.accountsToUse[accountIndex].projects[projectIndex].federated = true;
		};

		/**
		 * Remove a project from a federation
		 *
		 * @param index
		 */
		vm.removeFromFederation = function (index) {
			var i, j, iLength, jLength,
				exit = false,
				item;

			// Cannot have existing federation with no sub projects
			if (vm.newFederationData.hasOwnProperty("timestamp") && vm.newFederationData.subProjects.length === 1) {
				vm.showRemoveWarning = true;
			}
			else {
				item = vm.newFederationData.subProjects.splice(index, 1);
				for (i = 0, iLength = vm.accountsToUse.length; (i < iLength) && !exit; i += 1) {
					if (vm.accountsToUse[i].account === item[0].database) {
						for (j = 0, jLength = vm.accountsToUse[i].projects.length; (j < jLength) && !exit; j += 1) {
							if (vm.accountsToUse[i].projects[j].project === item[0].project) {
								vm.accountsToUse[i].projects[j].federated = false;
								exit = true;
							}
						}
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
				promise = UtilsService.doPost(vm.newFederationData, vm.account + "/" + vm.newFederationData.project);
				promise.then(function (response) {
					console.log(response);
					vm.accountsToUse[0].fedProjects.push(vm.newFederationData);
					vm.closeDialog();
				});
			}
			else {
				promise = UtilsService.doPut(vm.newFederationData, vm.account + "/" + vm.newFederationData.project);
				promise.then(function (response) {
					console.log(response);
					vm.closeDialog();
				});
			}

			$timeout(function () {
				$scope.$apply();
			});
		};

		/**
		 * Open the federation in the viewer
		 */
		vm.viewFederation = function (index) {
			$location.path("/" + vm.account + "/" + vm.accountsToUse[0].fedProjects[index].project, "_self").search({});
		};

		/**
		 * Handle federation option selection
		 *
		 * @param event
		 * @param option
		 * @param index
		 */
		vm.doFederationOption = function (event, option, index) {
			switch (option) {
				case "edit":
					setupEditFederation(event, index);
					break;

				case "team":
					setupEditTeam(event, index);
					break;

				case "delete":
					setupDelete(event, index);
					break;
			}
		};

		/**
		 * Delete federation
		 */
		vm.delete = function () {
			var promise = UtilsService.doDelete({}, vm.account + "/" + vm.accountsToUse[0].fedProjects[federationToDeleteIndex].project);
			promise.then(function (response) {
				if (response.status === 200) {
					vm.accountsToUse[0].fedProjects.splice(federationToDeleteIndex, 1);
					vm.closeDialog();
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
		 * @param index
		 */
		function setupEditFederation (event, index) {
			var i, j, k, iLength, jLength, kLength;

			vm.showRemoveWarning = false;

			vm.accountsToUse = angular.copy(accountsToUse);
			vm.federationOriginalData = vm.accountsToUse[0].fedProjects[index];
			vm.newFederationData = angular.copy(vm.federationOriginalData);

			// Disable projects in the projects list that are federated
			for (i = 0, iLength = vm.accountsToUse.length; i < iLength; i += 1) {
				for (j = 0, jLength = vm.accountsToUse[i].projects.length; j < jLength; j += 1) {
					vm.accountsToUse[i].projects[j].federated = false;
					for (k = 0, kLength = vm.federationOriginalData.subProjects.length; k < kLength; k += 1) {
						if (vm.federationOriginalData.subProjects[k].project === vm.accountsToUse[i].projects[j].project) {
							vm.accountsToUse[i].projects[j].federated = true;
						}
					}
				}
			}

			UtilsService.showDialog("federationDialog.html", $scope, event);
		}

		/**
		 * Set up deleting of federation
		 *
		 * @param {Object} event
		 * @param {Object} index
		 */
		 function setupDelete (event, index) {
			federationToDeleteIndex = index ;
			vm.deleteError = null;
			vm.deleteTitle = "Delete Federation";
			vm.deleteWarning = "This federation will be lost permanently and will not be recoverable";
			vm.deleteName = vm.accountsToUse[0].fedProjects[federationToDeleteIndex].project;
			UtilsService.showDialog("deleteDialog.html", $scope, event, true);
		}

		/**
		 * Set up team of federation
		 *
		 * @param {Object} event
		 * @param {Object} index
		 */
		function setupEditTeam (event, index) {
			vm.item = vm.accountsToUse[0].fedProjects[index];
			UtilsService.showDialog("teamDialog.html", $scope, event);
		}
	}
}());
