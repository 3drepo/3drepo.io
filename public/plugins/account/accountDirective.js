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
		.directive("accountDir", accountDir);

	function accountDir() {
		return {
			restrict: 'EA',
			templateUrl: 'account.html',
			scope: {},
			controller: AccountCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountCtrl.$inject = ["$scope", "StateManager"];

	function AccountCtrl($scope, StateManager) {
		var vm = this;

		vm.Data = StateManager.Data;
		vm.defaultView = "projects";
		vm.view = vm.defaultView;
		vm.passwords = {};
		vm.passwords.updateUserError = "";
		vm.passwords.changePasswordError = "";
		vm.errors = {};
		vm.errors.oldPassword = "";
		vm.errors.newPassword = "";
		vm.projectsShowList = true;

		/*
		 * Handle changes to the state manager Data
		 */
		$scope.$watch("vm.Data", function () {
			console.log(vm.Data);
			vm.name = vm.Data.AccountData.firstName + " " + vm.Data.AccountData.lastName;
			vm.email = vm.Data.AccountData.email;
		}, true);

		vm.setView = function(view){
			vm.view = view;
		};

		vm.goProject = function(account, project){
			StateManager.setStateVar("account", account);
			StateManager.setStateVar("project", project);
			StateManager.updateState();
		};

		vm.isView = function(view){
			return vm.view === view;
		};

		vm.toggleProjectsView = function() {
			vm.projectsShowList = !vm.projectsShowList;
		};
	}
}());
