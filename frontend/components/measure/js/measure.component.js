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
				account: '=',
				model: '=',
				settings: '='
			},
			controller: MeasureCtrl,
			controllerAs: "vm"
		});

	MeasureCtrl.$inject = ["$scope", "$element", "EventService", "ModelService"];

	function MeasureCtrl ($scope, $element, EventService, ModelService) {
		var vm = this,
			coords = [null, null],
			screenPos,
			currentPickPoint;

		vm.axisDistance = [0.0, 0.0, 0.0];
		vm.totalDistance = 0.0;

		vm.show = false;
		vm.distance = false;
		vm.allowMove = false;
		vm.units = server_config.units;

		var coordVector = null, vectorLength = 0.0;
		vm.screenPos = [0.0, 0.0];

		//console.log('measure scope', $scope);
		vm.unit = vm.settings.unit;

		EventService.send(EventService.EVENT.VIEWER.REGISTER_MOUSE_MOVE_CALLBACK, {
			callback: function(event) {
				var point = event.hitPnt;
				vm.screenPos = [event.layerX, event.layerY];

				if (vm.allowMove) {
					if (point)
					{
						// TODO: WE don't use X3DOM anymore
						// coords[1] = new x3dom.fields.SFVec3f(point[0], point[1], point[2]);
						// coordVector = coords[0].subtract(coords[1]);
						// vm.axisDistance[0] = Math.abs(coordVector.x).toFixed(3);
						// vm.axisDistance[1] = Math.abs(coordVector.y).toFixed(3);
						// vm.axisDistance[2] = Math.abs(coordVector.z).toFixed(3);

						// vm.totalDistance = coordVector.length().toFixed(3);

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

		$scope.$watch(EventService.currentEvent, function (event) {
			if (event.type === EventService.EVENT.VIEWER.PICK_POINT) {
				if (event.value.hasOwnProperty("position")) {
					// First click, if a point has not been clicked before
					currentPickPoint = event.value.position;
					if (coords[1] === null || coords[0] === null) {
						vm.show = true;
						vm.allowMove = true;
						coords[0] = currentPickPoint;
					}
					else if (vm.allowMove) {
                        vm.show = true;
						vm.allowMove = false;
					} else {
						coords[0] = currentPickPoint;
						coords[1] = null;
						vm.allowMove = true;
					}
				}
			}
		});
	}
}());
