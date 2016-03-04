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
		.directive("accountProfile", accountProfile);

	function accountProfile() {
		return {
			restrict: 'EA',
			templateUrl: 'accountProfile.html',
			scope: {},
			controller: AccountProfileCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountProfileCtrl.$inject = ["$scope", "StateManager", "AccountService"];

	function AccountProfileCtrl($scope, StateManager, AccountService) {
		var vm = this,
			promise;

		vm.Data = StateManager.Data;

		/*
		 * Handle changes to the state manager Data
		 */
		$scope.$watch("vm.Data", function () {
			console.log(vm.Data);
			vm.username = vm.Data.AccountData.username;
			vm.firstName = vm.Data.AccountData.firstName;
			vm.lastName = vm.Data.AccountData.lastName;
			vm.email = vm.Data.AccountData.email;
		}, true);

		vm.updateInfo = function () {
			promise = AccountService.updateInfo(vm.username, {
				email: vm.email,
				firstName: vm.firstName,
				lastName: vm.lastName
			});
			promise.then(function (response) {
				console.log(response);
				if (response.statusText === "OK") {
					vm.infoSaveInfo = "Info saved";
				} else {
					vm.infoSaveInfo = "Error saving info";
				}
			});
		};

		vm.updatePassword = function () {
			promise = AccountService.updatePassword(vm.username, {
				oldPassword: vm.oldPassword,
				newPassword: vm.newPassword
			});
			promise.then(function (response) {
				console.log(response);
				if (response.statusText === "OK") {
					vm.passwordSaveInfo = "Password saved";
				} else {
					vm.passwordSaveInfo = "Error saving password";
				}
			});
		};
	}
}());
