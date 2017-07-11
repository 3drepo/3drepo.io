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
        .config(["$injector", function($injector)
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
        }]);

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

    HomeCtrl.$inject = ["$scope", "$element", "$interval", "$timeout", "$compile", "$mdDialog", "$window", "Auth", "StateManager", "EventService", "UtilsService", "serverConfig", "$location"];

    function HomeCtrl($scope, $element, $interval, $timeout, $compile, $mdDialog, $window, Auth, StateManager, EventService, UtilsService, serverConfig, $location) {
        var vm = this,
			homeLoggedOut,
			notLoggedInElement,
			element,
			state, func, i;

		/*
		 * Init
		 */
		vm.$onInit = function() {
			vm.state = StateManager.state;
			vm.query = StateManager.query;
			vm.functions = StateManager.functions;
			vm.pointerEvents = "inherit";
			vm.goToAccount = false;
			vm.goToUserPage = false;
			vm.keysDown = [];

			vm.legalDisplays = [];
			if (angular.isDefined(serverConfig.legal)) {
				vm.legalDisplays = serverConfig.legal;
			}
			vm.legalDisplays.push({title: "Pricing", page: "http://3drepo.org/pricing"});
			vm.legalDisplays.push({title: "Contact", page: "http://3drepo.org/contact/"});

			// Pages to not attempt a interval triggered logout from
			vm.doNotLogout = [
				"/terms", 
				"/privacy",
				"/signUp", 
				"/passwordForgot", 
				"/registerRequest", 
				"/registerVerify"
			];

			$timeout(function () {
				var login = angular.element("<login></login>");
				var elementRef, elementScope;
				homeLoggedOut = angular.element($element[0].querySelector('#homeLoggedOut'));
				EventService.send(EventService.EVENT.CREATE_VIEWER, {
					name: "default",
				});
				/*
				* Watch the state to handle moving to and from the login page
				*/
				$scope.$watch("vm.state", function (newState, oldState) {

					if (newState !== oldState && !vm.state.changing && vm.state.authInitialized) {

						if (elementRef)
						{
							elementRef.remove();
							elementScope.$destroy();
						}

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
								elementScope = $scope.$new();
								elementRef = $compile(notLoggedInElement)(elementScope);
								break;
							}
						}

						if (!vm.state.loggedIn && !vm.goToUserPage) {
							// Create login element
							notLoggedInElement = login;
							homeLoggedOut.append(notLoggedInElement);
							elementScope = $scope.$new();
							elementRef = $compile(notLoggedInElement)(elementScope);
						}
					}
				}, true);

			});

			if (angular.isDefined(vm.account) && angular.isDefined(vm.password))
			{
				Auth.login(vm.account, vm.password);
			}

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
							EventService.send(EventService.EVENT.UPDATE_STATE);

							if(!StateManager.state.account){
								EventService.send(EventService.EVENT.SET_STATE, { account: Auth.username });
							}
						}
					} else {

						EventService.send(EventService.EVENT.USER_LOGGED_OUT);
					
					}
				} else if (event.type === EventService.EVENT.USER_LOGGED_OUT) {
					
					// Only fire the Logout Event if we're on the home page
					var currentPage = $location.path();
					//console.log("currentPage", currentPage)
					if (vm.doNotLogout.indexOf(currentPage) === -1) {
						EventService.send(EventService.EVENT.CLEAR_STATE);
						EventService.send(EventService.EVENT.SET_STATE, { loggedIn: false, account: null });
					}

				} else if (event.type === EventService.EVENT.SHOW_MODELS) {
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
		 * Keep a list of keys held down
		 * For changes to be registered by directives and especially components the list needs to be recreated
		 *
		 * @param event
		 */
		vm.keyAction = function (event) {
			var i, tmp;
			// Update list, but avoid repeat
			if (event.type === "keydown") {
				if (vm.keysDown.indexOf(event.which) === -1) {
					// Recreate list so that it changes are registered in components
					tmp = vm.keysDown;
					delete vm.keysDown;
					vm.keysDown = angular.copy(tmp);
					vm.keysDown.push(event.which);
				}
			}
			else if (event.type === "keyup") {
				// Remove all instances of the key (multiple instances can happen if key up wasn't registered)
				for (i = (vm.keysDown.length - 1); i >= 0; i -= 1) {
					if (vm.keysDown[i] === event.which) {
						vm.keysDown.splice(i, 1);
					}
				}
				// Recreate list so that it changes are registered in components
				tmp = vm.keysDown;
				delete vm.keysDown;
				vm.keysDown = angular.copy(tmp);
			}
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
    }
}());

