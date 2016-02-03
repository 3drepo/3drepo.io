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

	BidCtrl.$inject = ["$scope", "$location", "StateManager", "BidService", "ProjectService"];

	function BidCtrl($scope, $location, StateManager, BidService, ProjectService) {
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
		vm.packageSelected = false;
		vm.statusInfo = "No package currently selected";

		// Create a project summary
		/*
		promise = ProjectService.createProjectSummary();
		promise.then(function (response) {
			console.log(response);
		});
		*/

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
			console.log(vm.userIsAMainContractor);
			if (vm.userIsAMainContractor) {
				vm.listTitle = "Packages";
				// Get all packages for project
				promise = BidService.getPackage();
				promise.then(function (response) {
					var i, length;
					vm.packages = response.data;
					if (vm.packages.length === 0) {
						vm.summaryInfo = "There are no packages for this project";
						vm.statusInfo = "There are no packages for this project";
					}
					else {
						vm.summaryInfo = "No packages currently selected";
						vm.statusInfo = "No packages currently selected";
						for (i = 0, length = vm.packages.length; i < length; i += 1) {
							vm.packages[i].completedByPretty = prettyDate(new Date(vm.packages[i].completedBy));
						}
					}
				});
			}
			else {
				vm.listTitle = "Bids";
				promise = BidService.getPackage();
				promise.then(function (response) {
					console.log(response);
					var packages = response.data;
					promise = BidService.getUserBid(packages[0].name);
					promise.then(function (response) {
						console.log(response);
						vm.packages = [];
						if (response.data !== null) {
							vm.packages.push(response.data);
							vm.packages[0].completedByPretty = prettyDate(new Date(vm.packages[0].completedBy));
						}
						if (vm.packages.length === 0) {
							vm.summaryInfo = "There are no packages for this project";
							vm.statusInfo = "There are no packages for this project";
						}
						else {
							vm.summaryInfo = "No packages currently selected";
							vm.statusInfo = "No packages currently selected";
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
			var i, length, index;

			/*
			for (i = 0, length = vm.notInvitedSubContractors.length; i < length; i += 1) {
				if (vm.notInvitedSubContractors[i].user === vm.subContractors[vm.subContractorIndex].user) {
					index = i;
					break;
				}
			}
			*/
			var data = {
				user: vm.notInvitedSubContractors[vm.subContractorIndex].user
			};
			promise = BidService.inviteSubContractor(vm.selectedPackage.name, data);
			promise.then(function (response) {
				if (response.statusText === "OK") {
					vm.notInvitedSubContractors[vm.subContractorIndex].accepted = null;
					vm.invitedSubContractors.push(vm.notInvitedSubContractors[vm.subContractorIndex]);
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
					vm.awarded = true;
					vm.inviteTitle = "Status";
					vm.invitedSubContractors[index].accepted = true;
					for (i = 0, length = vm.invitedSubContractors.length; i < length; i += 1) {
						if (vm.invitedSubContractors[i].accepted) {
							vm.invitedSubContractors[i].invitedIcon = (i === index) ? getStatusIcon("won") : getStatusIcon("lost");
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
			vm.packageNotAwarded = true;
			vm.selectedPackage = vm.packages[index];
			if (vm.userIsAMainContractor) {
				promise = BidService.getBids(vm.selectedPackage.name);
				promise.then(function (response) {
					if (response.statusText === "OK") {
						vm.packageSelected = true;
						vm.awarded = false;
						vm.inviteTitle = "Invite";
						vm.notInvitedSubContractors = JSON.parse(JSON.stringify(vm.subContractors));
						vm.invitedSubContractors = response.data;
						for (i = 0, lengthI = vm.invitedSubContractors.length; i < lengthI; i += 1) {

							if (vm.invitedSubContractors[i].accepted === null) {
								vm.invitedSubContractors[i].invitedIcon = getStatusIcon("invited");
							}
							else {
								if (vm.invitedSubContractors[i].awarded) {
									vm.awarded = true;
									vm.inviteTitle = "Status";
									vm.packageNotAwarded = false;
									vm.invitedSubContractors[i].invitedIcon = getStatusIcon("won");
								}
								else {
									vm.invitedSubContractors[i].invitedIcon = getStatusIcon("lost");
								}
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
				promise = BidService.getUserBid(vm.selectedPackage.packageName);
				promise.then(function (response) {
					if (response.statusText === "OK") {
						vm.packageSelected = true;
						if (response.data.awarded === null) {
							vm.awarded = false;
						}
						else if (response.data.awarded) {
							vm.awarded = true;
							vm.statusInfo = "This package has been awarded to you";
							vm.awardIcon = getStatusIcon("won");
						}
						else {
							vm.awarded = true;
							vm.statusInfo = "This package has been awarded";
							vm.awardIcon = getStatusIcon("lost");
						}

						if (response.data.accepted !== null) {
							vm.responded = true;
						}
					}
				});
			}
		};

		vm.setupAddPackage = function () {
			vm.packageSelected = true; // Cheat :-)
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
