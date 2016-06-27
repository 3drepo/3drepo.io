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

	AccountBillingCtrl.$inject = ["$scope", "$http"];

	function AccountBillingCtrl($scope, $http) {
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

		$scope.$watch("vm.newData", function (newValue) {
				vm.priceLicenses = newValue * pricePerLicense;
				vm.saveButtonDisabled = angular.equals(initData, vm.newData);
		}, true);

		vm.downloadBilling = function (index) {
			var doc = new jsPDF(),
				item,
				itemCount,
				itemY,
				itemIncrementY = 10,
				prefix;

			// Title
			doc.setFontSize(20);
			doc.text(20, 20, "3D Repo Billing");

			// Info
			doc.setFontSize(15);
			itemCount = 0;
			itemY = 30;
			for (item in vm.billingHistory[index]) {
				// "$$hashKey" is added by AngularJS
				if (vm.billingHistory[index].hasOwnProperty(item) && (item !== "$$hashKey")) {
					doc.setTextColor(100, 100, 100);
					doc.text(20, (itemY + (itemIncrementY * itemCount)), item);
					doc.setTextColor(50, 50, 50);
					prefix = (item === "Amount") ? "£" : "";
					doc.text(80, (itemY + (itemIncrementY * itemCount)), prefix + vm.billingHistory[index][item].toString());
					itemCount += 1;
				}
			}

			// Save
			doc.save("3D_Repo_Billing_" + vm.billingHistory[index].Date.replace("/", "_"));
		};
	}
}());
