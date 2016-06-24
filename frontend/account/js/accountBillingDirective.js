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

	AccountBillingCtrl.$inject = ["$scope", "$http", "$element"];

	function AccountBillingCtrl($scope, $http, $element) {
		var vm = this,
			pricePerLicense = 100,
			quotaPerLicense = 10;

		/*
		 * Init
		 */
		vm.showInfo = true;
		vm.numLicenses = 2;
		vm.priceLicenses = vm.numLicenses * pricePerLicense;
		vm.numNewLicenses = 2;
		vm.priceNewLicenses = vm.priceLicenses;
		vm.quotaUsed = 17.3;
		vm.quotaAvailable = Math.round(((vm.numLicenses * quotaPerLicense) - vm.quotaUsed) * 10) / 10; // Round to 1 decimal place
		vm.payButtonDisabled = true;
		vm.postalCode = "LS11 8QT";
		vm.country = "United Kingdom";
		vm.vatNumber = "12398756";
		vm.billingHistory = [
			{date: "10/04/2016", description: "1st payment", paymentMethod: "PayPal", amount: 100},
			{date: "10/05/2016", description: "2nd payment", paymentMethod: "PayPal", amount: 100},
			{date: "10/06/2016", description: "3rd payment", paymentMethod: "PayPal", amount: 100}
		];
		$http.get("/public/data/countries.json").then(function (response) {
			console.log(response);
			vm.countries = response.data;
		});

		$scope.$watch("vm.numNewLicenses", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.priceNewLicenses = newValue * pricePerLicense;
				vm.quotaNew = (newValue * quotaPerLicense);
				vm.payButtonDisabled = (vm.numNewLicenses === vm.numLicenses);
			}
		});

		vm.upgrade = function () {
			vm.showPage({page: "upgrade", callingPage: "billing"});
		};

		vm.downloadBilling = function (index) {
			var doc = new jsPDF();
			console.log(doc);
			doc.setFontSize(20);
			doc.text(20, 20, "3D Repo Billing");
			doc.setFontSize(15);
			doc.setTextColor(0.9, 0.9, 0.9);
			doc.text(20, 30, "Date");
			doc.setTextColor(250, 250, 250);
			doc.text(100, 30, vm.billingHistory[index].date);
			doc.text(20, 40, "Description");
			doc.text(100, 40, vm.billingHistory[index].description);
			doc.text(20, 50, "Payment Method");
			doc.text(100, 50, vm.billingHistory[index].paymentMethod);
			doc.text(20, 60, "Amount");
			doc.text(100, 60, "£" + vm.billingHistory[index].amount);
			doc.save("3D_Repo_Billing_" + vm.billingHistory[index].date.replace("/", "_"));
		};
	}
}());
