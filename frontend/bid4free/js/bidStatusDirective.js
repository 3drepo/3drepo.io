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
		.directive("bidStatus", bidStatus);

	function bidStatus() {
		return {
			restrict: 'E',
			templateUrl: 'bidStatus.html',
			scope: {
				packageName: "=",
				onInviteAccepted: "&"
			},
			controller: BidStatusCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BidStatusCtrl.$inject = ["$scope", "$timeout", "BidService"];

	function BidStatusCtrl($scope, $timeout, BidService) {
		var vm = this,
			promise;

		$scope.$watch("vm.packageName", function (newValue) {
			if (angular.isDefined(newValue)) {
				promise = BidService.getUserBid(newValue);
				promise.then(function (response) {
					if (response.statusText === "OK") {
						if (response.data.accepted === null) {
							vm.invited = true;
						}
						else if (response.data.accepted) {
							vm.accepted = true;
							if (angular.isDefined(BidService.boqTotal)) {
								vm.boqTotal = BidService.boqTotal;
							}
						}
						else {
							vm.declined = true;
						}
					}
				});
			}
		});

		vm.accept = function (accept) {
			promise = BidService.acceptInvite(vm.packageName, accept);
			promise.then(function (response) {
				if (response.statusText === "OK") {
					vm.invited = false;
					if (accept) {
						vm.onInviteAccepted();
						vm.accepted = true;
					}
					else {
						vm.declined = true;
					}
				}
			});
		};

		vm.submit = function () {
			$timeout(function () {
				vm.showSubmitResult = true;
			}, 1000);
		};
	}
}());
