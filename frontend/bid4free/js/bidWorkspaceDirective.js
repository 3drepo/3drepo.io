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
		.directive("bidWorkspace", bidWorkspace);

	function bidWorkspace() {
		return {
			restrict: 'E',
			templateUrl: 'bidWorkspace.html',
			scope: {
				packageName: "=",
				inviteAccepted: "=",
				account: "=",
				project: "="
			},
			controller: BidWorkspaceCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BidWorkspaceCtrl.$inject = ["$scope", "$location", "BidService"];

	function BidWorkspaceCtrl($scope, $location, BidService) {
		var vm = this,
			promise;

		vm.items = [
			"Terms and Conditions",
			"Bill of Quantities",
			"Scope of Works",
			"Other"
		];

		$scope.$watch("vm.inviteAccepted", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.showItems = true;
			}
		});

		$scope.$watch("vm.packageName", function (newValue) {
			if (angular.isDefined(newValue)) {
				promise = BidService.getUserBid(newValue);
				promise.then(function (response) {
					if (response.statusText === "OK") {
						vm.showItems = response.data.accepted;
					}
				});
			}
		});

		vm.showInput = function (index) {
			$location
				.path(vm.account + "/" + vm.project + "/bid4free/bid4freeWorkspace", "_self")
				.search({
					package: BidService.currentPackage.name,
					tab: index
				});
		};
	}
}());
