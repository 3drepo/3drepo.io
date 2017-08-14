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

	PasswordChangeCtrl.$inject = ["$scope", "UtilsService", "EventService"];

	function PasswordChangeCtrl ($scope, UtilsService, EventService) {
		var vm = this,
			enterKey = 13,
			promise,
			messageColour = "rgba(0, 0, 0, 0.7)",
			messageErrorColour = "#F44336";
        
		/*
         * Init
         */
		vm.$onInit = function() {
			vm.passwordChanged = false;
			vm.showProgress = false;
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
				if (event.which === enterKey) {
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
					vm.messageColor = messageColour;
					vm.message = "Please wait...";
					vm.showProgress = true;
					promise = UtilsService.doPut(
						{
							token: vm.token,
							newPassword: vm.newPassword
						},
						vm.username + "/password"
					);
					promise.then(function (response) {
						vm.showProgress = false;
						if (response.status === 400) {
							vm.messageColor = messageErrorColour;
							vm.message = "Error changing password";
						} else {
							vm.passwordChanged = true;
							vm.messageColor = messageColour;
							vm.message = "Your password has been reset. Please go to the login page.";
						}
					});
				} else {
					vm.messageColor = messageErrorColour;
					vm.message = "A new password must be entered";
				}
			}
		}
	}
}());
