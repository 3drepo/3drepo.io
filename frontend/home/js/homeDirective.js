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

    HomeCtrl.$inject = ["$scope", "$element", "$timeout", "$compile", "$mdDialog", "$window", "Auth", "StateManager", "EventService", "UtilsService", "serverConfig"];

    function HomeCtrl($scope, $element, $timeout, $compile, $mdDialog, $window, Auth, StateManager, EventService, UtilsService, serverConfig) {
        var vm = this,
			homeLoggedOut,
			notLoggedInElement,
			element,
			state, func, i;

		/*
		 * Init
		 */
		vm.state = StateManager.state;
		vm.query = StateManager.query;
		vm.functions = StateManager.functions;
		vm.pointerEvents = "inherit";
		vm.goToAccount = false;
		vm.goToUserPage = false;

		vm.legalDisplays = [];
		if (angular.isDefined(serverConfig.legal)) {
			vm.legalDisplays = serverConfig.legal;
		}
		vm.legalDisplays.push({title: "Pricing", page: "pricing"});
		vm.legalDisplays.push({title: "Contact", page: "contact"});

		$timeout(function () {
			homeLoggedOut = angular.element($element[0].querySelector('#homeLoggedOut'));

			/*
			 * Watch the state to handle moving to and from the login page
			 */
			$scope.$watch("vm.state", function (newState, oldState) {
				if (newState !== oldState && !vm.state.changing && vm.state.authInitialized) {
					homeLoggedOut.empty();

					vm.goToUserPage = false;
					for (i = 0; i < vm.functions.length; i++) {
						func = vm.functions[i];

						if (vm.state[func]) {
							vm.goToUserPage = true;
							// Create element
							element = "<" + UtilsService.snake_case(func, "-") +
								" username='vm.query.username'" +
								" token='vm.query.token'" +
								" query='vm.query'>" +
								"</" + UtilsService.snake_case(func, "-") + ">";

							notLoggedInElement = angular.element(element);
							homeLoggedOut.append(notLoggedInElement);
							$compile(notLoggedInElement)($scope);
							break;
						}
					}

					if (!vm.state.loggedIn && !vm.goToUserPage) {
						// Create login element
						notLoggedInElement = angular.element("<login></login>");
						homeLoggedOut.append(notLoggedInElement);
						$compile(notLoggedInElement)($scope);
					}
				}
			}, true);
		});

		if (angular.isDefined(vm.account) && angular.isDefined(vm.password))
		{
			Auth.login(vm.account, vm.password);
		}

        vm.logout = function () {
            Auth.logout();
        };

		vm.home = function () {
			EventService.send(EventService.EVENT.GO_HOME);
		};

		/**
		 * Display legal text
		 *
		 * @param event
		 * @param display
		 */
		vm.legalDisplay = function (event, display) {
			$window.open("/" + display.value);
		};

		$scope.$watch(EventService.currentEvent, function(event) {
			if (angular.isDefined(event) && angular.isDefined(event.type)) {
				if (event.type === EventService.EVENT.USER_LOGGED_IN)
				{
					if (!event.value.error)
					{
						if(!event.value.initialiser) {
							StateManager.setStateVar("loggedIn", true);
							EventService.send(EventService.EVENT.GO_HOME);
						}
					}
				} else if (event.type === EventService.EVENT.USER_LOGGED_OUT) {
					EventService.send(EventService.EVENT.CLEAR_STATE);
					EventService.send(EventService.EVENT.SET_STATE, { loggedIn: false, account: null });
				} else if (event.type === EventService.EVENT.SHOW_PROJECTS) {
					EventService.send(EventService.EVENT.CLEAR_STATE);
					Auth.init();
				} else if (event.type === EventService.EVENT.GO_HOME) {
					EventService.send(EventService.EVENT.CLEAR_STATE);

					if (StateManager.state.loggedIn) {
						EventService.send(EventService.EVENT.SET_STATE, { account: Auth.username });
					} else {
						EventService.send(EventService.EVENT.SET_STATE, {});
					}
				}
				else if (event.type === EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING) {
					vm.pointerEvents = event.value.on ? "none" : "inherit";
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

