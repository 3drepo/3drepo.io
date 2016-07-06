/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
    "use strict";

    angular.module("3drepo")
        .directive("home", home)
        .config(function($injector)
		{
			if ($injector.has("$mdThemingProvider"))
			{
				var mdThemingProvider = $injector.get("$mdThemingProvider");

				mdThemingProvider.definePalette('three_d_repo_primary', {
					'50': '004594',
					'100': '004594',
					'200': '004594',
					'300': '004594',
					'400': '004594',
					'500': '004594',
					'600': '004594',
					'700': '004594',
					'800': '004594',
					'900': '004594',
					'A100': '004594',
					'A200': '004594',
					'A400': '004594',
					'A700': '004594',
					'contrastDefaultColor': 'light',
					'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
					'contrastLightColors': undefined
				});

				mdThemingProvider.theme("default")
                .primaryPalette("three_d_repo_primary", {
					"default": "500",
					"hue-1": "400",
					"hue-2": "200",
					"hue-3": "50"
				})
                .accentPalette("green", {
                    "default": "600"
                })
                .warnPalette("red");
			}
        });

    function home() {
        return {
            restrict: "E",
            templateUrl: "home.html",
			scope: {
				account: "@",
				password: "@",
				loggedInUrl: "@",
				loggedOutUrl: "@"
			},
            controller: HomeCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    HomeCtrl.$inject = ["$scope", "$element", "$timeout", "$compile", "$mdDialog", "$location", "Auth", "StateManager", "EventService", "UtilsService", "AccountService"];

    function HomeCtrl($scope, $element, $timeout, $compile, $mdDialog, $location, Auth, StateManager, EventService, UtilsService, AccountService) {
        var vm = this,
			goToUserPage,
			goToAccount,
			homeLoggedOut,
			homeLoggedIn,
			notLoggedInElement,
			loggedInElement,
			element,
			state,
			useState,
			promise;

		/*
		 * Init
		 */
		vm.state = StateManager.state;
		vm.legalDisplays = [
			{title: "Terms & Conditions", value: "termsAndConditions"},
			{title: "Privacy", value: "privacy"},
			{title: "Cookies", value: "cookies"},
			{title: "Contact", value: "contact"}
		];
		vm.goToAccount = false;

		/*
		 * Watch the state to handle moving to and from the login page
		 */
		$scope.$watch("vm.state", function () {
			console.log(666, vm.state);
			if (vm.state.hasOwnProperty("loggedIn") && vm.state.hasOwnProperty("changing") && vm.state.changing) {
				if (!vm.state.loggedIn) {
					$timeout(function () {
						homeLoggedOut = angular.element($element[0].querySelector('#homeLoggedOut'));
						homeLoggedOut.empty();

						goToUserPage = false;
						for (state in vm.state) {
							if (vm.state.hasOwnProperty(state)) {
								if (vm.state[state] === true) {
									goToUserPage = true;
									// username and token only required for some pages
									vm.username = vm.state.username;
									vm.token = vm.state.token;
									// Create element
									element = "<" + UtilsService.snake_case(state, "-") +
										" username='vm.username'" +
										" token='vm.token'>" +
										"</" + UtilsService.snake_case(state, "-") + ">";
									notLoggedInElement = angular.element(element);
									homeLoggedOut.append(notLoggedInElement);
									$compile(notLoggedInElement)($scope);
									break;
								}
							}
						}

						if (!goToUserPage) {
							// Create login element
							notLoggedInElement = angular.element("<login></login>");
							homeLoggedOut.append(notLoggedInElement);
							$compile(notLoggedInElement)($scope);
							
							// Set the URL to root if it is not root
							$location.path("/", "_self");
						}
					});
				}
				else {
					$timeout(function () {
						homeLoggedIn = angular.element($element[0].querySelector('#homeLoggedIn'));
						homeLoggedIn.empty();
						goToAccount = false;
						goToUserPage = false;
						for (state in vm.state) {
							if (vm.state.hasOwnProperty(state) && (state !== "loggedIn")) {
								if (vm.state[state] === true) {
									goToUserPage = true;
									useState = state;
								}
								else if (typeof vm.state[state] === "string") {
									goToAccount = true;
								}
							}
						}
						if ((goToUserPage) || (goToAccount)) {
							if (goToUserPage) {
								vm.goToAccount = false;
								element = "<" + UtilsService.snake_case(useState, "-") + "></" + UtilsService.snake_case(useState, "-") + ">";
								loggedInElement = angular.element(element);
								homeLoggedIn.append(loggedInElement);
								$compile(loggedInElement)($scope);
							}
							else {
								promise = AccountService.getUserInfo(StateManager.state.account);
								promise.then(function (response) {
									// Response with data.type indicates it's not the user's account
									if (!response.data.hasOwnProperty("type")) {
										vm.goToAccount = true;
									}
									else {
										// Logout if trying to view another account
										Auth.logout();
									}
								});
							}
						}
						else {
							// Prevent user going back to the login page after logging in
							$location.path("/" + localStorage.getItem("tdrLoggedIn"), "_self");
						}
					});
				}
			}
		}, true);

		vm.getLoggedInUrl = function() {
			return vm.loggedInUrl;
		};

		vm.getLoggedOutUrl = function() {
			return vm.loggedOutUrl;
		};

		if (angular.isDefined(vm.account) && angular.isDefined(vm.password))
		{
			Auth.login(vm.account, vm.password);
		}

        vm.logout = function () {
            Auth.logout();
        };

		/**
		 * Display legal text
		 * 
		 * @param event
		 * @param display
		 */
		vm.legalDisplay = function (event, display) {
			$location.path("/" + display.value, "_self");
			/*
			vm.legalTitle = display.title;
			vm.legalText = display.value;
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
			*/
		};

		$scope.$watch(EventService.currentEvent, function(event) {
			if (angular.isDefined(event) && angular.isDefined(event.type)) {
				if (event.type === EventService.EVENT.USER_LOGGED_IN)
				{
					var account = StateManager.state.account ? StateManager.state.account : event.value.username;
					if (!event.value.error)
					{
						if (!event.value.initialiser)
						{
							EventService.send(EventService.EVENT.SET_STATE, { loggedIn: true, account: account });
						}
					}
				} else if (event.type === EventService.EVENT.USER_LOGGED_OUT) {
					EventService.send(EventService.EVENT.SET_STATE, { loggedIn: false, account: null });
				} else if (event.type === EventService.EVENT.SHOW_PROJECTS) {
					StateManager.clearState();
					Auth.init();
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
    }
}());

