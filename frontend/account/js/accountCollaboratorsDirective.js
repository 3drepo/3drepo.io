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
		.directive("accountCollaborators", accountCollaborators);

	function accountCollaborators() {
		return {
			restrict: 'EA',
			templateUrl: 'accountCollaborators.html',
			scope: {
				account: "=",
				showPage: "&"
			},
			controller: AccountCollaboratorsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountCollaboratorsCtrl.$inject = ["$scope", "UtilsService", "StateManager"];

	function AccountCollaboratorsCtrl($scope, UtilsService, StateManager) {
		var vm = this,
			i,
			promise;

		/*
		 * Init
		 */
		vm.numLicenses = 0;
		vm.unassigned = [];
		vm.collaborators = [];
		vm.allLicensesAssigned = false;
		promise = UtilsService.doGet(vm.account + "/subscriptions");
		promise.then(function (response) {
			console.log("subscriptions ", response);
			if (response.status === 200) {
				vm.numLicenses = response.data.length;
				for (i = 0; i < response.data.length; i += 1) {
					if (response.data[i].hasOwnProperty("assignedUser")) {
						if (response.data[i].assignedUser !== vm.account) {
							vm.collaborators.push({user: response.data[i].assignedUser, id: response.data[i]._id});
						}
					}
					else {
						vm.unassigned.push(response.data[i]._id);
					}
				}
				vm.allLicensesAssigned = (vm.unassigned.length === 0);
			}
		});

		/*
		 * Watch changes to the new collaborator name
		 */
		$scope.$watch("vm.newCollaborator", function (newValue) {
			vm.addMessage = "";
			vm.addDisabled = !(angular.isDefined(newValue) && (newValue.toString() !== ""));
		});

		/**
		 * Add the selected user as a collaborator
		 */
		vm.addCollaborator = function () {
			promise = UtilsService.doPost(
				{user: vm.newCollaborator},
				vm.account + "/subscriptions/" + vm.unassigned[0] + "/assign"
			);
			promise.then(function (response) {
				console.log(response);
				if (response.status === 200) {
					vm.addMessage = "User " + vm.newCollaborator + " added as a collaborator";
					vm.collaborators.push({user: response.data.assignedUser, id: response.data._id});
					vm.unassigned.splice(0, 1);
					vm.allLicensesAssigned = (vm.unassigned === 0);
				}
				else if (response.status === 404) {
					vm.addMessage = response.data.message;
				}
			});
		};

		/**
		 * Remove a collaborator
		 *
		 * @param index
		 */
		vm.removeCollaborator = function (index) {
			promise = UtilsService.doDelete({}, vm.account + "/subscriptions/" + vm.collaborators[index].id + "/assign");
			promise.then(function (response) {
				console.log(response);
				if (response.status === 200) {
					vm.collaborators.splice(index, 1);
					vm.unassigned.push(null);
					vm.addDisabled = false;
				}
				else if (response.data.status === 400) {
					if (response.data.value === 94) {
						vm.collaborators[index].deleteMessage = "Currently a member of a team";
					}
				}
			});
		};

		vm.goToBillingPage = function () {
			//StateManager.clearQuery("page");
			StateManager.setQuery({page: "billing"});
		};
	}
}());
