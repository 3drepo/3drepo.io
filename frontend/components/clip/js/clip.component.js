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
		.component("clip", {
			restrict: "EA",
			templateUrl: "templates/clip.html",
			bindings: {
				show: "=",
				visible: "=",
				onContentHeightRequest: "&"
			},
			controller: ClipCtrl,
			controllerAs: "vm"
		});

	ClipCtrl.$inject = ["$scope", "$timeout", "$element", "EventService", "ViewerService", "ClientConfigService"];

	function ClipCtrl($scope, $timeout, $element, EventService, ViewerService, ClientConfigService) {
		var vm = this;

		/*
		 * Init
		 */
		vm.$onInit = function() {
			vm.progressInfo = "Model loading...";
			vm.sliderMin = 0;
			vm.sliderMax = 100;
			vm.sliderStep = 0.005;
			vm.displayDistance = 0.0;
			vm.precision = 3;
			vm.sliderPosition = vm.sliderMin;
			vm.axes = ["X", "Y", "Z"];
			vm.visible = false;
			vm.bbox = null;
			vm.onContentHeightRequest({height: 130});
			vm.direction = false;
			vm.availableUnits = ClientConfigService.units;
			$element.bind("DOMMouseScroll mousewheel onmousewheel", vm.handleScroll);
			$element.bind("keydown", vm.handleUpDownArrow);
		};

		vm.$onDestroy = function() {
			vm.units = undefined;
			vm.bbox = null;
		};

		vm.handleUpDownArrow = function(event) {
			if (event.key) {
				if (event.key === "ArrowUp") {
					vm.increment(0.005);
				} else if (event.key === "ArrowDown") {
					vm.decrement(0.005);
				}
			} 
		};
		
		vm.handleScroll = function(event) {

			// cross-browser wheel delta
			event = window.event || event; // old IE support
			var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));

			if(delta > 0) {
				vm.decrement(0.005);
			} else if(delta < 0) {
				vm.increment(0.005);
			}

		};

		vm.getScaler = function(targetUnit, currentUnit) {
			var scaler = 1;
			
			switch(targetUnit) {
			case "mm":
				if (currentUnit == "cm") {
					scaler = 10;
				}
				if (currentUnit == "m") {
					scaler = 1000;
				}
				break;
			case "cm":
				if (currentUnit == "mm") {
					scaler = 0.1;
				}
				if (currentUnit == "m") {
					scaler = 100;
				}
				break;
			case "m":
				if (currentUnit == "mm") {
					scaler = 0.001;
				}
				if (currentUnit == "cm") {
					scaler = 0.01;
				}
				break;
			}
			
			return scaler;

		};

		// vm.setPrecision = function(newUnit){
		// 	switch(newUnit) {
		// 	case "mm":
		// 		vm.precision = 0;
		// 		break;
		// 	case "cm":
		// 		vm.precision = 3;
		// 		break;
		// 	case "m":
		// 		vm.precision = 5;
		// 		break;
		// 	}
		// };

		vm.invertDirection = function() {
			vm.direction = !vm.direction;
			vm.updateClippingPlane();
		};

		vm.updateClippingPlane = function() {
			
			var scaler = vm.getScaler(vm.modelUnits, vm.units);
			var event = {
				clippingPlanes:[{
					normal: vm.getNormal(),
					distance: vm.displayDistance * scaler,
					clipDirection: vm.direction ? 1 : -1
				}],
				fromClipPanel: true
			};
			EventService.send(
				EventService.EVENT.VIEWER.UPDATE_CLIPPING_PLANES,
				event
			);

		};

		/**
		 * Determine axis based on normal provided
		 * @param normal normal vector
		 */
		vm.determineAxis = function(normal) {
			var res = "";
			if(normal.length === 3) {
				if(normal[1] === 0  && normal[2] === 0) {
					res = "X";
				} else if(normal[0] === 0 && normal[2] === 0) {
					res = "Z";
				} else if(normal[0] === 0 && normal[1] === 0) {
					res = "Y";
				}
			}

			return res;
		};

		/**
		 * Initialise display values
		 * This is called when we know the bounding box of our model
		 */
		vm.setDisplayValues = function(axis, distance, moveClip, slider) {
			vm.disableWatchDistance = vm.disableWatchAxis = vm.disableWatchSlider = true;

			vm.displayDistance = parseFloat(distance);

			vm.displayedAxis = axis;
			if(slider != null) {
				vm.sliderPosition = slider;
				if(moveClip) {
					vm.updateClippingPlane();
				}
			} else {
				vm.updateDisplaySlider(false, moveClip);
			}
		};


		/**
		 * Returns the normal value based on axis
		 * @return {array} returns normal vector 
		 */
		vm.getNormal = function () {

			var normal = [-1, 0, 0]; //X axis by default
			if(vm.normal) {
				normal = vm.normal;
			} else if(vm.displayedAxis) {
				if(vm.displayedAxis == "Y") {
					normal = [0, 0, -1]; //Unity has flipped Z axis
				} else if(vm.displayedAxis == "Z") {
					normal = [0, -1, 0];
				}
			}

			return normal;

		};

		vm.increment = function(percentage) {
			vm.updateDistance( -(vm.displayDistance * percentage) );

		};

		vm.decrement = function(percentage) {
			vm.updateDistance( (vm.displayDistance * percentage) );
		};

		vm.decrementDiscrete = function() {
			vm.updateDistance(-1);
		};

		vm.incrementDiscrete = function() {
			vm.updateDistance(1);
		};

		vm.updateDistance = function(amount) {
			console.log(vm.displayDistance, amount);
			vm.displayDistance += amount;
			vm.cleanDisplayDistance();
			vm.updateDisplaySlider(false, true);
		};

		/**
		 * Update displayed Distance based on slider position and axis
		 */
		vm.updateDisplayedDistance = function(updateSlider, moveClip) {

			var minMax = vm.getMinMax();
			var max = minMax.max;
			var min = minMax.min;
			
			var percentage = 1 - vm.sliderPosition/100;
			if(!updateSlider) {
				vm.disableWatchDistance = true;
			}
			
			var scaler = vm.getScaler(vm.units, vm.modelUnits);
			var newDistance = parseFloat((min + (Math.abs(max - min) * percentage))) * scaler;

			if (!isNaN(newDistance)) {
				vm.displayDistance = newDistance;
				if(moveClip) {
					vm.updateClippingPlane();
				}
			}
			
		};

		vm.unitShouldShow = function(unit) {
			return vm.handleFt(unit.value, vm.modelUnits) || 
					vm.handleMetric(unit.value, vm.modelUnits);
		};

		vm.handleMetric = function(unit){
			var metric = ["cm", "mm", "m"];
			var isMetric = metric.indexOf(unit) !== -1;
			return unit !== "ft" && isMetric;
		};

		vm.handleFt = function(unit) {
			var notMetric = !vm.handleMetric(vm.modelUnits);
			return unit === "ft" && notMetric;
		};

		/**
		 * Update display slider based on current internal distance
		 */
		vm.updateDisplaySlider = function(updateDistance, moveClip) {

			var minMax = vm.getMinMax();
			var max = minMax.max;
			var min = minMax.min;

			var scaler = vm.getScaler(vm.modelUnits, vm.units);

			var percentage = ((vm.displayDistance * scaler) - min) / ( Math.abs(max-min));

			if(!updateDistance) {
				vm.disableWatchSlider = true;
			}

			var value = (1.0 - percentage) * 100;
			if(percentage > 100 || value < 0) {
				value = 0;
			}
			if(percentage < 0 || value > 100) {
				value = 100;
			}
			vm.sliderPosition = value;

			if(moveClip) {
				vm.updateClippingPlane();
			}

		};

		vm.getMinMax = function() {
			var min = 0;
			var max = 0;

			if (vm.bbox) {
				if(vm.displayedAxis === "X") {
					min = vm.bbox.min[0];
					max = vm.bbox.max[0];
				} else if(vm.displayedAxis === "Y") {
					min = vm.bbox.min[2];
					max = vm.bbox.max[2];
				} else if(vm.displayedAxis === "Z") {
					min = vm.bbox.min[1];
					max = vm.bbox.max[1];
				} 
			}

			return {
				min: min,
				max: max
			};
		};

		$scope.$watch("vm.displayDistance", function () {
			vm.updateDisplaySlider(false, vm.visible);
		});

		$scope.$watch("vm.units", function(newUnits, oldUnits){
			if (newUnits && oldUnits) {
				var scaler = vm.getScaler(newUnits, oldUnits);
				vm.displayDistance = vm.displayDistance * scaler;
			}
		});

		vm.cleanDisplayDistance = function() {
			var minMax = vm.getMinMax();
			var scaler = vm.getScaler(vm.units, vm.modelUnits);

			var scaledMin = minMax.min * scaler;
			var scaledMax = minMax.max * scaler;

			if (isNaN(vm.displayDistance) && scaledMin) {
				//console.log("cleanDisplayDistance - isNaN");
				vm.displayDistance = scaledMin;
				return;
			}
			
			if (minMax.max && vm.displayDistance > scaledMax) {
				//console.log(vm.displayDistance, "cleanDisplayDistance - is more than scaled max!", scaledMax, scaler);
				vm.displayDistance = scaledMax;
				return;
			}
		
			if (minMax.min && vm.displayDistance < scaledMin) {
				//console.log(vm.displayDistance, "cleanDisplayDistance - is less than min!", scaledMin, scaler);
				vm.displayDistance = scaledMin;
				return;
			}

		};

		/*
		 * Watch for show/hide of card
		 */
		$scope.$watch("vm.show", function (newValue) {
			console.log(vm.show);
			if (angular.isDefined(newValue)) {
				vm.visible = newValue;
			}
		});

		/*
		 * Toggle the clipping plane
		 */
		$scope.$watch("vm.visible", function (newValue) {
			console.log("vm.visible", vm.visible);
			if (angular.isDefined(newValue)) {
				if (newValue) {
					vm.updateClippingPlane();
				} else {
					ViewerService.clearClippingPlanes();
				}
			}
		});

		/*
		 * Change the clipping plane axis
		 */
		$scope.$watch("vm.displayedAxis", function () {
			if(!vm.disableWatchAxis) {
				vm.updateDisplayedDistance(false, vm.visible);
			}

			vm.disableWatchAxis = false;
		});

		/*
		 * Watch the slider position
		 */
		$scope.$watch("vm.sliderPosition", function () {
			if(!vm.disableWatchSlider) {
				vm.updateDisplayedDistance(false, vm.visible);
			}

			vm.disableWatchSlider = false;

		});

		vm.initClip = function(modelUnits) {
			vm.modelUnits  = modelUnits;
			vm.units = modelUnits;
			console.log(vm.units);
			vm.updateDisplayedDistance(true, vm.visible);
		};

		$scope.$watch(EventService.currentEvent, function (event) {

			if (event.type === EventService.EVENT.VIEWER.CLIPPING_PLANE_BROADCAST) {

				vm.setDisplayValues(vm.determineAxis(event.value.normal), event.value.distance, false);
				vm.updateDisplayedDistance(true, vm.visible);

			} else if(event.type === EventService.EVENT.VIEWER.SET_SUBMODEL_TRANS_INFO) {

				vm.modelTrans[event.value.modelNameSpace] = event.value.modelTrans;
				if(event.value.isMainModel) {
					vm.offsetTrans = event.value.modelTrans;
				}

			} else if(event.type === EventService.EVENT.VIEWER.BBOX_READY) {
				
				vm.bbox = event.value.bbox;
				vm.setDisplayValues("X", vm.bbox.max[0], vm.visible, 0);
				vm.updateDisplayedDistance(true, vm.visible);

			} else if(event.type === EventService.EVENT.MODEL_SETTINGS_READY) {

				vm.initClip(event.value.properties.unit);
				
			}
			
		});

	}
}());

