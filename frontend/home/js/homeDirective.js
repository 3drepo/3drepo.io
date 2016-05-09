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

    HomeCtrl.$inject = ["$scope", "Auth", "StateManager", "EventService"];

    function HomeCtrl($scope, Auth, StateManager, EventService) {
        var vm = this;

		vm.state = StateManager.state;

		$scope.$watch("vm.state", function () {
			if (angular.isDefined(vm.state.registerRequest) && (vm.state.registered !== null)) {
				vm.notLoggedInToShow = "showRegisterRequest";
			}
			else if (angular.isDefined(vm.state.registerVerify) && (vm.state.registerVerify !== null)) {
				vm.username = vm.state.username;
				vm.token = vm.state.token;
				vm.notLoggedInToShow = "showRegisterVerify";
			}
			else if (angular.isDefined(vm.state.passwordForgot) && (vm.state.registered !== null)) {
				vm.notLoggedInToShow = "showPasswordForgot";
			}
			else if (angular.isDefined(vm.state.passwordChange) && (vm.state.registered !== null)) {
				vm.username = vm.state.username;
				vm.token = vm.state.token;
				vm.notLoggedInToShow = "showPasswordChange";
			}
			else {
				vm.notLoggedInToShow = "showLogin";
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
				} else if (event.type === EventService.EVENT.VIEWER.LOGO_CLICK) {
					console.log("Click logo");
					StateManager.clearState();
					Auth.init();
				}
			}
		});
    }
}());

