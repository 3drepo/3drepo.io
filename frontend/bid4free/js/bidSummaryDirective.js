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
		.directive("bidSummary", bidSummary);

	function bidSummary() {
		return {
			restrict: 'E',
			templateUrl: 'bidSummary.html',
			scope: {
				onSelectPackage: "&"
			},
			controller: BidSummaryCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BidSummaryCtrl.$inject = ["$scope", "BidService"];

	function BidSummaryCtrl($scope, BidService) {
		var vm = this,
			promise;

		vm.showSelectedPackage = false;

		// Get all the packages
		promise = BidService.getPackage();
		promise.then(function (response) {
			var i, length;
			vm.packages = [];
			if ((response.statusText === "OK") && (response.data.length > 0)) {
				vm.packages = response.data;
				vm.packages[0].completedByPretty = prettyDate(new Date(vm.packages[0].completedBy));

				// Select the current package
				if (angular.isDefined(BidService.currentPackage)) {
					for (i = 0, length = vm.packages.length; i < length; i += 1) {
						if (vm.packages[i].name === BidService.currentPackage.name) {
							vm.selectedPackageIndex = i;
							break;
						}
					}
				}
			}
		});

		$scope.$watch("vm.selectedPackageIndex", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.showSelectedPackage = true;
				BidService.currentPackage = vm.packages[newValue];
				vm.packageSorted = [
					{label: "Name", value: vm.packages[newValue].name},
					{label: "Site", value: vm.packages[newValue].site},
					{label: "Budget", value: vm.packages[newValue].budget},
					{label: "Code", value: vm.packages[newValue].code},
					{label: "Area", value: vm.packages[newValue].area},
					{label: "Contact", value: vm.packages[newValue].contact},
					{label: "Completed by", value: BidService.prettyDate(new Date(vm.packages[newValue].completedBy))}
				];
				vm.onSelectPackage({packageName: vm.packages[newValue].name});
			}
		});

		function prettyDate (date) {
			return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
		}
	}
}());
