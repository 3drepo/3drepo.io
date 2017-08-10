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

	RegisterVerifyCtrl.$inject = ["EventService", "UtilsService", "StateManager"];

	function RegisterVerifyCtrl (EventService, UtilsService, StateManager) {
		var vm = this,
			promise,
			username = StateManager.query.username,
			token = StateManager.query.token;

		/*
         * Init
         */
		vm.$onInit = function() {

			vm.verified = false;
			vm.showPaymentWait = false;
			vm.databaseName = username;

			vm.verifyErrorMessage = "Verifying. Please wait...";
			promise = UtilsService.doPost({token: token}, username + "/verify");
			promise.then(function (response) {
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
		};

		vm.goToLoginPage = function () {
			EventService.send(EventService.EVENT.GO_HOME);
		};
	}
}());
