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
		.component("accountProfile", {
			restrict: 'EA',
			templateUrl: 'account-profile.html',
			bindings: {
				username: "=",
				firstName: "=",
				lastName: "=",
				email: "="
			},
			controller: AccountProfileCtrl,
			controllerAs: 'vm'
		});

	AccountProfileCtrl.$inject = ["AccountService"];

	function AccountProfileCtrl(AccountService) {
		var vm = this,
			promise;

		/*
		 * Init
		 */
		vm.$onInit = function() {
			vm.showInfo = true;
			vm.showChangePassword = false;
			vm.firstNameNew = vm.firstName;
			vm.lastNameNew = vm.lastName;
			vm.emailNew = vm.email;
		}

		/**
		 * Update the user info
		 */
		vm.updateInfo = function () {
			promise = AccountService.updateInfo(vm.username, {
				email: vm.emailNew,
				firstName: vm.firstNameNew,
				lastName: vm.lastNameNew
			});
			promise.then(function (response) {

				if (response.statusText === "OK") {
					vm.infoSaveInfo = "Saved";
					vm.firstName = vm.firstNameNew;
					vm.lastName = vm.lastNameNew;
					vm.email = vm.emailNew;

				} else {
					vm.infoSaveInfo = response.data.message;
				}
			});
		};

		/**
		 * Update the user password
		 */
		vm.updatePassword = function () {
			promise = AccountService.updatePassword(vm.username, {
				oldPassword: vm.oldPassword,
				newPassword: vm.newPassword
			});
			promise.then(function (response) {
				if (response.statusText === "OK") {
					vm.passwordSaveInfo = "Saved";
				} else {
					vm.passwordSaveInfo = response.data.message;
				}
			});
		};

		/**
		 * Toggle showing of user info
		 */
		vm.toggleInfo = function () {
			vm.showInfo = !vm.showInfo;
		};

		/**
		 * Toggle showing of password change
		 */
		vm.toggleChangePassword = function () {
			vm.showChangePassword = !vm.showChangePassword;
		}
	}
}());
