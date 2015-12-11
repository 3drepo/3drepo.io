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
        .config(function($mdThemingProvider) {
            $mdThemingProvider.theme('default')
                .primaryPalette('indigo', {
                    'default': '500',
                    'hue-1': '400',
                    'hue-2': '200',
                    'hue-3': '50'
                })
                .accentPalette('green', {
                    'default': '600'
                })
                .warnPalette('red');
        });

    function home() {
        return {
            restrict: 'E',
            templateUrl: 'home.html',
            scope: {},
            controller: HomeCtrl,
            controllerAs: 'vm',
            bindToController: true
        };
    }

    HomeCtrl.$inject = ["$scope", "$window", "$timeout", "Auth", "StateManager", "EventService"];

    function HomeCtrl($scope, $window, $timeout, Auth, StateManager, EventService) {
        var vm = this,
			initialWindowHeight = $window.innerHeight;
		vm.window = $window;
		console.log(Auth);

		// TODO Improve way to send initial event without timeout pause
		$timeout(function () {
			sendWindowHeightChangeEvent(initialWindowHeight);
		}, 1000);

		$scope.$watch("vm.window.innerHeight", function (newValue) {
			sendWindowHeightChangeEvent(newValue);
		});

		function sendWindowHeightChangeEvent (height) {
			EventService.send(
				EventService.EVENT.WINDOW_HEIGHT_CHANGE,
				{height: height, change: (initialWindowHeight - height)}
			);
		}

        vm.logout = function () {
            Auth.logout().then(
                function _logoutCtrlLogoutSuccess () {
                    $scope.errorMessage = null;
                    StateManager.state.account = null;
                    StateManager.updateState();
                },
                function _logoutCtrlLogoutFailure (reason) {
                    $scope.errorMessage = reason;
                    StateManager.updateState();
                }
            );
        };
    }
}());

