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
				account: "=",
				billingAddress: "=",
				quota: "=",
				billings: "=",
				subscriptions: "=",
				plans: "="
			},
			controller: AccountBillingCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountBillingCtrl.$inject = ["$scope", "$location", "$timeout", "UtilsService", "serverConfig"];

	function AccountBillingCtrl($scope, $location, $timeout, UtilsService, serverConfig) {
		var vm = this,
			promise;

		/*
		 * Init
		 */
		if ($location.search().hasOwnProperty("cancel")) {
			// Cancelled out of PayPal
			init();
		}
		else if ($location.search().hasOwnProperty("token")) {
			vm.payPalInfo = "PayPal payment processing. Please do not refresh the page or close the tab.";
			UtilsService.showDialog("paypalDialog.html", $scope);
			promise = UtilsService.doPost({token: ($location.search()).token}, "payment/paypal/execute");
			promise.then(function (response) {
				console.log("payment/paypal/execute ", response);
				if (response.status === 200) {
				}
				vm.payPalInfo = "PayPal has finished processing. Thank you.";
				$timeout(function () {
					UtilsService.closeDialog();
					init();
				}, 2000);
			});
		}
		else {
			init();
		}

		/**
		 * Initialise data
		 */
		function init () {
			vm.showInfo = true;
			vm.saveDisabled = true;
			vm.countries = serverConfig.countries;
		}

		/*
		 * Watch for change in licenses
		 */
		$scope.$watch("vm.numNewLicenses", function () {
			if (angular.isDefined(vm.numNewLicenses)) {
				if (vm.numLicenses === vm.numNewLicenses) {
					vm.saveDisabled = angular.equals(vm.newBillingAddress, vm.billingAddress) || aRequiredAddressFieldIsEmpty();
				}
				else {
					vm.saveDisabled = aRequiredAddressFieldIsEmpty();
				}
				vm.priceLicenses = vm.numNewLicenses * vm.pricePerLicense;
			}
			else {
				vm.saveDisabled = true;
			}
		});

		/*
		 * Watch passed billing address
		 */
		$scope.$watch("vm.billingAddress", function () {
			if (angular.isDefined(vm.billingAddress)) {
				vm.newBillingAddress = angular.copy(vm.billingAddress);
			}
		}, true);

		/*
		 * Watch for change in billing info
		 */
		$scope.$watch("vm.newBillingAddress", function () {
			if (angular.isDefined(vm.newBillingAddress)) {
				if (vm.numNewLicenses !== 0) {
					vm.saveDisabled = angular.equals(vm.newBillingAddress, vm.billingAddress) || aRequiredAddressFieldIsEmpty();
				}
			}
		}, true);

		/*
		 * Watch for subscriptions
		 */
		$scope.$watch("vm.subscriptions", function () {
			if (angular.isDefined(vm.subscriptions) && angular.isDefined(vm.plans)) {
				setupLicensesInfo();
			}
		}, true);

		/*
		 * Watch for plans
		 */
		$scope.$watch("vm.plans", function () {
			if (angular.isDefined(vm.subscriptions) && angular.isDefined(vm.plans)) {
				setupLicensesInfo();
			}
		}, true);

		/**
		 * Show the billing page with the item
		 *
		 * @param index
		 */
		vm.downloadBilling = function (index) {
			$location.url("/billing?user=" + vm.account + "&item=" + index);
		};

		vm.changeSubscription = function () {
			var data = {
				plans: [{
					plan: "THE-100-QUID-PLAN",
					quantity: vm.numNewLicenses
				}],
				billingAddress: vm.newBillingAddress
			};

			vm.payPalInfo = "Redirecting to PayPal. Please do not refresh the page or close the tab.";
			UtilsService.showDialog("paypalDialog.html", $scope, null, true);
			promise = UtilsService.doPost(data, vm.account + "/subscriptions");
			promise.then(function (response) {
				console.log(response);
				if (response.status === 200) {
					location.href = response.data.url;
				}
				else {
					vm.changeHelpToShow = response.data.value;
					vm.payPalInfo = response.data.message;
				}
			});
		};

		vm.goToPage = function (page) {
			$location.path("/" + page, "_self");
		};


		/**
		 * Set up num licenses and price
		 */
		function setupLicensesInfo () {
			vm.numLicenses = vm.subscriptions.length;
			vm.numNewLicenses = vm.numLicenses;
			vm.pricePerLicense = vm.plans[0].amount;
		}

		/**
		 * Check if any required input fields is empty
		 *
		 * @returns {boolean}
		 */
		function aRequiredAddressFieldIsEmpty () {
			return (
				angular.isUndefined(vm.newBillingAddress.firstName) ||
				angular.isUndefined(vm.newBillingAddress.lastName) ||
				angular.isUndefined(vm.newBillingAddress.line1) ||
				angular.isUndefined(vm.newBillingAddress.postalCode) ||
				angular.isUndefined(vm.newBillingAddress.city) ||
				angular.isUndefined(vm.newBillingAddress.countryCode)
			);

		}
	}
}());
