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
		.directive("accountUpgrade", accountUpgrade);

	function accountUpgrade() {
		return {
			restrict: 'EA',
			templateUrl: 'accountUpgrade.html',
			scope: {
				callingPage: "=",
				showPage: "&"
			},
			controller: AccountUpgradeCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountUpgradeCtrl.$inject = [];

	function AccountUpgradeCtrl() {
		var vm = this,
			pricePerLicense = 100;

		/*
		 * Init
		 */
		vm.numLicenses = 2;
		vm.priceLicenses = vm.numLicenses * pricePerLicense;
		vm.numNewLicenses = 2;
		vm.priceNewLicenses = vm.priceLicenses;
		vm.payButtonDisabled = true;

		vm.goBack = function () {
			vm.showPage({page: vm.callingPage});
		};

		vm.changeLicenses = function (change) {
			if (!((vm.numNewLicenses === 0) && (change === -1))) {
				vm.numNewLicenses += change;
				vm.priceNewLicenses = vm.numNewLicenses * pricePerLicense;
				vm.payButtonDisabled = (vm.numNewLicenses === vm.numLicenses);
			}
		};
	}
}());
