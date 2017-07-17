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
		.component("panelCardOptionMenu", {
			restrict: 'E',
			templateUrl: 'panel-card-option-menu.html',
			bindings: {
				menu: "=",
				selectedMenuOption: "="
			},
			controller: PanelCardOptionMenuCtrl,
			controllerAs: 'vm',
		});

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
						currentSortIndex = index;
					}
					vm.menu[currentSortIndex].firstSelected = !vm.menu[currentSortIndex].firstSelected;
					vm.menu[currentSortIndex].secondSelected = !vm.menu[currentSortIndex].secondSelected;
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
