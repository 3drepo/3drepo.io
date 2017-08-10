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
		.component("measure", {
			restrict: "E",
			bindings: {},
			controller: MeasureCtrl,
			controllerAs: "vm"
		});

	MeasureCtrl.$inject = ["$scope", "EventService"];

	function MeasureCtrl ($scope, EventService) {
		var vm = this;

		vm.$onInit = function() {

			// Set the units in unity
			vm.measureMode = false;

		};

		$scope.$watch(EventService.currentEvent, function (event) {
			
			if(event.type === EventService.EVENT.MODEL_SETTINGS_READY) {

				vm.units = event.value.settings.unit;
				//console.log("measure - vm.units", vm.units);
				UnityUtil.setUnits(vm.units);

			} else if (event.type === EventService.EVENT.MEASURE_MODE) {
				vm.measureMode = event.value;

				if (vm.measureMode) {

					vm.show = true;
					//console.log("measure - Enabling measuring tool in unity")
					UnityUtil.enableMeasuringTool();

				} else {

					vm.show = false;
					//console.log("measure - Disabling measuring tool in unity")
					UnityUtil.disableMeasuringTool();

				}

			}

		});
			
	}
}());
