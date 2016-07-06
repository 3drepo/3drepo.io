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
		.directive("accountTeam", accountTeam);

	function accountTeam() {
		return {
			restrict: 'EA',
			templateUrl: 'accountTeam.html',
			scope: {
				account: "=",
				showPage: "&"
			},
			controller: AccountTeamCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountTeamCtrl.$inject = ["$scope", "$location", "UtilsService"];

	function AccountTeamCtrl($scope, $location, UtilsService) {
		var vm = this,
			i, iLength, j, jLength,
			promise,
			isMember;

		/*
		 * Init
		 */
		vm.memberRole = "collaborator";
		vm.collaborators = [];
		vm.members = [];
		vm.addDisabled = false;
		if ($location.search().hasOwnProperty("proj")) {
			vm.projectName = $location.search().proj;

			// Get the team members
			promise = UtilsService.doGet(vm.account + "/" + vm.projectName + "/collaborators");
			promise.then(function (response) {
				console.log(response);
				if (response.status === 200) {
					vm.members = response.data;
				}

				// Get the collaborators who are not team members
				promise = UtilsService.doGet(vm.account + "/subscriptions");
				promise.then(function (response) {
					console.log(response);
					if (response.status === 200) {
						for (i = 0, iLength = response.data.length; i < iLength; i += 1) {
							if (response.data[i].hasOwnProperty("assignedUser") && (response.data[i].assignedUser !== vm.account)) {
								isMember = false;
								for (j = 0, jLength = vm.members.length; j < jLength; j += 1) {
									if (vm.members[j].user === response.data[i].assignedUser) {
										isMember = true;
										break;
									}
								}
								if (!isMember) {
									vm.collaborators.push({user: response.data[i].assignedUser});
								}
							}
						}
					}
				});
			});
		}

		/*
		 * Watch changes to the new member name
		 */
		$scope.$watch("vm.selectedUser", function (newValue) {
			vm.addDisabled = !(angular.isDefined(newValue) && (newValue !== null));
		});

		/**
		 * Go back to the repos page
		 */
		vm.goBack = function () {
			$location.search("project", null);
			vm.showPage({page: "repos"});
		};

		/**
		 * Add the selected member to the team
		 */
		vm.addMember = function () {
			var i, length,
				data = {
					role: vm.memberRole,
					user: vm.selectedUser.user
				};
			promise = UtilsService.doPost(data, vm.account + "/" + vm.projectName + "/collaborators");
			promise.then(function (response) {
				console.log(response);
				if (response.status === 200) {
					vm.members.push(data);
					for (i = 0, length = vm.collaborators.length; i < length; i += 1) {
						if (vm.collaborators[i].user === vm.selectedUser.user) {
							vm.collaborators.splice(i, 1);
							break;
						}
					}
					vm.searchText = null;
					vm.addDisabled = (vm.collaborators.length === 0);
				}
			});
		};

		/**
		 * Remove member from team
		 *
		 * @param index
		 */
		vm.removeMember = function (index) {
			promise = UtilsService.doDelete(vm.members[index], vm.account + "/" + vm.projectName + "/collaborators");
			promise.then(function (response) {
				console.log(response);
				if (response.status === 200) {
					var member = vm.members.splice(index, 1);
					vm.collaborators.push(member[0]);
					vm.addDisabled = false;
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
	}
}());
