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
		.directive("bidList", bidList);

	function bidList() {
		return {
			restrict: 'E',
			templateUrl: 'bidList.html',
			scope: {},
			controller: BidListCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BidListCtrl.$inject = ["StateManager", "ProjectService", "BidService"];

	function BidListCtrl(StateManager, ProjectService, BidService) {
		var vm = this,
			promise, projectUserRolesPromise;

		vm.StateManager = StateManager;

		// Get type of role
		projectUserRolesPromise = ProjectService.getUserRolesForProject();
		projectUserRolesPromise.then(function (data) {
			var i, length;
			for (i = 0, length = data.length; i < length; i += 1) {
				if (data[i] === "MainContractor") {
					vm.userIsAMainContractor = true;
					break;
				}
				else if (data[i] === "SubContractor") {
					vm.userIsAMainContractor = false;
					break;
				}
				else {
					vm.userIsAMainContractor = true;
				}
			}
			if (!vm.userIsAMainContractor) {
				vm.listTitle = "Bids";
				promise = BidService.getPackage();
				promise.then(function (response) {
					var packages = response.data;
					promise = BidService.getUserBid(packages[0].name);
					promise.then(function (response) {
						vm.packages = [];
						if (response.data !== null) {
							vm.packages.push(response.data);
							vm.packages[0].completedByPretty = prettyDate(new Date(vm.packages[0].completedBy));
						}
					});
				});
			}
		});

		vm.showBid = function () {

		};

		function prettyDate (date) {
			return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
		}
	}
}());
