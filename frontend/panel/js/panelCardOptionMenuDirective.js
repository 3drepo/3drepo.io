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
		.directive("panelCardOptionMenu", panelCardOptionMenu);

	function panelCardOptionMenu() {
		return {
			restrict: 'E',
			templateUrl: 'panelCardOptionMenu.html',
			scope: {
				menu: "=",
				selectedMenuOption: "="
			},
			controller: PanelCardOptionMenuCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	PanelCardOptionMenuCtrl.$inject = ["$timeout"];

	function PanelCardOptionMenuCtrl ($timeout) {
		var vm = this,
			currentSortIndex;

		/**
		 * Handle a menu selection
		 *
		 * @param {Number} index
		 */
		vm.menuItemSelected = function (index) {
			if (vm.menu[index].hasOwnProperty("toggle")) {
				if (vm.menu[index].toggle) {
					vm.menu[index].selected = !vm.menu[index].selected;
					vm.selectedMenuOption = vm.menu[index];
				}
				else {
					if (index !== currentSortIndex) {
						if (angular.isDefined(currentSortIndex)) {
							vm.menu[currentSortIndex].selected = false;
							vm.menu[currentSortIndex].firstSelected = false;
							vm.menu[currentSortIndex].secondSelected = false;
						}
						currentSortIndex = index;
						vm.menu[currentSortIndex].selected = true;
						vm.menu[currentSortIndex].firstSelected = true;
					}
					else {
						vm.menu[currentSortIndex].firstSelected = !vm.menu[currentSortIndex].firstSelected;
						vm.menu[currentSortIndex].secondSelected = !vm.menu[currentSortIndex].secondSelected;
					}
					vm.selectedMenuOption = vm.menu[currentSortIndex];
				}
			}
			else {
				vm.selectedMenuOption = vm.menu[index];
			}

			// 'Reset' vm.selectedMenuOption so that selecting the same option can be registered down the line
			$timeout(function () {
				vm.selectedMenuOption = undefined;
			});
		};
	}
}());
