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
				showPage: "&"
			},
			controller: AccountBillingCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountBillingCtrl.$inject = ["$scope", "$http", "$location", "$mdDialog", "$timeout", "UtilsService"];

	function AccountBillingCtrl($scope, $http, $location, $mdDialog, $timeout, UtilsService) {
		var vm = this,
			promise,
			pricePerLicense = 100,
			quotaPerLicense = 10,
			initBillingInfo = {
				postalCode: "LS11 8QT",
				country: "United Kingdom",
				vatNumber: "12398756"
			};

		/*
		 * Init
		 */
		if ($location.search().hasOwnProperty("token")) {
			vm.payPalInfo = "PayPal payment processing. Please do not refresh the page or close the tab.";
			showDialog("paypalDialog.html");
			promise = UtilsService.doPost({token: ($location.search()).token}, "payment/paypal/execute");
			promise.then(function (response) {
				console.log(866, response);
				if (response.status === 200) {
				}
				vm.payPalInfo = "PayPal has finished processing.";
				$timeout(function () {
					$mdDialog.cancel();
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
			vm.quotaUsed = 17.3;
			//vm.quotaAvailable = Math.round(((initData.licenses * quotaPerLicense) - vm.quotaUsed) * 10) / 10; // Round to 1 decimal place
			//vm.numCurrentLicenses = initData.licenses;
			vm.newBillingInfo = angular.copy(initBillingInfo);
			vm.saveSubscriptionDisabled = true;
			vm.saveBillingInfoDisabled = true;
			vm.billingHistory = [
				{"Date": "10/04/2016", "Description": "1st payment", "Payment Method": "PayPal", "Amount": 100},
				{"Date": "10/05/2016", "Description": "2nd payment", "Payment Method": "PayPal", "Amount": 100},
				{"Date": "10/06/2016", "Description": "3rd payment", "Payment Method": "PayPal", "Amount": 100}
			];
			$http.get("/public/data/countries.json").then(function (response) {
				vm.countries = response.data;
			});

			promise = UtilsService.doGet(vm.account + "/subscriptions");
			promise.then(function (response) {
				console.log(response);
				if (response.status === 200) {
					vm.numLicenses = response.data.length;
					vm.numNewLicenses = vm.numLicenses;
				}
			});
		}

		/*
		 * Watch for change in licenses
		 */
		$scope.$watch("vm.numNewLicenses", function (newValue) {
			vm.saveSubscriptionDisabled = (vm.numLicenses === newValue);
		});

		/*
		 * Watch for change in billing info
		 */
		$scope.$watch("vm.newBillingInfo", function (newValue) {
			vm.saveBillingInfoDisabled = angular.equals(initBillingInfo, newValue);
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

		vm.changeSubscription = function () {
			vm.payPalInfo = "Redirecting to PayPal. Please do not refresh the page or close the tab.";
			showDialog("paypalDialog.html");
			var data = {plans: [{plan: "THE-100-QUID-PLAN", quantity: vm.numNewLicenses}]};
			promise = UtilsService.doPost(data, vm.account + "/subscriptions");
			promise.then(function (response) {
				console.log(response);
				if (response.status === 200) {
					location.href = response.data.url;
				}
				else {
					vm.payPalInfo = "Error processing PayPal.";
					$timeout(function () {
						$mdDialog.cancel();
					}, 3000);
				}
			});
		};

		/**
		 * Show a dialog
		 *
		 * @param {String} dialogTemplate
		 */
		function showDialog (dialogTemplate) {
			$mdDialog.show({
				templateUrl: dialogTemplate,
				parent: angular.element(document.body),
				targetEvent: null,
				fullscreen: true,
				scope: $scope,
				preserveScope: true
			});
		}
	}
}());
