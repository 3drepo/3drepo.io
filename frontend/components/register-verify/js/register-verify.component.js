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
		.component("registerVerify", {
			restrict: "E",
			bindings: {},
			templateUrl: "templates/register-verify.html",
			controller: RegisterVerifyCtrl,
			controllerAs: "vm"
		});

	RegisterVerifyCtrl.$inject = ["EventService", "APIService", "StateManager", "$window"];

	function RegisterVerifyCtrl (EventService, APIService, StateManager, $window) {
		var vm = this;
			

		/*
         * Init
         */
		vm.$onInit = function() {

			if (StateManager && StateManager.query &&
				StateManager.query.username && StateManager.query.token
			) {

				vm.username = StateManager.query.username,
				vm.token = StateManager.query.token;
				vm.verified = false;
				vm.showPaymentWait = false;
				vm.databaseName = vm.username;
	
				vm.verifyErrorMessage = "Verifying. Please wait...";
				APIService.post(vm.username + "/verify", { token: vm.token})
					.then(function (response) {
						if (response.status === 200) {
							vm.verified = true;
							vm.verifySuccessMessage = "Congratulations. You have successfully signed up for 3D Repo. You may now login to you account.";
						} else if (response.data.code === "ALREADY_VERIFIED") {
							vm.verified = true;
							vm.verifySuccessMessage = "You have already verified your account successfully. You may now login to your account.";
						} else {
							vm.verifyErrorMessage = "Error with verification";
						}
					});
			
			} else {
				vm.verifyErrorMessage = "Can't verify: Token and/or Username not provided";
			}
			
			
		};

		vm.goToLoginPage = function () {
			$window.location.href = "/";
		};
	}
}());
