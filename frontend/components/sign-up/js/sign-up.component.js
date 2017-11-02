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
			templateUrl: "templates/sign-up.html",
			bindings: {},
			controller: SignUpCtrl,
			controllerAs: "vm"
		});

	SignUpCtrl.$inject = ["$scope", "$mdDialog", "$location", "ClientConfigService", "APIService", "AuthService", "$window"];

	function SignUpCtrl($scope, $mdDialog, $location, ClientConfigService, APIService, AuthService, $window) {
		var vm = this;

		/*
		 * Init
		 */
		vm.$onInit = function() {

			AuthService.sendLoginRequest().then(function(response){
				if (response.data.username) {
					vm.goToLoginPage();
				}
			});
			
			vm.enterKey = 13,
			vm.agreeToText = "",
			vm.haveReadText = "";

			vm.buttonLabel = "Sign Up!";
			vm.newUser = {username: "", email: "", password: "", tcAgreed: false};
			vm.version = ClientConfigService.VERSION;
			vm.logo = "/images/3drepo-logo-white.png";
			vm.captchaKey = ClientConfigService.captcha_client_key;

			vm.tcAgreed = false;
			vm.useReCAPTCHA = false;
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

			vm.countries = ClientConfigService.countries.concat();
			var gbIndex;
			
			vm.countries.find(function(country, i){
				if(country.code === "GB"){
					gbIndex = i;
				}
			});

			vm.countries.unshift(vm.countries.splice(gbIndex,1)[0]);

			/*
			* Recapcha
			*/

			
			var reCaptchaExists = ClientConfigService.auth.hasOwnProperty("captcha") && 
									(ClientConfigService.auth.captcha);
			
			if (reCaptchaExists) {
				if (ClientConfigService.captcha_client_key) {
					vm.captchaKey = ClientConfigService.captcha_client_key;
					vm.useReCAPTCHA = true;
				} else {
					console.debug("Captcha key is not set in config");
				}
				
			} else {
				console.debug("Captcha is not set in config");
			}
			

			// Legal text
			if (angular.isDefined(ClientConfigService.legal)) {
				vm.showLegalText = true;
				vm.legalText = "";
				for (var legalItem in ClientConfigService.legal) {
					vm.handleLegalItem(legalItem);
				}

				vm.legalText = vm.agreeToText;
				if (vm.legalText !== "") {
					vm.legalText += " and ";
				}
				vm.legalText += vm.haveReadText;
				if (vm.legalText !== "") {
					vm.legalText += ".";
				}
			}

		};

		vm.handleLegalItem = function(legalItem) {

			if (ClientConfigService.legal.hasOwnProperty(legalItem)) {
				
				var legal = ClientConfigService.legal[legalItem];
				var legalText = getLegalText(legal);

				if (legal.type === "agreeTo") {
					if (vm.agreeToText === "") {
						vm.agreeToText = "I agree to the " + legalText;
					} else {
						vm.agreeToText += " and the " + legalText;
					}
				} else if (legal.type === "haveRead") {
					if (vm.haveReadText === "") {
						vm.haveReadText = "I have read the " + legalText + " policy";
					} else {
						vm.haveReadText += " and the " + legalText + " policy";
					}
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
				if (event.which === vm.enterKey) {
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
				templateUrl: "templates/legal-dialog.html",
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose:true,
				fullscreen: true,
				scope: $scope,
				preserveScope: true,
				onRemoving: removeDialog
			});
		};

		vm.showPage = function () {
			$location.path("/registerRequest");
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
			var	allowRegister = true,
				allowedFormat = new RegExp(ClientConfigService.usernameRegExp), // English letters, numbers, underscore, not starting with number
				allowedPhone = new RegExp(/^[0-9 ()+-]+$/);

			if (
				(!angular.isDefined(vm.newUser.username)) ||
				(!angular.isDefined(vm.newUser.email)) ||
				(!angular.isDefined(vm.newUser.password)) ||
				(!angular.isDefined(vm.newUser.firstName)) ||
				(!angular.isDefined(vm.newUser.lastName)) ||
				(!angular.isDefined(vm.newUser.company)) ||
				(!angular.isDefined(vm.newUser.jobTitle)) ||
				(vm.newUser.jobTitle === "Other" && !angular.isDefined(vm.newUser.otherJobTitle)) ||
				(!angular.isDefined(vm.newUser.country))

			) {
				vm.registerErrorMessage = "Please fill all required fields";
				return;
			}

			if (!allowedFormat.test(vm.newUser.username)) {
				vm.registerErrorMessage = "Username not allowed: English letters, numbers, underscore allowed only, and must not start 	 with number";
				return;
			}

			if ( vm.newUser.phoneNo && !allowedPhone.test(vm.newUser.phoneNo) ) {
				vm.registerErrorMessage = "Phone number can be blank, or made of numbers and +- characters only";
				return;
			}
		
			if (vm.showLegalText) {
				allowRegister = vm.newUser.tcAgreed;
			}

			if (allowRegister) {
				sendRegistration();
			} else {
				vm.registerErrorMessage = "You must agree to the terms and conditions";
			}
	
		}

		function sendRegistration() {
			var data = {
				email: vm.newUser.email,
				password: vm.newUser.password,
				firstName: vm.newUser.firstName,
				lastName: vm.newUser.lastName,
				company: vm.newUser.company,
				jobTitle: vm.newUser.jobTitle === "Other" ? vm.newUser.otherJobTitle : vm.newUser.jobTitle,
				countryCode: vm.newUser.country,
				phoneNo: vm.newUser.phoneNo
			};

			if (vm.useReCAPTCHA) {
				data.captcha = vm.reCaptchaResponse;
			}
			vm.registering = true;
			APIService.post(vm.newUser.username, data)
				.then(function (response) {
					if (response.status === 200) {
						vm.showPage("registerRequest");
					} else {
						vm.registerErrorMessage = APIService.getErrorMessage(response.data);
					}
					vm.registering = false;
					if (vm.useReCAPTCHA) {
						grecaptcha.reset(); // reset reCaptcha
					}
				})
				.catch(function(response){
					console.error(response);
					vm.registering = false;
					vm.registerErrorMessage = response.data.message;
				});
		}

		function getLegalText(legalItem) {
			return "<a target='_blank' href='/" + legalItem.page + "'>" 
			+ legalItem.title + "</a>";
		}
	}
}());

