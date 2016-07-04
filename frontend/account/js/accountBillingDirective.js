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
		.directive("accountBilling", accountBilling);

	function accountBilling() {
		return {
			restrict: 'EA',
			templateUrl: 'accountBilling.html',
			scope: {
				showPage: "&"
			},
			controller: AccountBillingCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountBillingCtrl.$inject = ["$scope", "$http", "$location"];

	function AccountBillingCtrl($scope, $http, $location) {
		var vm = this,
			pricePerLicense = 100,
			quotaPerLicense = 10,
			initData = {
				licenses: 2,
				postalCode: "LS11 8QT",
				country: "United Kingdom",
				vatNumber: "12398756"
			};

		/*
		 * Init
		 */
		vm.showInfo = true;
		vm.quotaUsed = 17.3;
		vm.quotaAvailable = Math.round(((initData.licenses * quotaPerLicense) - vm.quotaUsed) * 10) / 10; // Round to 1 decimal place
		vm.numCurrentLicenses = initData.licenses;
		vm.newData = angular.copy(initData);
		vm.saveButtonDisabled = true;
		vm.billingHistory = [
			{"Date": "10/04/2016", "Description": "1st payment", "Payment Method": "PayPal", "Amount": 100},
			{"Date": "10/05/2016", "Description": "2nd payment", "Payment Method": "PayPal", "Amount": 100},
			{"Date": "10/06/2016", "Description": "3rd payment", "Payment Method": "PayPal", "Amount": 100}
		];
		$http.get("/public/data/countries.json").then(function (response) {
			vm.countries = response.data;
		});

		$scope.$watch("vm.newData", function () {
			console.log(vm.newData);
			if (vm.newData.licenses !== "undefined") {
				vm.priceLicenses = vm.newData.licenses * pricePerLicense;
				vm.saveButtonDisabled = angular.equals(initData, vm.newData);
			}
			else {
				vm.saveButtonDisabled = false;
			}
		}, true);

		/**
		 * Show the billing page with the item
		 *
		 * @param index
		 */
		vm.downloadBilling = function (index) {
			$location.path("/billing", "_self")
				.search({}) // Clear all parameters
				.search("item", index);
		};
	}
}());
