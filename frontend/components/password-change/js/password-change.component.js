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
		.component("passwordChange", {
			restrict: "E",
			bindings: {
				username: "=",
				token: "="
			},
			templateUrl: "templates/password-change.html",
			controller: PasswordChangeCtrl,
			controllerAs: "vm"
		});

	PasswordChangeCtrl.$inject = ["$scope", "APIService", "StateManager"];

	function PasswordChangeCtrl ($scope, APIService, StateManager) {
		var vm = this;
        
		/*
         * Init
         */
		vm.$onInit = function() {
			vm.passwordChanged = false;
			vm.showProgress = false;
			vm.enterKey = 13,
			vm.promise,
			vm.messageColour = "rgba(0, 0, 0, 0.7)",
			vm.messageErrorColour = "#F44336";
			vm.buttonDisabled = true;
		};

		/*
         * Watch inputs to clear any message
         */
		$scope.$watch("vm.newPassword", function () {
			vm.message = "";
			if (vm.newPassword && vm.newPassword !== "") {
				vm.buttonDisabled = false;
			}
		});

		$scope.$watch("vm.token", function () {
			if (!vm.token) {
				vm.messageColor = vm.messageErrorColour;
				vm.showProgress = false;
				vm.message = "Token is missing as URL parameter for password change!";
			}
		});

		$scope.$watch("vm.username", function () {
			if (!vm.username) {
				vm.messageColor = vm.messageErrorColour;
				vm.showProgress = false;
				vm.message = "Username is missing as URL parameter for password change!";
			}
		});

		/**
         * Process forgotten password recovery
         */
		vm.passwordChange = function (event) {
			if (angular.isDefined(event)) {
				if (event.which === vm.enterKey) {
					doPasswordChange();
				}
			} else {
				doPasswordChange();
			}
		};

		/**
         * Take the user back to the login page
         */
		vm.goToLoginPage = function () {
			StateManager.goHome();
		};

		/**
         * Do password change
         */
		function doPasswordChange() {
			if (vm.username && vm.token) {
				if (vm.newPassword && vm.newPassword !== "") {
					
					vm.messageColor = vm.messageColour;
					vm.message = "Please wait...";
					vm.showProgress = true;
					vm.buttonDisabled = true;
					APIService.put(
						vm.username + "/password", 
						{
							token: vm.token,
							newPassword: vm.newPassword
						})
						.then(function (response) {
							
							vm.showProgress = false;
							if (response.status === 400) {
								vm.buttonDisabled = false;
								vm.messageColor = vm.messageErrorColour;
								vm.message = "Error changing password: " + response.data.message;
							} else {
								vm.buttonDisabled = true;
								vm.passwordChanged = true;
								vm.showProgress = false;
								vm.messageColor = vm.messageColour;
								vm.message = "Your password has been reset. Please go to the login page.";
							}
						})
						.catch(function(error){
							vm.buttonDisabled = false;
							vm.showProgress = false;
							vm.messageColor = vm.messageErrorColour;
							vm.message = "Error changing password";
							if (error.data.message) {
								vm.message += ": " + error.data.message;
							}
						});

				} else {
					vm.messageColor = vm.messageErrorColour;
					vm.message = "A new password must be entered";
					vm.buttonDisabled = true;
				}
			}
			vm.buttonDisabled = true;
			vm.message = "Token or username is missing!";
		}
	}
}());
