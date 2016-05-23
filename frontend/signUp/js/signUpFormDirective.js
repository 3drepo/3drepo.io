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
		.directive("signUpForm", signUpForm);

	function signUpForm() {
		return {
			restrict: "EA",
			templateUrl: "signUpForm.html",
			scope: {
				buttonLabel: "@"
			},
			controller: SignUpFormCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	SignUpFormCtrl.$inject = ["$scope", "$mdDialog", "$location", "serverConfig", "SignUpFormService"];

	function SignUpFormCtrl($scope, $mdDialog, $location, serverConfig, SignUpFormService) {
		var vm = this,
			enterKey = 13,
			promise,
			pay;

		/*
		 * Init
		 */
		vm.newUser = {username: "", email: "", password: "", tcAgreed: false};
		vm.version = serverConfig.apiVersion;
		vm.logo = "/public/images/3drepo-logo-white.png";
		vm.captchaKey = "6LfSDR8TAAAAACBaw6FY5WdnqOP0nfv3z8-cALAI";
		vm.tcAgreed = false;
		vm.useReCapthca = false;
		vm.useRegister = false;
		vm.registering = false;
		pay =  (($location.search().hasOwnProperty("pay")) && $location.search().pay);

		/*
		 * Auth stuff
		 */
		if (serverConfig.hasOwnProperty("auth")) {
			if (serverConfig.auth.hasOwnProperty("register") && (serverConfig.auth.register)) {
				vm.useRegister = true;
				if (serverConfig.auth.hasOwnProperty("captcha") && (serverConfig.auth.captcha)) {
					vm.useReCapthca = true;
				}
			}
		}

		/*
		 * Watch changes to register fields to clear warning message
		 */
		$scope.$watch("vm.newUser", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.registerErrorMessage = "";
			}
		}, true);

		/**
		 * Attempt to register
		 *
		 * @param {Object} event
		 */
		vm.register = function(event) {
			if (angular.isDefined(event)) {
				if (event.which === enterKey) {
					doRegister();
				}
			}
			else {
				doRegister();
			}
		};

		vm.showTC = function () {
			$mdDialog.show({
				controller: tcDialogController,
				templateUrl: "tcDialog.html",
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose:true,
				fullscreen: true,
				scope: $scope,
				preserveScope: true,
				onRemoving: removeDialog
			});
		};

		vm.showPage = function (page) {
			$location.path("/" + page, "_self");
		};

		/**
		 * Close the dialog
		 */
		$scope.closeDialog = function() {
			$mdDialog.cancel();
		};

		/**
		 * Close the dialog by not clicking the close button
		 */
		function removeDialog () {
			$scope.closeDialog();
		}

		/**
		 * Dialog controller
		 */
		function tcDialogController() {
		}

		/**
		 * Do the user registration
		 */
		function doRegister() {
			var data;

			if ((angular.isDefined(vm.newUser.username)) &&
				(angular.isDefined(vm.newUser.email)) &&
				(angular.isDefined(vm.newUser.password))) {
				if (vm.newUser.tcAgreed) {
					data = {
						email: vm.newUser.email,
						password: vm.newUser.password,
						pay: pay
					};
					if (vm.useReCapthca) {
						data.captcha = vm.reCaptchaResponse;
					}
					vm.registering = true;
					promise = SignUpFormService.register(vm.newUser.username, data);
					promise.then(function (response) {
						if (response.status === 200) {
							vm.showPage("registerRequest");
						}
						else if (response.data.value === 62) {
							vm.registerErrorMessage = "Prove you're not a robot";
						}
						else if (response.data.value === 55) {
							vm.registerErrorMessage = "Username already in use";
						}
						else {
							vm.registerErrorMessage = "Error with registration";
						}
						vm.registering = false;
					});
				}
				else {
					vm.registerErrorMessage = "You must agree to the terms and conditions";
				}
			}
			else {
				vm.registerErrorMessage = "Please fill all fields";
			}
		}
	}
}());
