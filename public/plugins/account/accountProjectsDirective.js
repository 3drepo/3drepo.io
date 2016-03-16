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
		.directive("accountProjects", accountProjects);

	function accountProjects() {
		return {
			restrict: 'EA',
			templateUrl: 'accountProjects.html',
			scope: {
				projectsGrouped: "="
			},
			controller: AccountProjectsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountProjectsCtrl.$inject = ["$scope", "$location"];

	function AccountProjectsCtrl($scope, $location) {
		var vm = this;

		/*
		 * Handle changes to the state manager Data
		 * Reformat the grouped projects to enable toggling of projects list
		 */
		$scope.$watch("vm.projectsGrouped", function () {
			vm.accounts = [];
			angular.forEach(vm.projectsGrouped, function(value, key) {
				vm.accounts.push({
					name: key,
					projects: value,
					showProjects: true
				});
			});
		});

		/**
		 * Go to the project viewer
		 *
		 * @param {{String}} project
		 */
		vm.goToProject = function (account, project) {
			$location.path("/" + account + "/" + project, "_self");
		};

		/**
		 * Toggle display of projects for an account
		 *
		 * @param {Number} index
		 */
		vm.toggleProjectsList = function (index) {
			vm.accounts[index].showProjects = !vm.accounts[index].showProjects;
			vm.accounts[index].showProjectsIcon = vm.accounts[index].showProjects ? "fa fa-folder-open-o" : "fa fa-folder-open-o";
		};
	}
}());
