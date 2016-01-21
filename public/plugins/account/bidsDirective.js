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
			var i, length, promise;

			if (newValue.projects.length !== oldValue.projects.length) {
				// Get type of role
				projectUserRolesPromise = ProjectService.getUserRoles(vm.AccountData.projects[0].account, vm.AccountData.projects[0].project);
				projectUserRolesPromise.then(function (data) {
					var i, length;
					for (i = 0, length = data.length; i < length; i += 1) {
						if (data[i] === "MC") {
							vm.userIsAMainContractor = true;
							break;
						}
						else if (data[i] === "SC") {
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
						// Dummy code waiting for API
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

		/*
		$scope.$watch("vm.invitedProjects", function (newValue) {
			var i, length, date;
			for (i = 0, length = newValue.length; i < length; i += 1) {
				if (newValue[i].status === "won") {
					newValue[i].statusIcon = "fa fa-check md-accent";
				}
				else if (newValue[i].status === "lost") {
					newValue[i].statusIcon = "fa fa-remove md-warn";
				}
				else if (newValue[i].status === "accepted") {
					newValue[i].statusIcon = "fa fa-check";
				}
				else if (newValue[i].status === "declined") {
					newValue[i].statusIcon = "fa fa-remove";
				}
				else if (newValue[i].status === "invited") {
					newValue[i].statusIcon = "fa fa-circle-thin";
				}

				newValue[i].selected = false;
				newValue[i].completed_by_pretty = prettyDate(new Date(newValue[i].completed_by));
				newValue[i].date_invited_pretty = prettyDate(new Date(newValue[i].date_invited));
				if (newValue[i].date_responded !== null) {
					newValue[i].date_responded_pretty = prettyDate(new Date(newValue[i].date_responded));
				}
				if (newValue[i].date_answered !== null) {
					newValue[i].date_answered_pretty = prettyDate(new Date(newValue[i].date_answered));
				}
			}
		});

		vm.selectProject = function (index) {
			vm.projectSelected = true;
			if (angular.isDefined(vm.selectedProjectIndex)) {
				vm.invitedProjects[vm.selectedProjectIndex].selected = false;
			}
			vm.selectedProjectIndex = index;
			vm.invitedProjects[vm.selectedProjectIndex].selected = true;
			vm.showRepondButtons = (vm.invitedProjects[vm.selectedProjectIndex].date_responded === null);
		};

		vm.acceptInvite = function (accept) {
			vm.showRepondButtons = false;
			vm.invitedProjects[vm.selectedProjectIndex].status = accept ? "accepted" : "declined";
			vm.invitedProjects[vm.selectedProjectIndex].statusIcon = accept ? "fa fa-check" : "fa fa-remove";
			vm.invitedProjects[vm.selectedProjectIndex].date_responded = new Date();
			vm.invitedProjects[vm.selectedProjectIndex].date_responded_pretty =
				prettyDate(vm.invitedProjects[vm.selectedProjectIndex].date_responded);
		};
		 */

		var prettyDate = function (date) {
			return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
		};
	}
}());
