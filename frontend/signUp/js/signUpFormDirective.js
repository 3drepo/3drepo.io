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

	SignUpFormCtrl.$inject = ["$scope", "$mdDialog", "$location", "serverConfig", "UtilsService"];

	function SignUpFormCtrl($scope, $mdDialog, $location, serverConfig, UtilsService) {
		var vm = this,
			enterKey = 13,
			promise,
			agreeToText = "",
			haveReadText = "",
			legalItem;

		/*
		 * Init
		 */
		vm.newUser = {username: "", email: "", password: "", tcAgreed: false};
		vm.version = serverConfig.apiVersion;
		vm.logo = "/public/images/3drepo-logo-white.png";
		vm.captchaKey = serverConfig.captcha_client_key;
		vm.tcAgreed = false;
		vm.useReCapthca = false;
		vm.useRegister = false;
		vm.registering = false;
		vm.showLegalText = false;

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

		// Legal text
		if (angular.isDefined(serverConfig.legal)) {
			vm.showLegalText = true;
			vm.legalText = "";
			for (legalItem in serverConfig.legal) {
				if (serverConfig.legal.hasOwnProperty(legalItem)) {
					if (serverConfig.legal[legalItem].type === "agreeTo") {
						if (agreeToText === "") {
							agreeToText = "I agree to the " + getLegalTextFromLegalItem(serverConfig.legal[legalItem]);
						}
						else {
							agreeToText += " and the " + getLegalTextFromLegalItem(serverConfig.legal[legalItem]);
						}
					}
					else if (serverConfig.legal[legalItem].type === "haveRead") {
						if (haveReadText === "") {
							haveReadText = "I have read the " + getLegalTextFromLegalItem(serverConfig.legal[legalItem]) + " policy";
						}
						else {
							haveReadText += " and the " + getLegalTextFromLegalItem(serverConfig.legal[legalItem]) + " policy";
						}
					}
				}
			}

			vm.legalText = agreeToText;
			if (vm.legalText !== "") {
				vm.legalText += " and ";
			}
			vm.legalText += haveReadText;
			if (vm.legalText !== "") {
				vm.legalText += ".";
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
			vm.legalTitle = "Terms and Conditions";
			vm.legalText = "termsAndConditions";
			$mdDialog.show({
				templateUrl: "legalDialog.html",
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
		 * Do the user registration
		 */
		function doRegister() {
			var data,
				allowedFormat = new RegExp("^[a-zA-Z][\\w]*$"); // English letters, numbers, underscore, not starting with number

			if ((angular.isDefined(vm.newUser.username)) &&
				(angular.isDefined(vm.newUser.email)) &&
				(angular.isDefined(vm.newUser.password))) {
				if (allowedFormat.test(vm.newUser.username)) {
					if (vm.newUser.tcAgreed) {
						data = {
							email: vm.newUser.email,
							password: vm.newUser.password
						};
						if (vm.useReCapthca) {
							data.captcha = vm.reCaptchaResponse;
						}
						vm.registering = true;
						promise = UtilsService.doPost(data, vm.newUser.username);
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
								vm.registerErrorMessage = response.data.message;
							}
							vm.registering = false;
							grecaptcha.reset(); // reset reCaptcha
						});
					}
					else {
						vm.registerErrorMessage = "You must agree to the terms and conditions";
					}
				}
				else {
					vm.registerErrorMessage = "Username not allowed";
				}
			}
			else {
				vm.registerErrorMessage = "Please fill all fields";
			}
		}

		function getLegalTextFromLegalItem (legalItem) {
			return "<a target='_blank' href='/" + legalItem.page + "'>" + legalItem.title + "</a>";
		}
	}
}());
