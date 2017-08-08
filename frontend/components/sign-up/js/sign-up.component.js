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
		.component("signUp", {
			restrict: "E",
			templateUrl: "sign-up.html",
			bindings: {},
			controller: SignUpCtrl,
			controllerAs: "vm"
		});

	SignUpCtrl.$inject = ["$scope", "$mdDialog", "$location", "serverConfig", "UtilsService", "AuthService", "$window"];

	function SignUpCtrl($scope, $mdDialog, $location, serverConfig, UtilsService, AuthService, $window) {
		var vm = this,
			enterKey = 13,
			promise,
			agreeToText = "",
			haveReadText = "",
			legalItem;

		/*
		 * Init
		 */
		vm.$onInit = function() {

			AuthService.sendLoginRequest().then(function(response){
				if (response.data.username) {
					vm.goToLoginPage();
				}
			});

			vm.buttonLabel = "Sign Up!";
			vm.newUser = {username: "", email: "", password: "", tcAgreed: false};
			vm.version = serverConfig.apiVersion;
			vm.logo = "/public/images/3drepo-logo-white.png";
			vm.tcAgreed = false;
			vm.useReCapthca = false;
			vm.registering = false;
			vm.showLegalText = false;

			vm.jobTitles = [
				"Director",
				"Architect",
				"Architectural assistant",
				"BIM Manager",
				"Structural engineer",
				"Civil engineer",
				"MEP engineer",
				"Mechanical engineer",
				"Facilities Manager",
				"Other"
			];

			vm.countries = serverConfig.countries.concat();
			var gbIndex;
			
			vm.countries.find(function(country, i){
				if(country.code === "GB"){
					gbIndex = i;
				}
			});

			vm.countries.unshift(vm.countries.splice(gbIndex,1)[0]);

			/*
			* AuthService stuff
			*/
			if (serverConfig.hasOwnProperty("auth")) {
				if (serverConfig.auth.hasOwnProperty("captcha") && (serverConfig.auth.captcha)) {
					vm.useReCapthca = true;
					vm.captchaKey = serverConfig.captcha_client_key;
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
							} else {
								agreeToText += " and the " + getLegalTextFromLegalItem(serverConfig.legal[legalItem]);
							}
						} else if (serverConfig.legal[legalItem].type === "haveRead") {
							if (haveReadText === "") {
								haveReadText = "I have read the " + getLegalTextFromLegalItem(serverConfig.legal[legalItem]) + " policy";
							} else {
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

		};

		vm.goToLoginPage = function () {
			$window.location.href = "/";
		};

		/*
		 * Watch changes to register fields to clear warning message
		 */
		$scope.$watch("vm.newUser", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.registerErrorMessage = "";
			}
		}, true);


		$scope.$watch("AuthService.isLoggedIn()", function (newValue) {
			// TODO: this is a hack
			if (newValue === true) {
				vm.goToLoginPage();
			}
		});


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
			} else {
				doRegister();
			}
		};

		vm.showTC = function () {
			vm.legalTitle = "Terms and Conditions";
			vm.legalText = "termsAndConditions";
			$mdDialog.show({
				templateUrl: "legal-dialog.html",
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
				doRegister = true,
				allowedFormat = new RegExp(serverConfig.usernameRegExp); // English letters, numbers, underscore, not starting with number

			if ((angular.isDefined(vm.newUser.username)) &&
				(angular.isDefined(vm.newUser.email)) &&
				(angular.isDefined(vm.newUser.password)) &&
				(angular.isDefined(vm.newUser.firstName)) &&
				(angular.isDefined(vm.newUser.lastName)) &&
				(angular.isDefined(vm.newUser.company)) &&
				(angular.isDefined(vm.newUser.jobTitle)) &&
				(vm.newUser.jobTitle !== "Other" || angular.isDefined(vm.newUser.otherJobTitle)) &&
				(angular.isDefined(vm.newUser.country)) 

			) {
				if (allowedFormat.test(vm.newUser.username)) {
					if (vm.showLegalText) {
						doRegister = vm.newUser.tcAgreed;
					}

					if (doRegister) {

						data = {
							email: vm.newUser.email,
							password: vm.newUser.password,
							firstName: vm.newUser.firstName,
							lastName: vm.newUser.lastName,
							company: vm.newUser.company,
							jobTitle: vm.newUser.jobTitle === "Other" ? vm.newUser.otherJobTitle : vm.newUser.jobTitle,
							countryCode: vm.newUser.country,
							phoneNo: vm.newUser.phoneNo
						};

						if (vm.useReCapthca) {
							data.captcha = vm.reCaptchaResponse;
						}
						vm.registering = true;
						promise = UtilsService.doPost(data, vm.newUser.username);
						promise.then(function (response) {
							if (response.status === 200) {
								vm.showPage("registerRequest");
							} else {
								vm.registerErrorMessage = UtilsService.getErrorMessage(response.data);
							}
							vm.registering = false;
							if (vm.useReCapthca) {
								grecaptcha.reset(); // reset reCaptcha
							}
						});
					} else {
						vm.registerErrorMessage = "You must agree to the terms and conditions";
					}
				} else {
					vm.registerErrorMessage = "Username not allowed";
				}
			} else {
				vm.registerErrorMessage = "Please fill all fields";
			}
		}

		function getLegalTextFromLegalItem (legalItem) {
			return "<a target='_blank' href='/" + legalItem.page + "'>" + legalItem.title + "</a>";
		}
	}
}());

