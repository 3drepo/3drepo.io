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
        .directive("passwordForgot", passwordForgot);

    function passwordForgot() {
        return {
            restrict: "E",
            scope: {},
            templateUrl: "passwordForgot.html",
            controller: PasswordForgotCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    PasswordForgotCtrl.$inject = ["$scope", "PasswordForgotService"];

    function PasswordForgotCtrl ($scope, PasswordForgotService) {
        var vm = this,
            promise,
            messageColour = "rgba(0, 0, 0, 0.7)",
            messageErrorColour = "#F44336";
        
        /*
         * Init
         */
        vm.showProgress = false;

        /*
         * Watch inputs to clear any message
         */
        $scope.$watchGroup(["vm.username", "vm.email"], function () {
            vm.message = "";
        });

        /**
         * Process forgotten password recovery
         */
        vm.requestPasswordChange = function () {
            if (angular.isDefined(vm.username) && angular.isDefined(vm.email)) {
                vm.messageColor = messageColour;
                vm.message = "Please wait...";
                vm.showProgress = true;
                promise = PasswordForgotService.forgot(vm.username, {email: vm.email});
                promise.then(function (response) {
                    vm.showProgress = false;
                    if (response.status === 200) {
                        vm.verified = true;
                        vm.messageColor = messageColour;
                        vm.message = "Thank you. You will receive an email shortly with a link to change your password";
                    }
                    else {
                        vm.messageColor = messageErrorColour;
                        vm.message = "Error with with one or more fields";
                    }
                });
            }
            else {
                vm.messageColor = messageErrorColour;
                vm.message = "All fields must be filled";
            }
        };
    }
}());
