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
        .component("passwordForgot", {
            restrict: "E",
            bindings: {},
            templateUrl: "passwordForgot.html",
            controller: PasswordForgotCtrl,
            controllerAs: "vm"
        });

    PasswordForgotCtrl.$inject = ["$scope", "UtilsService"];

    function PasswordForgotCtrl ($scope, UtilsService) {
        var vm = this,
            promise,
            messageColour = "rgba(0, 0, 0, 0.7)",
            messageErrorColour = "#F44336";
        
        /*
         * Init
         */
        vm.$onInit = function() {
            vm.showProgress = false;
        }

        /*
         * Watch inputs to clear any message
         */
        $scope.$watchGroup(["vm.username", "vm.email"], function () {
            vm.message = "";
        });

        /**
         * Process forgotten password recovery
         */
        vm.requestPasswordChange = function (event) {
            var enterKey = 13,
                requestChange = false;

            if (angular.isDefined(event)) {
                requestChange = (event.which === enterKey);
            }
            else {
                requestChange = true;
            }

            if (requestChange) {
                if (vm.username && vm.email) {
                    vm.messageColor = messageColour;
                    vm.message = "Please wait...";
                    vm.showProgress = true;
                    promise = UtilsService.doPost({email: vm.email}, vm.username + "/forgot-password");
                    promise.then(function (response) {
                        vm.showProgress = false;
                        if (response.status === 200) {
                            vm.verified = true;
                            vm.messageColor = messageColour;
                            vm.message = "Thank you. You will receive an email shortly with a link to change your password";
                        }
                        else {
                            vm.messageColor = messageErrorColour;
                            vm.message = response.data.message;
                        }
                    });
                }
                else {
                    vm.messageColor = messageErrorColour;
                    vm.message = "Missing username or email";
                }
            }
        };
    }
}());
