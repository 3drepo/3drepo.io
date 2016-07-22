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

	AccountBillingCtrl.$inject = ["$scope", "$location", "UtilsService", "serverConfig"];

	function AccountBillingCtrl($scope, $location, UtilsService, serverConfig) {
		var vm = this,
			promise;

		/*
		 * Init
		 */
		vm.showInfo = true;
		vm.saveDisabled = true;
		vm.countries = serverConfig.countries;

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
				// Cannot change country
				vm.countrySelectDisabled = angular.isDefined(vm.billingAddress.countryCode);
			}
		}, true);

		/*
		 * Watch for change in billing info
		 */
		$scope.$watch("vm.newBillingAddress", function () {
			if (angular.isDefined(vm.newBillingAddress)) {
				if (vm.numNewLicenses !== 0) {
					vm.saveDisabled = angular.equals(vm.newBillingAddress, vm.billingAddress) || aRequiredAddressFieldIsEmpty();
					// Company name required if VAT number exists
					vm.companyNameRequired = (angular.isDefined(vm.newBillingAddress.vat) && (vm.newBillingAddress.vat !== ""));
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

			if (vm.numLicenses === vm.numNewLicenses) {
				vm.payPalInfo = "Updating billing information. Please do not refresh the page or close the tab.";
			}
			else {
				vm.payPalInfo = "Redirecting to PayPal. Please do not refresh the page or close the tab.";
			}
			UtilsService.showDialog("paypalDialog.html", $scope, null, true);
			promise = UtilsService.doPost(data, vm.account + "/subscriptions");
			promise.then(function (response) {
				console.log(response);
				if (response.status === 200) {
					location.href = response.data.url;
				}
				else {
					vm.closeDialogEnabled = true;
					vm.changeHelpToShow = response.data.value;
					vm.payPalInfo = response.data.message;
				}
			});
		};

		vm.goToPage = function (page) {
			$location.path("/" + page, "_self");
		};

		vm.closeDialog = function () {
			UtilsService.closeDialog();
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
				angular.isUndefined(vm.newBillingAddress.countryCode) ||
				(angular.isDefined(vm.newBillingAddress.vat) && (vm.newBillingAddress.vat !== "") && angular.isUndefined(vm.newBillingAddress.companyName))
			);

		}
	}
}());
