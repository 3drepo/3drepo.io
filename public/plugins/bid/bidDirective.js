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

		$scope.$watch("vm.subContractor", function (newValue) {
			vm.addSubContractorDisabled = !angular.isDefined(newValue);
		});

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
	}
}());
