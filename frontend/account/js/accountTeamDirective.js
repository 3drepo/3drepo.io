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
				showPage: "&"
			},
			controller: AccountTeamCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountTeamCtrl.$inject = ["$location"];

	function AccountTeamCtrl($location) {
		var vm = this;

		/*
		 * Init
		 */
		vm.members = [
			{name: "jozefdobos"},
			{name: "timscully"}
		];
		vm.collaborators = [
			{name: "carmenfan"},
			{name: "henryliu"}
		];
		vm.addDisabled = false;
		if ($location.search().hasOwnProperty("proj")) {
			vm.projectName = $location.search().proj;
		}

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
			var i, length;
			if (vm.selectedUser !== null) {
				vm.members.push(vm.selectedUser);
				for (i = 0, length = vm.collaborators.length; i < length; i += 1) {
					if (vm.collaborators[i].name === vm.selectedUser.name) {
						vm.collaborators.splice(i, 1);
						break;
					}
				}
				vm.searchText = null;
				vm.addDisabled = (vm.collaborators.length === 0);
			}
		};

		/**
		 * Remove member from team
		 *
		 * @param index
		 */
		vm.removeMember = function (index) {
			var member = vm.members.splice(index, 1);
			vm.collaborators.push(member[0]);
			vm.addDisabled = false;
		};

		vm.querySearch = function (query) {
			return query ? vm.collaborators.filter(createFilterFor(query)) : vm.collaborators;
		};

		function createFilterFor (query) {
			var lowercaseQuery = angular.lowercase(query);
			return function filterFn(user) {
				return (user.name.indexOf(lowercaseQuery) === 0);
			};
		}
	}
}());
