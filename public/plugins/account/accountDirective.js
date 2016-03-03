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

	AccountCtrl.$inject = ["$location", "StateManager"];

	function AccountCtrl($location, StateManager) {
		var vm = this;

		vm.Data = StateManager.Data;
		console.log(vm.Data);
		vm.defaultView = "projects";
		vm.view = vm.defaultView;
		vm.passwords = {};
		vm.passwords.updateUserError = "";
		vm.passwords.changePasswordError = "";
		vm.errors = {};
		vm.errors.oldPassword = "";
		vm.errors.newPassword = "";
		vm.projectsShowList = true;

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


		vm.updateUser = function() {
			vm.Data.UserData.updateUser()
				.success(function() {
					vm.setView(vm.defaultView);
				}).error(function(message) {
				vm.updateUserError = "[" + message.message + "]";
			});
		};

		vm.changePassword = function() {
			vm.Data.AccountData.updatePassword(vm.passwords.oldPassword, vm.passwords.newPassword)
				.success(function() {
					vm.setView(vm.defaultView);
				}).error(function(message) {
				vm.errors.changePasswordError = "[" + message.message + "]";
			});
		};

		vm.toggleProjectsView = function() {
			vm.projectsShowList = !vm.projectsShowList;
		};

		/**
		 * Go to the project viewer
		 *
		 * @param {{String}} project
		 */
		vm.goToProject = function (account, project) {
			$location.path("/" + account + "/" + project, "_self");
		};
	}
}());
