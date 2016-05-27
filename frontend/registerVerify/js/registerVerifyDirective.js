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
            scope: {},
            templateUrl: "registerVerify.html",
            controller: RegisterVerifyCtrl,
            controllerAs: "vm",
            bindToController: true
        };
    }

    RegisterVerifyCtrl.$inject = ["$location", "RegisterVerifyService", "AccountService"];

    function RegisterVerifyCtrl ($location, RegisterVerifyService, AccountService) {
        var vm = this,
            promise,
            username = $location.search().username,
            token = $location.search().token;

        /*
         * Init
         */
        vm.verified = false;
        vm.showPaymentWait = false;
        vm.databaseName = username;
        vm.pay = (($location.search().hasOwnProperty("pay")) && $location.search().pay);

        vm.verifyErrorMessage = "Verifying. Please wait...";
        promise = RegisterVerifyService.verify(username, {token: token});
        promise.then(function (response) {
            console.log(response);
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

        vm.goToLoginPage = function () {
            $location.path("/", "_self");
        };

        vm.setupPayment = function ($event) {
            if (vm.databaseName !== "") {
                // Create database with username if paying
                if (vm.pay) {
                    promise = AccountService.newDatabase(username, vm.databaseName);
                    promise.then(function (response) {
                        vm.newDatabaseToken = response.data.token;
                        vm.paypalReturnUrl = $location.protocol() + "://" + $location.host();
                        console.log(vm.paypalReturnUrl);
                    });
                }
                vm.showPaymentWait = true;
            }
            else {
                $event.stopPropagation();
                vm.error = "Please provide a database name";
            }
        };

        vm.test = function () {
            
        }
    }
}());
