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

	AccountBillingCtrl.$inject = [];

	function AccountBillingCtrl() {
		var vm = this,
			pricePerLicense = 100;

		/*
		 * Init
		 */
		vm.showInfo = true;
		vm.numLicenses = 2;
		vm.priceLicenses = vm.numLicenses * pricePerLicense;
		vm.numNewLicenses = 2;
		vm.priceNewLicenses = vm.priceLicenses;
		vm.quotaUsed = 10.3;
		vm.quotaAvailable = 0.5;
		vm.payButtonDisabled = true;
		vm.billingHistory = [
			{date: "10/04/2016", description: "1st payment", paymentMethod: "PayPal", amount: 100},
			{date: "10/05/2016", description: "2nd payment", paymentMethod: "PayPal", amount: 100},
			{date: "10/06/2016", description: "3rd payment", paymentMethod: "PayPal", amount: 100}
		];

		vm.upgrade = function () {
			vm.showPage({page: "upgrade", callingPage: "billing"});
		};
	}
}());
