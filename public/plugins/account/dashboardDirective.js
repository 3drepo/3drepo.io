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
		.directive("dashboard", dashboard)
		.directive("dashboardTabContent", dashboardTabContent);

	function dashboard() {
		return {
			restrict: "E",
			templateUrl: "dashboard.html",
			scope: {},
			controller: DashboardCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	DashboardCtrl.$inject = ["$location", "$stateParams", "Auth"];

	function DashboardCtrl($location, $stateParams, Auth) {
		var vm = this,
			i, length;

		// Set up the tabs
		/*
		vm.tabs = [
			{
				name: "Projects",
				content: "projects-list",
				tabOption: null
			},
			{
				name: "Bid 4 Free",
				content: "bids",
				tabOption: "bid4free"
			}

		];
		*/
		vm.tabs = [
			{
				name: "Projects",
				content: "projects-list",
				tabOption: null
			}

		];

		// Select the correct tab on page load
		vm.selectedTab = 0;
		if (angular.isDefined($stateParams.tab)) {
			for (i = 0, length = vm.tabs.length; i < length; i += 1) {
				if (vm.tabs[i].tabOption === $stateParams.tab) {
					vm.selectedTab = i;
					break;
				}
			}
		}

		vm.selectTab = function (index) {
			$location.search('tab', vm.tabs[index].tabOption);
		};
	}

	function dashboardTabContent ($compile) {
		return {
			link: function(scope, element, attributes) {
				var content = angular.element("<" + attributes.dashboardTabContent + ">");
				angular.element(element[0]).append(content);
				$compile(content)(scope);
			}
		};
	}
}());
