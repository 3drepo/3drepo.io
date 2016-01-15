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

	BidCtrl.$inject = ["$scope", "$location", "StateManager", "Auth"];

	function BidCtrl($scope, $location, StateManager, Auth) {
		var vm = this;

		vm.StateManager = StateManager;
		vm.subContractors = [
			{name: "Pinakin"},
			{name: "Carmen"},
			{name: "Henry"}
		];
		vm.invitedSubContractors = [];
		vm.addSubContractorDisabled = true;
		//vm.userRole = "mainContractor";
		vm.userRole = "subContractor";
		vm.summary = {
			budget: 45023,
			site: "Wood Lane",
			completed_by: 1464091380000
		};
		vm.response = {
			date_invited: 1464091380000,
			date_responded: 1464091380000,
			date_answered: 1464091380000,
			status: "won"
		};

		$scope.$watch("vm.subContractor", function (newValue) {
			vm.addSubContractorDisabled = !angular.isDefined(newValue);
		});

		$scope.$watch("vm.userRole", function (newValue) {
			if (newValue === "mainContractor") {
				vm.userIsTheMainContractor = true;
				vm.userIsASubContractor = false;
				vm.summaryTitle = "Summary";
				vm.inviteTitle = "Invite";
			}
			else if (newValue === "subContractor") {
				vm.userIsTheMainContractor = false;
				vm.userIsASubContractor = true;
				vm.summaryTitle = "Summary";
				vm.inviteTitle = "Bid Status";
			}
		});

		$scope.$watch("vm.summary", function (newValue) {
			vm.summary.completed_by_pretty = prettyDate(new Date(newValue.completed_by));
		});

		$scope.$watch("vm.response", function (newValue) {
			if (vm.response.status === "won") {
				vm.response.statusIcon = "fa fa-check md-accent";
			}
			else if (vm.response.status === "lost") {
				vm.response.statusIcon = "fa fa-remove md-warn";
			}
			else if (vm.response.status === "accepted") {
				vm.response.statusIcon = "fa fa-check";
			}
			else if (vm.response.status === "declined") {
				vm.response.statusIcon = "fa fa-remove";
			}
			else if (vm.response.status === "invited") {
				vm.response.statusIcon = "fa fa-circle-thin";
			}

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

		vm.home = function () {
			$location.path("/" + Auth.username, "_self");
		};

		vm.addSubContractor = function () {
			var i, length, index ;
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

		var prettyDate = function (date) {
			return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
		};
	}
}());
