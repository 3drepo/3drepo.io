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

	RightPanelCtrl.$inject = [
		"$scope", "$timeout", "EventService",
		"DocsService",  "MeasureService"
	];

	function RightPanelCtrl (
		$scope, $timeout, EventService, 
		DocsService, MeasureService
	) {

		var vm = this;
			
		/*
         * Init
         */
		vm.$onInit = function() {

			vm.highlightBackground = "#FF9800";
			vm.measureActive = false;
			vm.measureDisabled = false;

			vm.metaData = false;
			vm.showPanel = true;
			
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
			if (event.type === EventService.EVENT.TOGGLE_ELEMENTS) {
				vm.showPanel = !vm.showPanel;
			} 
		});


		/**
         * Toggle measuring tool
         */
		vm.toggleMeasure = function () {

			// If not measure mode and metadata enabled
			if (!vm.measureActive && vm.metaData) {
				vm.toggleAutoMetaData();
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
			DocsService.state.active = vm.metaData;
			DocsService.state.show = false;

			//EventService.send(EventService.EVENT.AUTO_META_DATA, vm.metaData);
			//DocsService.active = vm.metaData;

		};

		vm.$onDestroy = function () {
			vm.metaBackground = "";
			vm.measureBackground = "";
			MeasureService.deactivateMeasure();
		};

	}
}());
