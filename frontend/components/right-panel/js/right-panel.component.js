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

	RightPanelCtrl.$inject = ["$scope", "$timeout", "EventService", "MeasureService"];

	function RightPanelCtrl ($scope, $timeout, EventService, MeasureService) {
		var vm = this;
			
		/*
         * Init
         */
		vm.$onInit = function() {

			vm.highlightBackground = "#FF9800";
			vm.measureActive = false;
			vm.measureDisabled = false;

			vm.addIssueMode = null;
			
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

		};

		vm.disableOtherModes = function(setMode) {
			if (setMode === "meta") {

				if (vm.measureActive) {
					vm.toggleMeasure();
				} 

				if (!vm.metaData) {
					vm.toggleAutoMetaData();
				}

			} else if (setMode === "measure") {

				if (!vm.measureActive) {
					vm.toggleMeasure();
				} 

			}
		};


		$scope.$watch(function(){
			return MeasureService;
		}, function(){

			if (vm.measureActive !== MeasureService.state.active ) {
				vm.measureActive = MeasureService.state.active;

				// Clear the background of measure tooltip
				if (!vm.measureActive) {
					vm.measureBackground = "";
				} else {
					vm.measureBackground = vm.highlightBackground;
				}
			}

			if (vm.measureDisabled !== MeasureService.state.disabled ) {
				vm.measureDisabled = MeasureService.state.disabled;
				if (vm.measureDisabled) {
					vm.measureBackground = "";
					vm.measureActive = false;
				}
			}
			
		}, true);

		/*
         * Setup event watch
         */
		$scope.$watch(EventService.currentEvent, function(event) {
			if (event.type === EventService.EVENT.SET_ISSUE_AREA_MODE) {
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
			if (vm.measureActive) {
				MeasureService.deactivateMeasure();
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

			// If not measure mode and metadata enabled
			if (!vm.measureActive && vm.metaData) {
				vm.toggleAutoMetaData();
			}

			//Turn off issue mode
			if (vm.addIssueMode !== null) {
				EventService.send(EventService.EVENT.TOGGLE_ISSUE_ADD, {on: false});
			}

			MeasureService.toggleMeasure();
			
		};

		/**
         * Toggle meta data auto display
         */
		vm.toggleAutoMetaData = function () {

			if (vm.measureActive && !vm.metaData) {
				vm.toggleMeasure();
			}

			vm.metaData = !vm.metaData;
			vm.metaBackground = vm.metaData ? vm.highlightBackground : "";
			EventService.send(EventService.EVENT.AUTO_META_DATA, vm.metaData);
		};
	}
}());
