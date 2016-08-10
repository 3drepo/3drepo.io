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
				quota: "="
			},
			controller: AccountFederationsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountFederationsCtrl.$inject = ["$scope", "$location", "UtilsService"];

	function AccountFederationsCtrl ($scope, $location, UtilsService) {
		var vm = this;

		// Init
		vm.federations = [];
		vm.showInfo = (vm.federations.length === 0);
		vm.federationOptions = {
			edit: {label: "Edit", icon: "edit"},
			team: {label: "Team", icon: "group"},
			delete: {label: "Delete", icon: "delete"}
		};

		/*
		 * Watch accounts input
		 */
		$scope.$watch("vm.accounts", function () {
			var i, iLength, j, jLength;
			if (angular.isDefined(vm.accounts)) {
				vm.accountsCopy = angular.copy(vm.accounts);
				for (i = 0, iLength = vm.accounts.length; i < iLength; i += 1) {
					for (j = 0, jLength = vm.accounts[i].projects.length; j < jLength; j += 1) {
						if (vm.accounts[i].projects[j].hasOwnProperty("federate")) {
							vm.federations.push(vm.accounts[i].projects[j]);
						}
					}
				}
			}
			console.log(vm.federations);
			vm.showInfo = (vm.federations.length === 0);
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
			vm.accountsCopy[index].showProjects = !vm.accountsCopy[index].showProjects;
			vm.accountsCopy[index].showProjectsIcon = vm.accountsCopy[index].showProjects ? "folder_open" : "folder";
		};

		/**
		 * Add a project to a federation
		 *
		 * @param accountIndex
		 * @param projectIndex
		 */
		vm.addToFederation = function (accountIndex, projectIndex) {
			vm.newFederationData.subProjects.push({
				accountIndex: accountIndex,
				database: vm.accountsCopy[accountIndex].account,
				projectIndex: projectIndex,
				project: vm.accountsCopy[accountIndex].projects[projectIndex].project
			});

			vm.accountsCopy[accountIndex].projects[projectIndex].federated = true;
		};

		/**
		 * Remove a project from a federation
		 *
		 * @param index
		 */
		vm.removeFromFederation = function (index) {
			var item = vm.newFederationData.subProjects.splice(index, 1);
			vm.accountsCopy[item[0].accountIndex].projects[item[0].projectIndex].federated = false;
		};

		/**
		 * Save a federation
		 */
		vm.saveFederation = function () {
			var promise;

			if (vm.federationOriginalData === null) {
				promise = UtilsService.doPost(vm.newFederationData, vm.account + "/" + vm.newFederationData.name);
				promise.then(function (response) {
					console.log(response);
					vm.federations.push(vm.newFederationData);
					vm.closeDialog();
				});
			}
			else {
				vm.federationOriginalData.subProjects = vm.newFederationData.subProjects;
			}
		};

		/**
		 * Edit a federation
		 *
		 * @param event
		 * @param index
		 */
		vm.editFederation = function (event, index) {
			var i, j, k, iLength, jLength, kLength;

			vm.federationOriginalData = vm.federations[index];
			vm.newFederationData = angular.copy(vm.federationOriginalData);

			for (i = 0, iLength = vm.accountsCopy.length; i < iLength; i += 1) {
				for (j = 0, jLength = vm.accountsCopy[i].projects.length; j < jLength; j += 1) {
					vm.accountsCopy[i].projects[j].federated = false;
					for (k = 0, kLength = vm.federationOriginalData.subProjects.length; k < kLength; k += 1) {
						if (vm.federationOriginalData.subProjects[k].project === vm.accountsCopy[i].projects[j].project) {
							vm.accountsCopy[i].projects[j].federated = true;
						}
					}
				}
			}

			UtilsService.showDialog("federationDialog.html", $scope, event);
		};

		/**
		 * Open the federation in the viewer
		 */
		vm.viewFederation = function (index) {
			$location.path("/" + vm.account + "/" + vm.federations[index].project, "_self").search(null);
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
					vm.editFederation(event, index);
					break;

				case "team":
					$location.search("proj", vm.project.name);
					vm.onShowPage({page: "team", callingPage: "repos"});
					break;

				case "delete":
					vm.onSetupDeleteProject({event: event, project: vm.project});
					break;
			}
		};
	}
}());
