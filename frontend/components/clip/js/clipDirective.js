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
		.directive("clip", clip);

	function clip() {
		return {
			restrict: "EA",
			templateUrl: "clip.html",
			scope: {
				show: "=",
				visible: "=",
				onContentHeightRequest: "&"
			},
			controller: ClipCtrl,
			controllerAs: 'vm',
			bindToController: true,
			account: null,
			model: null,
			disableRedefinition: false
		};
	}

	ClipCtrl.$inject = ["$scope", "$timeout", "EventService"];

	function ClipCtrl($scope, $timeout, EventService) {
		var vm = this;
		/**
		 * Bounding box scale avoids flickering at edges
		 * @private
		 * @type {number}
		 */
		/*
		 * Init
		 */
		vm.sliderMin = 0;
		vm.sliderMax = 100;
		vm.sliderStep = 0.1;
		vm.displayDistance = 0;
		vm.sliderPosition = vm.sliderMin;
		vm.axes = ["X", "Y", "Z"];
		vm.visible = false;
		vm.bbox = null;
		vm.onContentHeightRequest({height: 130});
		vm.units = "m";


		function updateClippingPlane()
		{
			if(vm.bbox)
			{
				EventService.send(EventService.EVENT.VIEWER.UPDATE_CLIPPING_PLANES,
					{
						clippingPlanes:[
							{
								normal: getNormal(),
								distance: vm.displayDistance,
								clipDirection: -1
							}
						],
						fromClipPanel: true
					});
			}
		}

		/**
		 * Determine axis based on normal provided
		 * @param normal normal vector
		 */
		function determineAxis(normal)
		{
			var res = "";
			if(normal.length === 3)
			{
				if(normal[1] === 0  && normal[2] === 0)
				{
					res = "X";
				}
				else if(normal[0] === 0 && normal[2] === 0)
				{
					res = "Z";
				}
				else if(normal[0] === 0 && normal[1] === 0)
				{
					res = "Y";
				}
			}

			return res;
		}

		/**
		 * Initialise display values
		 * This is called when we know the bounding box of our model
		 */
		function setDisplayValues(axis, distance, moveClip, slider)
		{
			vm.disableWatchDistance = vm.disableWatchAxis = vm.disableWatchSlider = true;
			vm.displayDistance = distance;
			vm.displayedAxis = axis;
			if(slider != null)
			{
				vm.sliderPosition = slider;
				if(moveClip) updateClippingPlane();
			}
			else
				updateDisplaySlider(false, moveClip);
		}

		/*
		 * Watch for show/hide of card
		 */
		$scope.$watch("vm.show", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.visible = newValue;
			}
		});

		/**
		 * Swap Y and Z axes
		 *
		 * @param {String} axis
		 * @returns {String}
		 */
		function translateAxis(axis)
		{
			if (axis === "Y")
			{
				return "Z";
			} else if (axis === "Z") {
				return "Y";
			} else if(axis === "X") {
				return "X";
			}
			else
			{
				return "";
			}
		}

		/*
		 * Toggle the clipping plane
		 */
		$scope.$watch("vm.visible", function (newValue) {
			if (angular.isDefined(newValue))
			{
				if (newValue )
				{
					updateClippingPlane();
				} else {
					EventService.send(EventService.EVENT.VIEWER.CLEAR_CLIPPING_PLANES);
				}
			}
		});

		/**
		 * Returns the normal value based on axis
		 * @return {array} returns normal vector 
		 */
		function getNormal()
		{

			var normal = [-1, 0, 0]; //X axis by default
			if(vm.normal)
				normal = vm.normal;
			else if(vm.displayedAxis)
			{
				if(vm.displayedAxis == "Y")
				{
					normal = [0, 0, -1]; //Unity has flipped Z axis
				}
				else if(vm.displayedAxis == "Z")
				{
					normal = [0, -1, 0];
				}
			}


			return normal;

		}

		/**
		 * Update displayed Distance based on slider position and axis
		 */
		function updateDisplayedDistance(updateSlider, moveClip)
		{
			var min = 0;
			var max = 0;

			if(vm.displayedAxis === "X")
			{
				min = vm.bbox.min[0];
				max = vm.bbox.max[0];
			}
			else if(vm.displayedAxis === "Y")
			{
				min = vm.bbox.min[2];
				max = vm.bbox.max[2];
			}
			else if(vm.displayedAxis === "Z")
			{
				min = vm.bbox.min[1];
				max = vm.bbox.max[1];
			}
			else
				return; //unknown axis, nothing would've been set. avoid infinity
			
			var percentage = 1 - vm.sliderPosition/100;
			if(!updateSlider)
				vm.disableWatchDistance = true;
			vm.displayDistance = min + (Math.abs(max - min) * percentage);
			if(moveClip)
			{
				updateClippingPlane();
			}

		}

		/**
		 * Update display slider based on current internal distance
		 */
		function updateDisplaySlider(updateDistance, moveClip)
		{
			var min = 0;
			var max = 0;
			if(vm.displayedAxis === "X")
			{
				min = vm.bbox.min[0];
				max = vm.bbox.max[0];
			}
			else if(vm.displayedAxis === "Y")
			{
				min = vm.bbox.min[2];
				max = vm.bbox.max[2];
			}
			else if(vm.displayedAxis === "Z")
			{
				min = vm.bbox.min[1];
				max = vm.bbox.max[1];
			}
			else
				return; //unknown axis, nothing would've been set. avoid infinity
			
			var percentage = (vm.displayDistance - min) / Math.abs(max-min);
			if(!updateDistance)
				vm.disableWatchSlider = true;

			var value = (1.0 - percentage) * 100;
			if(percentage > 100 || value < 0) value = 0;
			if(percentage < 0 || value > 100) value = 100;
			vm.sliderPosition = value;

			if(moveClip)
			{
				updateClippingPlane();
			}

		}

		/*
		 * Change the clipping plane distance
		 */
		$scope.$watch("vm.displayDistance", function (newValue) {
			if(!vm.disableWatchDistance)
			{
				updateDisplaySlider(false, vm.visible);
			}

			vm.disableWatchDistance = false;
		});


		/*
		 * Change the clipping plane axis
		 */
		$scope.$watch("vm.displayedAxis", function (newValue) {
			if(!vm.disableWatchAxis)
			{
				updateDisplayedDistance(false, vm.visible);
			}

			vm.disableWatchAxis = false;
		});

		/*
		 * Watch the slider position
		 */
		$scope.$watch("vm.sliderPosition", function (newValue) {
			if(!vm.disableWatchSlider)
			{
				updateDisplayedDistance(false, vm.visible);
			}

			vm.disableWatchSlider = false;

		});

		$scope.$watch(EventService.currentEvent, function (event) {
			if (event.type === EventService.EVENT.VIEWER.CLIPPING_PLANE_BROADCAST) {
				setDisplayValues(determineAxis(event.value.normal), event.value.distance, false);
			}
			else if(event.type === EventService.EVENT.VIEWER.SET_SUBMODEL_TRANS_INFO)
			{
				vm.modelTrans[event.value.modelNameSpace] = event.value.modelTrans;
				if(event.value.isMainModel)
					vm.offsetTrans = event.value.modelTrans;
			}
			else if(event.type === EventService.EVENT.VIEWER.LOADED)
			{
				vm.bbox = event.value.bbox;
				setDisplayValues("X", vm.bbox.max[0], vm.visible, 0);
			}
			else if(event.type === EventService.EVENT.MODEL_SETTINGS_READY)
			{
				vm.units = event.value.settings.unit;
			}
		});
	}
}());

