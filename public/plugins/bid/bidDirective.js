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
		.directive("bid", bid);

	function bid() {
		return {
			restrict: 'E',
			templateUrl: 'bid.html',
			scope: {},
			controller: BidCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	BidCtrl.$inject = ["$scope", "$location", "StateManager", "Auth", "BidService", "ProjectService"];

	function BidCtrl($scope, $location, StateManager, Auth, BidService, ProjectService) {
		var vm = this,
			promise, projectUserRolesPromise;

		vm.StateManager = StateManager;
		vm.subContractors = [
			{user: "Pinakin"},
			{user: "Carmen"},
			{user: "Henry"}
		];
		vm.notInvitedSubContractors = JSON.parse(JSON.stringify(vm.subContractors));
		vm.invitedSubContractors = [];
		vm.addSubContractorDisabled = true;
		vm.responded = false;
		vm.showStatus = false;

		// Get type of role
		projectUserRolesPromise = ProjectService.getUserRolesForProject();
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
				// Get all packages for project
				promise = BidService.getPackage();
				promise.then(function (response) {
					var i, length;
					vm.packages = response.data;
					for (i = 0, length = vm.packages.length; i < length; i += 1) {
						vm.packages[i].completedByPretty = prettyDate(new Date(vm.packages[i].completedBy));
					}
				});
			}
			else {
				// Dummy code waiting for API
				promise = BidService.getPackage();
				promise.then(function (response) {
					var packages = response.data;
					promise = BidService.getBids(packages[0].name);
					promise.then(function (response) {
						vm.packages = [];
						console.log(response);
						for (i = 0, length = response.data.length; i < length; i += 1) {
							vm.packages.push(packages[0]);
							vm.packages[0].completedByPretty = prettyDate(new Date(vm.packages[0].completedBy));
						}
					});
				});
			}
		});

		$scope.$watch("vm.subContractorIndex", function (newValue) {
			vm.addSubContractorDisabled = !angular.isDefined(newValue);
		});

		$scope.$watch("vm.userIsAMainContractor", function (newValue) {
			if (angular.isDefined(newValue)) {
				if (newValue) {
					vm.summaryTitle = "Summary";
					vm.inviteTitle = "Invite";
					vm.showInput = true;
				}
				else {
					vm.summaryTitle = "Summary";
					vm.inviteTitle = "Bid Status";
					vm.showInput = false;
				}
			}
		});

		$scope.$watchGroup(["vm.name", "vm.site", "vm.budget", "vm.completedBy"], function (newValues) {
			vm.saveDisabled = (
				angular.isUndefined(newValues[0]) ||
				angular.isUndefined(newValues[1]) ||
				angular.isUndefined(newValues[2]) ||
				angular.isUndefined(newValues[3])
			);
			vm.showInfo = false;
		});

		vm.home = function () {
			$location.path("/" + Auth.username, "_self");
		};

		vm.save = function () {
			var data = {
				name: vm.name,
				site: vm.site,
				budget: vm.budget,
				completedBy: new Date(vm.completedBy)
			};
			vm.saveDisabled = true;
			promise = BidService.addPackage(data);
			promise.then(function (response) {
				vm.showInfo = true;
				vm.saveDisabled = (response.statusText === "OK");
				if (vm.saveDisabled) {
					data.completedByPretty = prettyDate(new Date(data.completedBy));
					vm.packages.push(data);
					vm.info = "Package " + vm.name + " saved";
				}
				else {
					vm.info = "Error saving package " + vm.name;
				}
			});
		};

		vm.inviteSubContractor = function () {
			var data = {
				user: vm.notInvitedSubContractors[vm.subContractorIndex].user
			};
			promise = BidService.inviteSubContractor(vm.selectedPackage.name, data);
			promise.then(function (response) {
				if (response.statusText === "OK") {
					vm.invitedSubContractors.push(vm.subContractors[vm.subContractorIndex]);
					vm.invitedSubContractors[vm.invitedSubContractors.length - 1].invitedIcon = "fa fa-circle-thin";
					vm.notInvitedSubContractors.splice(vm.subContractorIndex, 1);
					vm.subContractor = undefined;
				}
			});
		};

		vm.changeAssignIcon = function (index) {
			if (vm.invitedSubContractors[index].invitedIcon === "fa fa-circle-thin") {
				vm.invitedSubContractors[index].invitedIcon = "fa fa-check md-accent";
			}
			else if (vm.invitedSubContractors[index].invitedIcon === "fa fa-check md-accent") {
				vm.invitedSubContractors[index].invitedIcon = "fa fa-remove md-warn";
			}
			else if (vm.invitedSubContractors[index].invitedIcon === "fa fa-remove md-warn") {
				vm.invitedSubContractors[index].invitedIcon = "fa fa-circle-thin";
			}
		};

		vm.acceptInvite = function (accept) {
			if (accept) {
				promise = BidService.acceptInvite(vm.selectedPackage.name);
				promise.then(function (response) {
					if (response.statusText === "OK") {
						console.log(response);
						vm.responded = true;
						vm.response = {
							status: accept ? "accepted" : "declined"
						};
					}
				});
			}
		};

		vm.awardToSubContractor = function (index) {
			var i, length;
			promise = BidService.awardBid(vm.selectedPackage.name, vm.invitedSubContractors[index]._id);
			promise.then(function (response) {
				if (response.statusText === "OK") {
					console.log(response);
					for (i = 0, length = vm.invitedSubContractors.length; i < length; i += 1) {
						if (vm.invitedSubContractors[i].status === "accepted") {
							vm.invitedSubContractors[i].statusIcon = (i === index) ? getStatusIcon("won") : getStatusIcon("lost");
							//vm.invitedSubContractors[i].accepted = false;
						}
					}
				}
			});
		};

		vm.showPackage = function (index) {
			var i, j, lengthI, lengthJ;
			vm.showInput = false;
			vm.showSummary = true;
			vm.showStatus = true;
			vm.packageNotAwarded = true;
			vm.selectedPackage = vm.packages[index];
			if (vm.userIsAMainContractor) {
				promise = BidService.getBids(vm.selectedPackage.name);
				promise.then(function (response) {
					if (response.statusText === "OK") {
						vm.notInvitedSubContractors = JSON.parse(JSON.stringify(vm.subContractors));
						vm.invitedSubContractors = response.data;
						for (i = 0, lengthI = vm.invitedSubContractors.length; i < lengthI; i += 1) {

							if (vm.invitedSubContractors[i].awarded) {
								vm.packageNotAwarded = false;
								vm.invitedSubContractors[i].invitedIcon = getStatusIcon("won");
							}
							else {
								vm.invitedSubContractors[i].invitedIcon = getStatusIcon(vm.invitedSubContractors[i].accepted ? "accepted" : "invited");
							}

							for (j = 0, lengthJ = vm.notInvitedSubContractors.length; j < lengthJ; j += 1) {
								if (vm.notInvitedSubContractors[j].user === vm.invitedSubContractors[i].user) {
									vm.notInvitedSubContractors.splice(j, 1);
									break;
								}
							}
						}
					}
				});
			}
			else {
				promise = BidService.getUserBids(vm.selectedPackage.name);
				promise.then(function (response) {
					var statusText, statusIcon;
					if (response.statusText === "OK") {
						console.log(response);
						vm.responded = (response.data.accepted !== null);
						if (response.data.awarded) {
							statusIcon = getStatusIcon("won");
							statusText = "Won";
						}
						else {
							statusIcon = getStatusIcon(vm.invitedSubContractors[i].accepted ? "accepted" : "invited");
							statusText = (response.data.accepted ? "Accepted" : "Declined");
						}
						vm.response = {
							statusText: statusText,
							statusIcon: statusIcon
						};
					}
				});
			}
		};

		vm.setupAddPackage = function () {
			vm.showInput = true;
			vm.showSummary = false;
		};

		function prettyDate (date) {
			return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
		}

		function getStatusIcon (status) {
			var icon = "";
			if (status === "won") {
				icon = "fa fa-check md-accent";
			}
			else if (status === "lost") {
				icon = "fa fa-remove md-warn";
			}
			else if (status === "accepted") {
				icon = "fa fa-check";
			}
			else if (status === "declined") {
				icon = "fa fa-remove";
			}
			else if (status === "invited") {
				icon = "fa fa-circle-thin";
			}
			return icon;
		}
	}
}());
