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
		.component("tdrMeasure", {
			restrict: "EA",
			templateUrl: "measure.html",
			bindings: {
				account: "=",
				model: "=",
				settings: "="
			},
			controller: MeasureCtrl,
			controllerAs: "vm"
		});

	MeasureCtrl.$inject = ["$scope", "$element", "EventService", "ModelService", "serverConfig"];


	function MeasureCtrl ($scope, $element, EventService, ModelService, ClientConfigService) {
		var vm = this;

		vm.$onInit = function() {

			vm.show = false;
			vm.distance = false;
			vm.allowMove = false;
			vm.units = serverConfig.units;


			vm.axisDistance = [0.0, 0.0, 0.0];
			vm.totalDistance = 0.0;

			vm.show = false;
			vm.distance = false;
			vm.allowMove = false;
			vm.units = ClientConfigService.units;

			vm.coordVector = null;
			vm.vectorLength = 0.0;
			vm.screenPos = [0.0, 0.0];
			
			// Set the units in unity
			vm.unit = vm.settings.unit;
			UnityUtil.setUnits(vm.units);

			vm.measureMode = false;

			// UnityUtil.prototype.disableMeasuringTool = function(){
			// 	toUnity("StopMeasuringTool", LoadingState.MODEL_LOADING);
			// }

			// UnityUtil.prototype.enableMeasuringTool = function(){
			// 	toUnity("StartMeasuringTool", LoadingState.MODEL_LOADING);
			// }

			// UnityUtil.prototype.setUnits = function(units) {
			// 	toUnity("SetUnits",LoadingState.MODEL_LOADING, units);
			// };
		};

		vm.register = function() {

			EventService.send(EventService.EVENT.VIEWER.REGISTER_MOUSE_MOVE_CALLBACK, {
				callback: function(event) {
					var point = event.hitPnt;
					vm.screenPos = [event.layerX, event.layerY];

					if (vm.allowMove) {
						if (point) {
							// TODO: WE don't use X3DOM anymore
							// vm.coords[1] = new x3dom.fields.SFVec3f(point[0], point[1], point[2]);
							// vm.coordVector = vm.coords[0].subtract(vm.coords[1]);
							// vm.axisDistance[0] = Math.abs(vm.coordVector.x).toFixed(3);
							// vm.axisDistance[1] = Math.abs(vm.coordVector.y).toFixed(3);
							// vm.axisDistance[2] = Math.abs(vm.coordVector.z).toFixed(3);

							// vm.totalDistance = vm.coordVector.length().toFixed(3);

							angular.element($element[0]).css("left", (vm.screenPos[0] + 5).toString() + "px");
							angular.element($element[0]).css("top", (vm.screenPos[1] + 5).toString() + "px");

							$scope.$apply();
							vm.show = true;
						} else {
							vm.show = false;
						}
					}
				}
			});

		};
		
		$scope.$watch(EventService.currentEvent, function (event) {

			if (event.type === EventService.EVENT.VIEWER.PICK_POINT) {
				console.log("Measure - pick point event called");

				if (event.value.hasOwnProperty("position") && vm.measureMode) {

					
					// First click, if a point has not been clicked before
					vm.currentPickPoint = event.value.position;
					if (vm.coords[1] === null || vm.coords[0] === null) {
						vm.show = true;
						vm.allowMove = true;
						vm.coords[0] = vm.currentPickPoint;
					} else if (vm.allowMove) {
						vm.show = true;
						vm.allowMove = false;
					} else {
						vm.coords[0] = vm.currentPickPoint;
						vm.coords[1] = null;
						vm.allowMove = true;
					}
				}
			}

			if (event.type === EventService.EVENT.MEASURE_MODE) {
				vm.measureMode = event.value;

				if (vm.measureMode) {
					UnityUtil.enableMeasuringTool();
				} else {
					UnityUtil.disableMeasuringTool();
				}

			}

		});
	}
}());
