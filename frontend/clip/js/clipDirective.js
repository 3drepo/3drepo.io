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
		vm.distance = 0;
		vm.displayDistance = 0;
		vm.sliderPosition = vm.sliderMin;
		vm.axes = ["X", "Y", "Z"];
		vm.selectedAxis = "";
		vm.visible = false;
		vm.account = null;
		vm.model = null;
		vm.normal = null;
		vm.modelTrans = {};
		vm.offsetTrans = null;
		vm.bbox = null;
		vm.onContentHeightRequest({height: 130});
		vm.units = "m";

		function initClippingPlane () {
			$timeout(function () {
				var initPosition = (vm.sliderMax - vm.sliderPosition) / vm.sliderMax;
		
				if(!vm.normal)
				{	
					if(vm.selectedAxis == "")
					{

						vm.sliderPosition = vm.sliderMin;
						vm.selectedAxis = "X";
						calculateDistanceFromSlider(
							function(){
								updateClippingPlane(true, true, false, false);	
							}		
						);
					}
				}
				EventService.send(EventService.EVENT.VIEWER.CLEAR_CLIPPING_PLANES);


				EventService.send(EventService.EVENT.VIEWER.ADD_CLIPPING_PLANE, 
				{
					axis: translateAxis(vm.selectedAxis),
					normal: vm.normal,
					percentage: initPosition,
					distance: vm.distance,
					account: vm.account,
					model: vm.model
				});
			});
		}

		vm.moveClippingPlane = function () {
			if(vm.account && vm.model)
			{
				vm.account = null;
				vm.model = null;
				vm.normal = null;
				initClippingPlane();	
			}
			else
			{
				EventService.send(EventService.EVENT.VIEWER.MOVE_CLIPPING_PLANE,
				{
					axis: translateAxis(vm.selectedAxis),
					distance: vm.distance
				});
			}
		}

		/**
		 * Determine axis based on vm.normal
		 * @param {function} callback
		 */
		function determineAxis(callback)
		{
			//translate the normal and compare it to the axis
			var normal_x3d = new x3dom.fields.SFVec3f(vm.normal[0], vm.normal[1], vm.normal[2]);
			var transformedNormal = normal_x3d;

			if(vm.model && vm.account)
			{
				var fullModelName = vm.account + "__" + vm.model;
				if(vm.modelTrans[fullModelName])
				{
					transformedNormal = vm.modelTrans[fullModelName].multMatrixVec(normal_x3d);
					transformedNormal.normalize();
					vm.normal = transformedNormal.toGL();
					//Since it's normalized if we only need to check 1 axis
					if(Math.abs(transformedNormal.x) === 1)
					{
						vm.selectedAxis = "X";
						vm.normal = null;
					}
					else if(Math.abs(transformedNormal.y) === 1)
					{
						vm.selectedAxis = "Z";
						vm.normal = null;
					}
					else if (Math.abs(transformedNormal.z) ===1)
					{
						vm.selectedAxis = "Y";
						vm.normal = null;
					}

					var point = normal_x3d.multiply(-vm.distance);
					point = vm.modelTrans[fullModelName].multMatrixPnt(point);
					vm.distance = -transformedNormal.dot(point) ;
					vm.account = null;
					vm.model = null;
				}
			}	
			callback();
		}

		/**
		 * update/create a clipping plane based on the given information
		 * @param {string} account
		 * @param {string} model
		 * @param {array} normal vector
		 * @param {number} distance from bbox
		 */
		function loadClippingPlane(account, model, normal, distance)
		{

			vm.model = model;
			vm.account = account;
			vm.normal = normal;
			vm.distance = distance;

			determineAxis(
					function(){
						updateClippingPlane(true, true, true, false);
						if(vm.visible)
						{
							initClippingPlane(); 
						}
						else
						{
							vm.visible=true;
						}
					}
			)
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
					initClippingPlane();
				} else {
					EventService.send(EventService.EVENT.VIEWER.CLEAR_CLIPPING_PLANES);
				}
			}
		});

		/**
		 * Update clipping plane and its display values
		 * @param {bool} update displayed distance
		 * @param {bool} update displayed axis
		 * @param {bool} update slider position
		 * @param {bool} move the clipping plane
		 */
		function updateClippingPlane(updateDdist, updateDaxis, updateSlider, movePlane)
		{
		
			vm.disableWatchDistance = updateDdist;
			vm.disableWatchSlider = updateSlider;
			vm.disableWatchAxis = updateDaxis;

			updateDisplayValues( updateDdist, updateDaxis, updateSlider);

			if(movePlane)
				vm.moveClippingPlane();

		}

		/**
		 * Returns the normal value based on axis
		 * @return {array} returns normal vector 
		 */
		function getNormal()
		{

			var normal = [1, 0, 0]; //X axis by default
			if(vm.normal)
				normal = vm.normal;
			else if(vm.selectedAxis)
			{
				if(vm.selectedAxis == "Y")
				{
					normal = [0, 0, 1];
				}
				else if(vm.selectedAxis == "Z")
				{
					normal = [0, 1, 0];
				}
			}


			return normal;

		}

		/**
		 * Update display/internal distance base on the internal/display distance
		 * @param {bool} update display distance if set to true, internal distance otherwise
		 */
		function updateDistance(updateDisplayDistance)
		{
			var normal = getNormal();
			var normal_x3d = new x3dom.fields.SFVec3f(normal[0], normal[1], normal[2]);

			var distance = null;
			var trans = null;
			   
			if(updateDisplayDistance)
			{
				distance = vm.distance;
				trans = vm.offsetTrans;
			}
			else
			{
				distance = vm.displayDistance;
				trans = vm.offsetTrans.inverse();
			}


			var transformedNormal = trans.multMatrixVec(normal_x3d);
			transformedNormal.normalize();

			var point = normal_x3d.multiply(-distance);
			point = trans.multMatrixPnt(point);

			return -transformedNormal.dot(point);

		}


		/**
		 * Update display slider based on current internal distance
		 */
		function updateDisplaySlider()
		{
			var min = 0;
			var max = 0;
			if(vm.selectedAxis === "X")
			{
				min = vm.bbox.min.x;
				max = vm.bbox.max.x;
			}
			else if(vm.selectedAxis === "Y")
			{
				min = vm.bbox.min.z;
				max = vm.bbox.max.z;
			}
			else if(vm.selectedAxis === "Z")
			{
				min = vm.bbox.min.y;
				max = vm.bbox.max.y;
			}
			
			var distanceInverted = max - vm.distance + min;
			var percentage = (distanceInverted - min) / (Math.abs(max - min)/100) ;
			if(percentage < vm.sliderMin)
			{
				percentage = vm.sliderMin;
			}
			else if(percentage > vm.sliderMax)
			{
				percentage = vm.sliderMax;
			}
			vm.sliderPosition = percentage;

		}

		/**
		 *  Update display axis based on vm.selectedAxis
		 */
		function updateAxis()
		{
			vm.displayedAxis = vm.selectedAxis;
		}

		/**
		 *  Update values displayed on cards
		 *  @param {bool} update display distance
		 *  @param {bool} update display axis
		 *  @param {bool} update slider position
		 */
		function updateDisplayValues(changeDistance, changeAxis, changeSlider) {
			if(changeDistance)
			{
				vm.displayDistance = updateDistance(true);
			}
			if(changeSlider)
			{
				updateDisplaySlider();
			}
			if(changeAxis)
			{
				updateAxis();
			}

		}

		/**
		 * Calculate distance base on slider position
		 * @param {function} callback
		 */
		function calculateDistanceFromSlider(callback)
		{
				var min = 0;
				var max = 0;
				if(vm.selectedAxis === "X")
				{
					min = vm.bbox.min.x;
					max = vm.bbox.max.x;
				}
				else if(vm.selectedAxis === "Y")
				{
					min = vm.bbox.min.z;
					max = vm.bbox.max.z;
				}
				else if(vm.selectedAxis === "Z")
				{
					min = vm.bbox.min.y;
					max = vm.bbox.max.y;
				}
				var distanceDisplay = Math.abs(max - min)/100 * vm.sliderPosition + min;
				vm.distance = max - distanceDisplay + min;

				if(callback)
				{
					callback();
				}

		}


		/*
		 * Change the clipping plane distance
		 */
		$scope.$watch("vm.displayDistance", function (newValue) {
			if (!vm.disableWatchDistance && newValue != "" && angular.isDefined(newValue)) {
				vm.distance = updateDistance(false);
				updateClippingPlane(false, false, true, true);
			}
			vm.disableWatchDistance = false;
		});


		/*
		 * Change the clipping plane axis
		 */
		$scope.$watch("vm.displayedAxis", function (newValue) {
			if (!vm.disableWatchAxis  && newValue != "" && angular.isDefined(newValue) && vm.show ) {
				vm.selectedAxis = newValue;
				calculateDistanceFromSlider(
					function(){
						updateClippingPlane(true, false, false, true);	
					}
				);
			}
			vm.disableWatchAxis = false;
		});

		/*
		 * Watch the slider position
		 */
		$scope.$watch("vm.sliderPosition", function (newValue) {
			if (!vm.disableWatchSlider && vm.selectedAxis != "" && angular.isDefined(newValue) && vm.show) {
				calculateDistanceFromSlider(
					function(){
						updateClippingPlane(true, false, false, true);	
					}
				);

			}
			vm.disableWatchSlider = false;

		});

		$scope.$watch(EventService.currentEvent, function (event) {
			if (event.type === EventService.EVENT.VIEWER.SET_CLIPPING_PLANES) {
				if (event.value.hasOwnProperty("clippingPlanes") && event.value.clippingPlanes.length) {
					// to avoid firing off multiple initclippingPlane() (vm.visible toggle fires an init)
					if(!event.value.clippingPlanes[0].normal)
					{
						//This is most likely old issue format. 
						console.error("Trying to set clipping plane with no normal value.");

					}
					else 
					{
						loadClippingPlane(event.value.account, event.value.model, 
							event.value.clippingPlanes[0].normal,
						    event.value.clippingPlanes[0].distance);

					}
				} else {
					vm.visible = false;
					vm.sliderPosition = 0.0;
				}
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
				updateClippingPlane(true, true, true, vm.visible);
			}
			else if(event.type === EventService.EVENT.MODEL_SETTINGS_READY)
			{
				vm.units = event.value.settings.unit;
			}
		});
	}
}());
