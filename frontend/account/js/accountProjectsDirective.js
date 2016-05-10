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
				account: "=",
				projectsGrouped: "="
			},
			controller: AccountProjectsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountProjectsCtrl.$inject = ["$scope", "$location", "AccountService"];

	function AccountProjectsCtrl($scope, $location, AccountService) {
		var vm = this,
			promise,
			bid4FreeProjects = null;

		/*
		 * Init
		 */
		vm.bif4FreeEnabled = false;

		promise = AccountService.getProjectsBid4FreeStatus(vm.account);
		promise.then(function (data) {
			if (data.data.length > 0) {
				bid4FreeProjects = [];
				angular.forEach(data.data, function (value) {
					if (bid4FreeProjects.indexOf(value.project) === -1) {
						bid4FreeProjects.push(value.project);
					}
				});
				setupBid4FreeAccess();
			}
		});

		/*
		 * Handle changes to the state manager Data
		 * Reformat the grouped projects to enable toggling of projects list
		 */
		$scope.$watch("vm.projectsGrouped", function () {
			console.log(vm.projectsGrouped);
			var account;
			vm.accounts = [];
			angular.forEach(vm.projectsGrouped, function(value, key) {
				account = {
					name: key,
					projects: [],
					showProjects: true
				};
				angular.forEach(value, function(project) {
					account.projects.push({
						name: project.name,
						timestamp: project.timestamp,
						bif4FreeEnabled: false
					});
				});
				vm.accounts.push(account);
			});
			setupBid4FreeAccess();
		});

		/**
		 * Go to the project viewer
		 *
		 * @param {String} account
		 * @param {String} project
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
		
		vm.b4f = function (account, project) {
			console.log(account, project);
			$location.path("/" + account + "/" + project + "/bid4free", "_self");
		};

		function setupBid4FreeAccess () {
			if ((vm.accounts.length > 0) && (bid4FreeProjects !== null)) {
				angular.forEach(vm.accounts, function(account) {
					angular.forEach(account.projects, function(project) {
						project.bif4FreeEnabled = (bid4FreeProjects.indexOf(project.name) !== -1);
					});
				});
			}
		}
	}
}());
