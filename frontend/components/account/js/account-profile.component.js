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
			restrict: "E",
			templateUrl: "templates/account-profile.html",
			bindings: {
				username: "=",
				firstName: "=",
				lastName: "=",
				email: "="
			},
			controller: AccountProfileCtrl,
			controllerAs: "vm"
		});

	AccountProfileCtrl.$inject = ["AccountService"];

	function AccountProfileCtrl(AccountService) {
		var vm = this;
		
		/*
		 * Init
		 */
		vm.$onInit = function() {
			vm.showInfo = true;
			vm.showChangePassword = false;
			vm.firstNameNew = vm.firstName;
			vm.lastNameNew = vm.lastName;
			vm.emailNew = vm.email;

		};

		/**
		 * Update the user info
		 */
		vm.updateInfo = function () {
			AccountService.updateInfo(vm.username, {
				email: vm.emailNew,
				firstName: vm.firstNameNew,
				lastName: vm.lastNameNew
			})
				.then(function (response) {
					if (response.status === 200) {
						vm.infoSaveInfo = "Saved";
						vm.updateError = "";
						vm.firstName = vm.firstNameNew;
						vm.lastName = vm.lastNameNew;
						vm.email = vm.emailNew;

					} else {
						vm.updateError = response.data.message;
					}
				})
				.catch(function(error) {
					if (error && error.data && error.data.message) {
						vm.updateError = error.data.message;
					} else {
						vm.updateError = "Unknown error updating profile";
					}
				});
		};

		/**
		 * Update the user password
		 */
		vm.updatePassword = function () {
			AccountService.updatePassword(vm.username, {
				oldPassword: vm.oldPassword,
				newPassword: vm.newPassword
			})
				.then(function (response) {
					if (response.status === 200) {
						vm.passwordSaveInfo = "Saved";
						vm.passwordSaveError = "";
					} else {
						vm.passwordSaveError = response.data.message;
					}
				})
				.catch(function (error) {
					if (error && error.data && error.data.message) {
						vm.passwordSaveError = error.data.message;
					} else {
						vm.passwordSaveError = "Unknown error updating password";
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
		};
	}
}());
