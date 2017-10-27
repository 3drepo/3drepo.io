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
		.component("passwordForgot", {
			restrict: "E",
			bindings: {},
			templateUrl: "templates/password-forgot.html",
			controller: PasswordForgotCtrl,
			controllerAs: "vm"
		});

	PasswordForgotCtrl.$inject = ["$scope", "APIService"];

	function PasswordForgotCtrl ($scope, APIService) {
		var vm = this;
			
        
		/*
         * Init
         */
		vm.$onInit = function() {
			vm.showProgress = false;
			vm.messageColour = "rgba(0, 0, 0, 0.7)";
			vm.messageErrorColour = "#F44336";
		};

		/*
         * Watch inputs to clear any message
         */
		$scope.$watchGroup(["vm.username", "vm.email"], function () {
			vm.message = "";
		});

		/**
         * Process forgotten password recovery
         */
		vm.requestPasswordChange = function (event) {
			var enterKey = 13,
				requestChange = false;

			if (angular.isDefined(event)) {
				requestChange = (event.which === enterKey);
			} else {
				requestChange = true;
			}

			if (requestChange) {
				if (vm.username && vm.email) {

					vm.messageColor = vm.messageColour;
					vm.message = "Please wait...";
					vm.showProgress = true;
					APIService.post(vm.username + "/forgot-password", {email: vm.email})
						.then(function (response) {
							vm.showProgress = false;
							if (response.status === 200) {
								vm.verified = true;
								vm.messageColor = vm.messageColour;
								vm.message = "Thank you. You will receive an email shortly with a link to change your password";
							} else {
								vm.messageColor = vm.messageErrorColour;
								vm.message = response.data.message;
							}
						});

				} else {
					vm.messageColor = vm.messageErrorColour;
					vm.message = "Missing username or email";
				}
			}
		};
	}
}());
