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

	BidsCtrl.$inject = ["$scope"];

	function BidsCtrl($scope) {
		var vm = this;

		vm.userIsASubContractor = false;
		vm.invitedProjects = [
			{
				name: "Revit_House",
				status: "won",
				budget: 45023,
				site: "Wood Lane",
				completed_by: 1464091380000,
				date_invited: 1464091380000,
				date_responded: 1464091380000,
				date_answered: 1464091380000
			},
			{
				name: "Camden_Hotel",
				status: "lost",
				budget: 105023,
				site: "Camden Square",
				completed_by: 1467460980000,
				date_invited: 1467460980000,
				date_responded: 1467460980000,
				date_answered: 1467460980000
			},
			{
				name: "Hollywood_Swimming_Pool",
				status: "accepted",
				budget: 905000,
				site: "Hollywood",
				completed_by: 1504353780000,
				date_invited: 1504353780000,
				date_responded: 1504353780000,
				date_answered: null
			},
			{
				name: "Mars_Settlement",
				status: "declined",
				budget: 905000,
				site: "Mars",
				completed_by: 1504353780000,
				date_invited: 1504353780000,
				date_responded: 1504353780000,
				date_answered: null
			},
			{
				name: "Mumbia_Ditch",
				status: "invited",
				budget: 5,
				site: "Mumbai",
				completed_by: 1455453720000,
				date_invited: 1455453720000,
				date_responded: null,
				date_answered: null
			}
		];
		vm.projectSelected = false;

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

		var prettyDate = function (date) {
			return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
		};
	}
}());
