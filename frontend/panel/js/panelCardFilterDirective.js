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
		.directive("panelCardFilter", panelCardFilter);

	function panelCardFilter() {
		return {
			restrict: 'E',
			templateUrl: 'panelCardFilter.html',
			scope: {
				showFilter: "=",
				filterText: "="
			},
			controller: PanelCardFilterCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	PanelCardFilterCtrl.$inject = ["$scope", "$timeout", "$element"];

	function PanelCardFilterCtrl ($scope, $timeout, $element) {
		var vm = this,
			filterTimeout = null,
			filterInput;

		/**
		 * Reset the filter text
		 */
		vm.clearFilter = function () {
			vm.filterInputText = "";
			filterInput.focus();
			vm.showFilter = false;
		};

		/*
		 * Watch the filter input text
		 */
		$scope.$watch("vm.filterInputText", function (newValue) {
			if (angular.isDefined(newValue)) {
				if (filterTimeout !== null) {
					$timeout.cancel(filterTimeout);
				}
				filterTimeout = $timeout(function() {
					vm.filterText = vm.filterInputText;
					vm.showClearFilterButton = (vm.filterInputText !== "");
				}, 500);
			}
		});

		/*
		 * Watch the showing of the filter and set the focus to it
		 */
		$scope.$watch("vm.showFilter", function (newValue) {
			if (angular.isDefined(newValue) && newValue) {
				$timeout(function () {
					filterInput = angular.element($element[0].querySelector("#panelCardFilterInput"));
					filterInput.focus();
				});
			}
		});
	}
}());
