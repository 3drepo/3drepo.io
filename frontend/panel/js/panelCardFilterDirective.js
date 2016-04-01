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

	PanelCardFilterCtrl.$inject = ["$scope", "$timeout"];

	function PanelCardFilterCtrl ($scope, $timeout) {
		var vm = this,
			filterTimeout = null;

		vm.clearFilter = function () {
			vm.filterInputText = "";
		};

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
	}
}());
