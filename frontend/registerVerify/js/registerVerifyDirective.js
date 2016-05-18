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
        .directive("registerVerify", registerVerify);

    function registerVerify() {
        return {
            restrict: "E",
            scope: {
                username: "=",
                token: "="
            },
            templateUrl: "registerVerify.html",
            controller: RegisterVerifyCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    RegisterVerifyCtrl.$inject = ["$scope", "$location", "RegisterVerifyService"];

    function RegisterVerifyCtrl ($scope, $location, RegisterVerifyService) {
        var vm = this,
            promise;

        /*
         * Init
         */
        vm.verified = false;

        /*
         * Watch the token value
         */
        $scope.$watchGroup(["vm.username", "vm.token"], function () {
            if (angular.isDefined(vm.username) && angular.isDefined(vm.token)) {
                vm.verifyErrorMessage = "Verifying. Please wait...";
                promise = RegisterVerifyService.verify(vm.username, {token: vm.token});
                promise.then(function (response) {
                    if (response.status === 200) {
                        vm.verified = true;
                        vm.verifySuccessMessage = "Congratulations. You have successfully registered for 3D Repo. You may now login to you account.";
                    }
                    else if (response.data.value === 60) {
                        vm.verified = true;
                        vm.verifySuccessMessage = "You have already verified your account successfully. You may now login to your account.";
                    }
                    else {
                        vm.verifyErrorMessage = "Error with verification";
                    }
                });
            }
        });

        vm.goToLoginPage = function () {
            $location.path("/", "_self");
        };
    }
}());
