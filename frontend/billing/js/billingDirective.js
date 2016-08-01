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
		.directive("billing", billing);

	function billing() {
		return {
			restrict: "E",
			scope: {
				query: "="
			},
			templateUrl: "billing.html",
			controller: BillingCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BillingCtrl.$inject = ["EventService", "UtilsService", "serverConfig"];

	function BillingCtrl (EventService, UtilsService, serverConfig) {
		var vm = this,
			billingsPromise,
			i, length,
			euCountryCodes = [
				"BE", "BG", "CZ", "DK", "DE", "EE", "IE", "EL", "ES", "FR", "HR", "IT", "CY", "LV", "LT",
				"LU", "HU", "MT", "NL", "AT", "PL", "PT", "RO", "SI", "SK", "FI", "SE"
			];

		/*
		 * Init
		 */
		vm.showBilling = false;
		vm.B2B_EU = false;

		if (vm.query.hasOwnProperty("user") && vm.query.hasOwnProperty("item")) {
			billingsPromise = UtilsService.doGet(vm.query.user + "/billings");
			billingsPromise.then(function (response) {
				console.log("**billings**", response);
				if ((response.data.length > 0) &&
					(parseInt(vm.query.item) >= 0) &&
					(parseInt(vm.query.item) < response.data.length)) {
					vm.showBilling = true;
					vm.billing = response.data[parseInt(vm.query.item)];
					console.log('periodEnd', vm.billing.periodEnd);
					vm.billing.netAmount = vm.billing.amount- vm.billing.taxAmount;
					vm.billing.taxPercentage = Math.round(vm.billing.taxAmount / vm.billing.netAmount * 100);

					// Check if B2B EU
					vm.B2B_EU = (euCountryCodes.indexOf(vm.billing.info.countryCode) !== -1);

					// Check if pro-forma
					vm.billing.status = "pending";
					vm.proForma = (vm.billing.status === "pending");

					// Get country from country code
					if (serverConfig.hasOwnProperty("countries")) {
						for (i = 0, length = serverConfig.countries.length; i < length; i += 1) {
							if (serverConfig.countries[i].code === vm.billing.info.countryCode) {
								vm.billing.info.country = serverConfig.countries[i].name;
								break;
							}
						}
					}
				}
			});
		}

		vm.home = function () {
			EventService.send(EventService.EVENT.GO_HOME);
		};

		vm.print = function () {
			window.print();
		};
	}
}());
