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

	AccountFederationsCtrl.$inject = ["$scope", "UtilsService"];

	function AccountFederationsCtrl ($scope, UtilsService) {
		var vm = this;

		// Init
		vm.showInfo = true;
		vm.federations = [
			{name: "Cheese"},
			{name: "Bacon"}
		];

		$scope.$watch("vm.accounts", function () {
			if (angular.isDefined(vm.accounts)) {
				vm.accountsCopy = angular.copy(vm.accounts);
			}
		});

		$scope.$watch("vm.newFederationData.name", function () {
			if (angular.isDefined(vm.accounts)) {
				vm.accountsCopy = angular.copy(vm.accounts);
			}
		});

		vm.setupFederation = function (event) {
			vm.newFederationData = 
			vm.federation = [];
			UtilsService.showDialog("federationDialog.html", $scope, event);
		};

		vm.closeDialog = function () {
			UtilsService.closeDialog();
		};

		vm.toggleShowProjects = function (index) {
			vm.accountsCopy[index].showProjects = !vm.accountsCopy[index].showProjects;
			vm.accountsCopy[index].showProjectsIcon = vm.accountsCopy[index].showProjects ? "folder_open" : "folder";
		};

		vm.addToFederation = function (accountIndex, projectIndex) {
			console.log(accountIndex, projectIndex);
			vm.federation.push({
				accountIndex: accountIndex,
				account: vm.accountsCopy[accountIndex],
				projectIndex: projectIndex,
				project: vm.accountsCopy[accountIndex].projects[projectIndex]
			});

			vm.accountsCopy[accountIndex].projects[projectIndex].federated = true;
		};

		vm.removeFromFederation = function (index) {
			var item = vm.federation.splice(index, 1);
			vm.accountsCopy[item[0].accountIndex].projects[item[0].projectIndex].federated = false;
		};
	}
}());
