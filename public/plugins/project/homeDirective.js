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
				
				mdThemingProvider.theme("default")
                .primaryPalette("indigo", {
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
            template: "<div ng-if='!hm.loggedIn')>" +
			          "<div ng-include='hm.getLoggedOutUrl()'></div>" + 
					  "</div>" + 
					  "<div ng-if='hm.loggedIn'>" + 
					  "<div ng-include='hm.getLoggedInUrl()'></div>" +
					  "</div>",
			scope: { 
				account: "@",
				password: "@",
				loggedInUrl: "@",
				loggedOutUrl: "@"
			},
            controller: HomeCtrl,
            controllerAs: "hm",
            bindToController: true
        };
    }

    HomeCtrl.$inject = ["$scope", "Auth", "StateManager"];

    function HomeCtrl($scope, Auth, StateManager) {
        var hm = this;
		
		hm.loggedIn = false;
		
		hm.getLoggedInUrl = function() {
			return hm.loggedInUrl;
		};

		hm.getLoggedOutUrl = function() {
			return hm.loggedOutUrl;
		};
		
		if (angular.isDefined(hm.account) && angular.isDefined(hm.password))
		{
			Auth.login(hm.account, hm.password).then( function () {
				hm.loggedIn = true;
			});
		}

        hm.logout = function () {
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

