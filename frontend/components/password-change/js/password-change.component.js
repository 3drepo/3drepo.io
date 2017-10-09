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

	PasswordChangeCtrl.$inject = ["$scope", "APIService", "EventService"];

	function PasswordChangeCtrl ($scope, APIService, EventService) {
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
		};

		/*
         * Watch inputs to clear any message
         */
		$scope.$watch("vm.newPassword", function () {
			vm.message = "";
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
			EventService.send(EventService.EVENT.GO_HOME);
		};

		/**
         * Do password change
         */
		function doPasswordChange() {
			if (angular.isDefined(vm.username) && angular.isDefined(vm.token)) {
				if (angular.isDefined(vm.newPassword) && (vm.newPassword !== "")) {
					vm.messageColor = vm.messageColour;
					vm.message = "Please wait...";
					vm.showProgress = true;
					vm.promise = APIService.put(
						{
							token: vm.token,
							newPassword: vm.newPassword
						},
						vm.username + "/password"
					);
					
					vm.promise
						.then(function (response) {
							vm.showProgress = false;
							if (response.status === 400) {
								vm.messageColor = vm.messageErrorColour;
								vm.message = "Error changing password: " + response.data.message;
							} else {
								vm.passwordChanged = true;
								vm.messageColor = vm.messageColour;
								vm.message = "Your password has been reset. Please go to the login page.";
							}
						})
						.catch(function(){
							vm.messageColor = vm.messageErrorColour;
							vm.message = "Error changing password";
						});

				} else {
					vm.messageColor = vm.messageErrorColour;
					vm.message = "A new password must be entered";
				}
			}
		}
	}
}());
