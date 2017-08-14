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
		.component("rightPanel", {
			restrict: "E",
			bindings: {},
			templateUrl: "templates/right-panel.html",
			controller: RightPanelCtrl,
			controllerAs: "vm"
		});

	RightPanelCtrl.$inject = ["$scope", "$timeout", "EventService"];

	function RightPanelCtrl ($scope, $timeout, EventService) {
		var vm = this;
			
		/*
         * Init
         */
		vm.$onInit = function() {

			vm.highlightBackground = "#FF9800";
			
			vm.addIssueMode = null;
			vm.measureMode = false;
			vm.metaData = false;
			vm.showPanel = true;
			vm.issueButtons = {
				// "scribble": {
				//     label: "Scribble",
				//     icon: "border_color",
				//     background: ""
				// },
				// "erase": {
				//     label: "Erase",
				//     faIcon: "fa fa-eraser",
				//     background: ""
				// },
				// "pin": {
				//     label: "Pin",
				//     icon: "pin_drop",
				//     background: ""
				// }
			};
			vm.measureBackground = "";
			vm.metaBackground = "";
			// $timeout(function () {
			// 	EventService.send(EventService.EVENT.AUTO_META_DATA, vm.metaData);
			// });

		};

		vm.disableOtherModes = function(setMode) {
			if (setMode === "meta") {

				if (vm.measureMode) {
					vm.toggleMeasure();
				} 

				if (!vm.metaData) {
					vm.toggleAutoMetaData();
				}

			} else if (setMode === "measure") {


				if (!vm.measureMode) {
					vm.toggleMeasure();
				} 

			}
		};


		/*
         * Setup event watch
         */
		$scope.$watch(EventService.currentEvent, function(event) {
			if ((event.type === EventService.EVENT.TOGGLE_ISSUE_AREA) && (!event.value.on)) {
				if (vm.addIssueMode !== null) {
					vm.issueButtons[vm.addIssueMode].background = "";
					vm.addIssueMode = null;
				}
			} else if (event.type === EventService.EVENT.SET_ISSUE_AREA_MODE) {
				if (vm.addIssueMode !== event.value) {
					vm.issueButtons[vm.addIssueMode].background = "";
					vm.addIssueMode = event.value;
					vm.issueButtons[vm.addIssueMode].background = vm.highlightBackground;
				}
			} else if (event.type === EventService.EVENT.TOGGLE_ELEMENTS) {
				vm.showPanel = !vm.showPanel;
			}
		});

		/**
         * Set up adding an issue with scribble
         */
		vm.issueButtonClick = function (buttonType) {
			
			// Turn off measure mode
			if (vm.measureMode) {
				vm.measureMode = false;
				vm.measureBackground = "";
				EventService.send(EventService.EVENT.MEASURE_MODE, vm.measureMode);
			}

			if (vm.addIssueMode === null) {
				vm.addIssueMode = buttonType;
				vm.issueButtons[buttonType].background = vm.highlightBackground;
				EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: true, type: buttonType});
			} else if (vm.addIssueMode === buttonType) {
				vm.addIssueMode = null;
				vm.issueButtons[buttonType].background = "";
				EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: false});
			} else {
				vm.issueButtons[vm.addIssueMode].background = "";
				vm.addIssueMode = buttonType;
				vm.issueButtons[vm.addIssueMode].background = vm.highlightBackground;
				EventService.send(EventService.EVENT.SET_ISSUE_AREA_MODE, buttonType);
			}
		};

		/**
         * Toggle measuring tool
         */
		vm.toggleMeasure = function () {

			if (!vm.measureMode && vm.metaData) {
				vm.toggleAutoMetaData();
			}

			//Turn off issue mode
			if (vm.addIssueMode !== null) {
				EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: false});
			}

			vm.measureMode = !vm.measureMode;
			vm.measureBackground = vm.measureMode ? vm.highlightBackground : "";
			EventService.send(EventService.EVENT.MEASURE_MODE, vm.measureMode);
		};

		/**
         * Toggle meta data auto display
         */
		vm.toggleAutoMetaData = function () {

			if (vm.measureMode && !vm.metaData) {
				vm.toggleMeasure();
			}

			vm.metaData = !vm.metaData;
			vm.metaBackground = vm.metaData ? vm.highlightBackground : "";
			EventService.send(EventService.EVENT.AUTO_META_DATA, vm.metaData);
		};
	}
}());
