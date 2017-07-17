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
		.component("accountTeam", {
			restrict: "EA",
			templateUrl: "account-team.html",
			bindings: {
				account: "=",
				item: "=",
				showPage: "&",
				subscriptions: "="
			},
			controller: AccountTeamCtrl,
			controllerAs: "vm"
		});

	AccountTeamCtrl.$inject = ["$scope", "$location", "$timeout", "UtilsService", "StateManager"];

	function AccountTeamCtrl($scope, $location, $timeout, UtilsService, StateManager) {
		var vm = this,
			promise;

		/*
		 * Init
		 */
		vm.$onInit = function() {
			vm.memberRole = "collaborator";
			vm.collaborators = [];
			vm.members = [];
			vm.addDisabled = false;
			vm.numSubscriptions = (vm.subscriptions) ? vm.subscriptions.length : 0;
			vm.toShow = (vm.numSubscriptions > 1) ? "1+" : vm.numSubscriptions.toString();
			vm.showList = true;

			promise = UtilsService.doGet(vm.account + "/" + vm.item.model + "/permissions");

			promise.then(function (response) {
				if (response.status === 200) {
					vm.members = response.data;
					if (angular.isDefined("vm.subscriptions")) {
						setupTeam();
					}
				}
			});
		};

		/*
		 * Watch changes to the new member name
		 */
		$scope.$watch("vm.selectedUser", function (newValue) {
			vm.addDisabled = !(angular.isDefined(newValue) && (newValue !== null));
		});

		/**
		 * Go back to the teamspaces page
		 */
		vm.goBack = function () {
			$location.search("model", null);
			vm.showPage({page: "teamspaces"});
		};

		/**
		 * Add the selected member to the team
		 */
		vm.addMember = function () {
			var i, length;

			var	data = {
				permission: vm.memberRole,
				user: vm.selectedUser.user
			};

			promise = UtilsService.doPost(vm.members.concat([data]), vm.account + "/" + vm.item.model + "/permissions");

			promise.then(function (response) {
				if (response.status === 200) {
					vm.members.push(data);
					for (i = 0, length = vm.collaborators.length; i < length; i += 1) {
						if (vm.collaborators[i].user === vm.selectedUser.user) {
							vm.collaborators.splice(i, 1);
							break;
						}
					}
					vm.searchText = null;
					vm.selectedUser = null;
					vm.addDisabled = (vm.collaborators.length === 0);
					vm.allLicenseAssigneesMembers = (vm.collaborators.length === 0);

					// This is done to refresh the list as splicing the array causes an empty list
					vm.showList = false;
					$timeout(function () {
						vm.showList = true;
						$scope.$apply();
					});
				}
			});
		};

		/**
		 * Remove member from team
		 *
		 * @param index
		 */
		vm.removeMember = function (index) {

			var member = vm.members.splice(index, 1);

			promise = UtilsService.doPost(vm.members, vm.account + "/" + vm.item.model + "/permissions");

			promise.then(function (response) {
				if (response.status === 200) {
					
					vm.collaborators.push(member[0]);
					vm.addDisabled = false;
					vm.allLicenseAssigneesMembers = false;
				} else {
					vm.members.splice(index, 0, member);
				}
			});
		};

		vm.querySearch = function (query) {
			return query ? vm.collaborators.filter(createFilterFor(query)) : vm.collaborators;
		};

		function createFilterFor (query) {
			var lowercaseQuery = angular.lowercase(query);
			return function filterFn(user) {
				return (user.user.indexOf(lowercaseQuery) === 0);
			};
		}

		vm.goToPage = function (page) {
			StateManager.setQuery({page: page});
		};

		vm.closeDialog = function () {
			UtilsService.closeDialog();
		};

		/**
		 * Set up the team page
		 */
		function setupTeam () {
			var i, iLength, j, jLength,
				isMember;

			for (i = 0, iLength = vm.numSubscriptions; i < iLength; i += 1) {
				if (vm.subscriptions[i].hasOwnProperty("assignedUser") && (vm.subscriptions[i].assignedUser !== vm.account)) {
					isMember = false;
					for (j = 0, jLength = vm.members.length; j < jLength; j += 1) {
						if (vm.members[j].user === vm.subscriptions[i].assignedUser) {
							isMember = true;
							break;
						}
					}
					if (!isMember) {
						vm.collaborators.push({user: vm.subscriptions[i].assignedUser});
					}
				}
			}

			vm.numSubscriptions = vm.subscriptions.filter(function (sub) {
				return sub.inCurrentAgreement;
			}).length;
			vm.noLicensesAssigned =
				(vm.numSubscriptions > 1) &&
				((vm.collaborators.length + vm.members.length) === 0);

			vm.notAllLicensesAssigned =
				!vm.noLicensesAssigned &&
				(vm.numSubscriptions > 1) &&
				((vm.numSubscriptions - 1) !== (vm.collaborators.length + vm.members.length));

			vm.allLicenseAssigneesMembers = (vm.collaborators.length === 0);
		}
	}
}());
