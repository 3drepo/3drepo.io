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
		var vm = this;

		/*
		 * Init
		 */
		vm.subscriptionTypes = {
			band1: {space: 10, collaborators: 5, price: 100},
			band2: {space: 20, collaborators: 10, price: 200},
			band3: {space: 30, collaborators: 15, price: 300},
			band4: {space: 40, collaborators: 20, price: 400},
			band5: {space: 50, collaborators: 25, price: 500}
		};

		vm.goBack = function () {
			vm.showPage({page: vm.callingPage});
		};
	}
}());
