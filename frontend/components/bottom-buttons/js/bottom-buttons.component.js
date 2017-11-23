/**
 *	Copyright (C) 2014 3D Repo Ltd
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
		.component("bottomButtons", {
			restrict: "E",
			templateUrl: "templates/bottom-buttons.html",
			bindings: {},
			controller: BottomButtonsCtrl,
			controllerAs: "vm"
		});

	BottomButtonsCtrl.$inject = ["ViewerService"];

	function BottomButtonsCtrl (ViewerService) {
		var vm = this;

		vm.$onInit = function() {
			vm.showButtons = true;
			vm.showViewingOptionButtons = false;

			vm.viewingOptions = {
				"Helicopter" : { 
					mode: Viewer.NAV_MODES.HELICOPTER
				},
				"Turntable" : {
					mode: Viewer.NAV_MODES.TURNTABLE
				}
			};

			document.addEventListener("click", function(event) {
				// If the click is on the scene somewhere, hide the buttons
				var valid = event && event.target && event.target.classList;
				if (valid && event.target.classList.contains("emscripten")) {
					vm.showViewingOptionButtons = false;
				} 
			}, false);

			vm.selectedViewingOptionIndex = 1;
			
			vm.leftButtons = [];
			vm.leftButtons.push({
				label: "Extent",
				icon: "fa fa-home",
				click: vm.extent
			});

			vm.selectedMode = "Turntable";
			vm.setViewingOption(vm.selectedMode);

		};

		vm.extent = function () {
			ViewerService.goToExtent();
		};

		vm.setViewingOption = function (type) {
			
			if (type !== undefined) {
				// Set the viewing mode
				vm.selectedMode = type;
				ViewerService.setNavMode(vm.viewingOptions[type].mode);
				vm.showViewingOptionButtons = false;
			} else {
				vm.showViewingOptionButtons = !vm.showViewingOptionButtons;
			}
			
		};
		
	}
}());
