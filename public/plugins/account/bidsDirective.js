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
		.directive("bids", bids);

	function bids() {
		return {
			restrict: 'E',
			templateUrl: 'bids.html',
			scope: {},
			controller: BidsCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BidsCtrl.$inject = ["$scope", "AccountData", "BidService", "ProjectService"];

	function BidsCtrl($scope, AccountData, BidService, ProjectService) {
		var vm = this,
			projectUserRolesPromise;

		vm.AccountData = AccountData;
		vm.userIsASubContractor = false;
		vm.projectSelected = false;

		$scope.$watch("vm.AccountData", function (newValue, oldValue) {
			var promise;

			if (newValue.projects.length !== oldValue.projects.length) {
				// Get type of role
				projectUserRolesPromise = ProjectService.getUserRoles(vm.AccountData.projects[0].account, vm.AccountData.projects[0].project);
				projectUserRolesPromise.then(function (data) {
					// Determine is user is a main contractor or a sub contractor
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
					if (vm.userIsAMainContractor) {
						promise = BidService.getProjectPackage(vm.AccountData.projects[0].account, vm.AccountData.projects[0].project);
						promise.then(function (response) {
							console.log(response);
							vm.AccountData.projects[0].packages = response.data;
						});
					}
					else {
						vm.AccountData.projects[0].packages = [];
						promise = BidService.getProjectPackage(vm.AccountData.projects[0].account, vm.AccountData.projects[0].project);
						promise.then(function (response) {
							var packages = response.data;
							promise = BidService.getProjectUserBids(
								vm.AccountData.projects[0].account,
								vm.AccountData.projects[0].project,
								packages[0].name);
							promise.then(function (response) {
								vm.AccountData.projects[0].packages.push({name: response.data.packageName});
							});
						});
					}
				});
			}
		}, true);

		var prettyDate = function (date) {
			return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
		};
	}
}());
