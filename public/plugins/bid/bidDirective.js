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

	BidCtrl.$inject = ["$scope", "$location", "StateManager", "Auth", "BidService"];

	function BidCtrl($scope, $location, StateManager, Auth, BidService) {
		console.log(Auth);
		var vm = this,
			promise = null;

		vm.StateManager = StateManager;
		vm.subContractors = [
			{name: "Pinakin"},
			{name: "Carmen"},
			{name: "Henry"}
		];
		vm.invitedSubContractors = [];
		vm.addSubContractorDisabled = true;
		vm.userRole = "mainContractor";
		//vm.userRole = "subContractor";
		vm.response = {
			date_invited: 1464091380000,
			date_responded: 1464091380000,
			date_answered: 1464091380000,
			status: "won"
		};
		vm.responded = false;
		vm.packages = [];

		promise = BidService.getPackage();
		promise.then(function (data) {
			var i, length;
			console.log(data);
			vm.packages = data;
			for (i = 0, length = vm.packages.length; i < length; i += 1) {
				vm.packages[i].completedByPretty = prettyDate(new Date(vm.packages[i].completedBy));
			}
		});

		$scope.$watch("vm.subContractor", function (newValue) {
			vm.addSubContractorDisabled = !angular.isDefined(newValue);
		});

		$scope.$watch("vm.userRole", function (newValue) {
			if (newValue === "mainContractor") {
				vm.userIsTheMainContractor = true;
				vm.userIsASubContractor = false;
				vm.summaryTitle = "Summary";
				vm.inviteTitle = "Invite";
				vm.showInput = true;
			}
			else if (newValue === "subContractor") {
				vm.userIsTheMainContractor = false;
				vm.userIsASubContractor = true;
				vm.summaryTitle = "Summary";
				vm.inviteTitle = "Bid Status";
				vm.showInput = false;
			}
		});

		$scope.$watch("vm.response", function () {
			vm.response.statusIcon = getStatusIcon(vm.response.status);
			vm.response.selected = false;
			vm.response.completed_by_pretty = prettyDate(new Date(vm.response.completed_by));
			vm.response.date_invited_pretty = prettyDate(new Date(vm.response.date_invited));
			if (vm.response.date_responded !== null) {
				vm.response.date_responded_pretty = prettyDate(new Date(vm.response.date_responded));
			}
			if (vm.response.date_answered !== null) {
				vm.response.date_answered_pretty = prettyDate(new Date(vm.response.date_answered));
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
				console.log(response);
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

		vm.addSubContractor = function () {
			var i, length, index;
			for (i = 0, length = vm.subContractors.length; i < length; i += 1) {
				if (vm.subContractors[i].name === vm.subContractor) {
					index = i;
					break;
				}
			}
			vm.invitedSubContractors.push(vm.subContractors[index]);
			vm.invitedSubContractors[vm.invitedSubContractors.length - 1].invitedIcon = "fa fa-circle-thin";
			vm.subContractors.splice(index, 1);
			vm.subContractor = undefined;
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
			vm.responded = true;
			vm.response = {
				date_invited: 1464091380000,
				date_responded: (new Date()),
				date_answered: null,
				status: accept ? "accepted" : "declined"
			};
		};

		vm.acceptSubContractor = function (index) {
			var i, length;
			for (i = 0, length = vm.chosenSubContractors.length; i < length; i += 1) {
				if (vm.chosenSubContractors[i].status === "accepted") {
					vm.chosenSubContractors[i].statusIcon = (i === index) ? getStatusIcon("won") : getStatusIcon("lost");
					vm.chosenSubContractors[i].accepted = false;
				}
			}
		};

		vm.showPackage = function (index) {
			vm.showInput = false;
			vm.selectedPackage = vm.packages[index];
		};

		vm.setupAddPackage = function () {
			vm.showInput = true;
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
