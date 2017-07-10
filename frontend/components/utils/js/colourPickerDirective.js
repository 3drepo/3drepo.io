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
		.directive("tdrColourPicker", colourPicker);

	function colourPicker() {
		return {
			restrict: 'EA',
			templateUrl: 'colourPicker.html',
			scope: {
				title: "@",
				colour: "=",
				onColourChange: "&",
				offset: "@"
			},
			controller: ColourPickerCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	ColourPickerCtrl.$inject = ["$scope"];

	function ColourPickerCtrl ($scope) {
		var vm = this;

		/*
		 * Init
		 */
		vm.red = 200;
		vm.green = 150;
		vm.blue = 100;

		/*
		 * Watch for slider changes
		 */
		$scope.$watchGroup(["vm.red", "vm.green", "vm.blue"], function (newValues) {
			vm.onColourChange({colour: newValues});
		});

		/*
		 * Watch for parent changing colour
		 */
		$scope.$watch("vm.colour", function (newValue) {
			if (Array.isArray(newValue)) {
				vm.red = newValue[0];
				vm.green = newValue[1];
				vm.blue = newValue[2];
			}
		});

		/**
		 * Open the menu to assign a colour
		 *
		 * @param $mdOpenMenu
		 * @param event
		 */
		vm.open = function($mdOpenMenu, event) {
			$mdOpenMenu(event);
		};
	}
}());
