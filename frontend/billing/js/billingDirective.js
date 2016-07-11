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

	BillingCtrl.$inject = ["EventService"];

	function BillingCtrl (EventService) {
		var vm = this;

		/*
		 * Init
		 */
		vm.billingHistory = [
			{"Date": "10/04/2016", "Description": "1st payment", "Payment Method": "PayPal", "Amount": 100},
			{"Date": "10/05/2016", "Description": "2nd payment", "Payment Method": "PayPal", "Amount": 100},
			{"Date": "10/06/2016", "Description": "3rd payment", "Payment Method": "PayPal", "Amount": 100}
		];
		if (vm.query.hasOwnProperty("item") &&
			(parseInt(vm.query.item) >= 0) &&
			(parseInt(vm.query.item) < vm.billingHistory.length)) {
			vm.showBilling = true;
			vm.item = parseInt(vm.query.item);
		}
		else {
			vm.showBilling = false;
		}

		vm.home = function () {
			EventService.send(EventService.EVENT.GO_HOME)
		};
	}
}());
