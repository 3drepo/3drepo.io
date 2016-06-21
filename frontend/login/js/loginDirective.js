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
		.directive("login", login)
		.directive("mdInputContainer", mdInputContainer);

	function login() {
		return {
			restrict: "EA",
			templateUrl: "login.html",
			scope: {},
			controller: LoginCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	LoginCtrl.$inject = ["$scope", "$mdDialog", "$location", "Auth", "EventService", "serverConfig"];

	function LoginCtrl($scope, $mdDialog, $location, Auth, EventService, serverConfig) {
		var vm = this,
			enterKey = 13,
			promise;

		/*
		 * Init
		 */
		vm.user = {username: "", password: ""};
		vm.newUser = {username: "", email: "", password: "", tcAgreed: false};
		vm.version = serverConfig.apiVersion;
		vm.logo = "/public/images/3drepo-logo-white.png";
		vm.captchaKey = "6LfSDR8TAAAAACBaw6FY5WdnqOP0nfv3z8-cALAI";
		vm.tcAgreed = false;
		vm.useReCapthca = false;
		vm.useRegister = false;
		vm.registering = false;

		/*
		 * Auth stuff
		 */
		console.log(serverConfig);
		if (serverConfig.hasOwnProperty("auth")) {
			if (serverConfig.auth.hasOwnProperty("register") && (serverConfig.auth.register)) {
				vm.useRegister = true;
				if (serverConfig.auth.hasOwnProperty("captcha") && (serverConfig.auth.captcha)) {
					vm.useReCapthca = true;
				}
			}
		}

		// Logo
		if (angular.isDefined(serverConfig.backgroundImage))
		{
			vm.enterpriseLogo = serverConfig.backgroundImage;
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
		 * Attempt to login
		 *
		 * @param {Object} event
		 */
		vm.login = function(event) {
			if (angular.isDefined(event)) {
				if (event.which === enterKey) {
					Auth.login(vm.user.username, vm.user.password);
				}
			}
			else {
				Auth.login(vm.user.username, vm.user.password);
			}
		};
		
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

		/*
		 * Event watch
		 */
		$scope.$watch(EventService.currentEvent, function(event) {
			if (event.type === EventService.EVENT.USER_LOGGED_IN) {
				// Show an error message for incorrect login
				if (event.value.hasOwnProperty("error") && (event.value.error.place.indexOf("POST") !== -1)) {
					vm.errorMessage = event.value.error.message;
				}
			}
		});

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
						password: vm.newUser.password
					};
					if (vm.useReCapthca) {
						data.captcha = vm.reCaptchaResponse;
					}
					vm.registering = true;
					promise = LoginService.register(vm.newUser.username, data);
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

	/**
	 * Re-make md-input-container to get around the problem discussed here https://github.com/angular/material/issues/1376
	 * Taken from mikila85's version of blaise-io's workaround
	 * 
	 * @param $timeout
	 * @returns {Function}
	 */
	function mdInputContainer ($timeout) {
		return function ($scope, element) {
			var ua = navigator.userAgent;
			if (ua.match(/chrome/i) && !ua.match(/edge/i)) {
				$timeout(function () {
					if (element[0].querySelector("input[type=password]:-webkit-autofill")) {
						element.addClass("md-input-has-value");
					}
				}, 100);
			}
		};
	}
}());
