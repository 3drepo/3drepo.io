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

    RegisterVerifyCtrl.$inject = ["$scope", "$location", "RegisterVerifyService", "AccountService"];

    function RegisterVerifyCtrl ($scope, $location, RegisterVerifyService, AccountService) {
        var vm = this,
            promise,
            username = $location.search().username,
            pay = (($location.search().hasOwnProperty("pay")) && $location.search().pay);

        /*
         * Init
         */
        vm.verified = false;
        vm.showPaymentWait = false;
        vm.paypalReturnUrl = "http://3drepo.io/";
        vm.databaseName = vm.username;

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
                        vm.verifySuccessMessage = "Congratulations. You have successfully signed up for 3D Repo. You may now login to you account.";
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

        vm.setupPayment = function ($event) {
            console.log(1);
            if (vm.databaseName !== "") {
                console.log(2);
                // Create database with username if paying
                if (pay) {
                    promise = AccountService.newDatabase(username, username);
                    promise.then(function (response) {
                        console.log(response);
                        vm.newDatabaseToken = response.data.token;
                    });
                }
                vm.showPaymentWait = true;
            }
            else {
                console.log(3);
                $event.stopPropagation();
                vm.error = "Please provide a database name";
            }
        };
    }
}());
