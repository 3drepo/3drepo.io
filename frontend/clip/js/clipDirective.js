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
			project: null,
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
		var BBOX_SCALE = 1.0001;
		/*
		 * Init
		 */
		vm.sliderMin = 0;
		vm.sliderMax = 100;
		vm.sliderStep = 0.1;
		vm.sliderPosition = vm.sliderMin;
		vm.axes = ["X", "Y", "Z"];
		vm.selectedAxis = "";
		vm.visible = false;
		vm.account = null;
		vm.project = null;
		vm.normal = null;
		vm.projectTrans = {};
		vm.bbox = null;
		vm.onContentHeightRequest({height: 130});
		vm.units = "m";

		function initClippingPlane (account, project, normal, distance) {
			$timeout(function () {
				var initPosition = (vm.sliderMax - vm.sliderPosition) / vm.sliderMax;
				
				EventService.send(EventService.EVENT.VIEWER.CLEAR_CLIPPING_PLANES);
				if(account && project)
				{
					vm.account = account;
					vm.project = project;
				}	

				if(normal)
					vm.normal = normal;
				if(distance)
					vm.distance = distance;

				if(!vm.normal)
				{
					if(vm.selectedAxis == "")
					{
						//unintiialised clipping plane. reset it
						vm.selectedAxis = "X";					
					}
				}
				else
				{
					//figure out the axis base on the normal
				}

				EventService.send(EventService.EVENT.VIEWER.ADD_CLIPPING_PLANE, 
				{
					axis: translateAxis(vm.selectedAxis),
					normal: vm.normal,
					percentage: initPosition,
					distance: vm.distance,
					account: vm.account,
					project: vm.project
				});
			});
		}

		vm.moveClippingPlane = function () {
			if(vm.account && vm.project)
			{
				vm.account = null;
				vm.project = null;
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

		function determineAxis(callback)
		{
			//translate the normal and compare it to the axis
			var normal_x3d = new x3dom.fields.SFVec3f(vm.normal[0], vm.normal[1], vm.normal[2]);
			var transformedNormal = normal_x3d;

			if(vm.project && vm.account)
			{
				var fullProjectName = vm.account + "__" + vm.project;
				if(vm.projectTrans[fullProjectName])
				{
					transformedNormal = vm.projectTrans[fullProjectName].multMatrixVec(normal_x3d);
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
					point = vm.projectTrans[fullProjectName].multMatrixPnt(point);
					vm.distance = -transformedNormal.dot(point) * BBOX_SCALE;
					vm.account = null;
					vm.project = null;
				}
			}	
			callback();
		}

		function loadClippingPlane(account, project, normal, distance)
		{

			vm.disableWatch = true;

			vm.project = project;
			vm.account = account;
			vm.normal = normal;
			vm.distance = distance;

			determineAxis(
					function(){

						if(vm.visible)
						{
							initClippingPlane(); 
						}
						else
						{
							vm.visible=true; 
						}
							vm.disableWatch = false;
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
				vm.visible = newValue;

				if (newValue )
				{
					initClippingPlane();
				} else {
					EventService.send(EventService.EVENT.VIEWER.CLEAR_CLIPPING_PLANES);
				}
			}
		});

		function updateSliderSettings(callback)
		{
			if(vm.selectedAxis && vm.selectedAxis != ""){

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
			}
			if(callback)
				callback();

		}

		/*
		 * Change the clipping plane axis
		 */
		$scope.$watch("vm.distance", function (newValue) {
			if (newValue != "" && angular.isDefined(newValue)) {
				if(vm.selectedAxis && vm.selectedAxis != ""){
	
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
				

				
					var distanceInverted = max - newValue + min;
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

			}
		});

		/*
		 * Change the clipping plane axis
		 */
		$scope.$watch("vm.selectedAxis", function (newValue) {
			if (!vm.disableWatch && newValue != "" && angular.isDefined(newValue) && vm.show ) {
				updateSliderSettings(vm.moveClippingPlane);	
			}
		});

		/*
		 * Watch the slider position
		 */
		$scope.$watch("vm.sliderPosition", function (newValue) {
			if (!vm.disableWatch && vm.selectedAxis != "" && angular.isDefined(newValue) && vm.show) {
				updateSliderSettings(vm.moveClippingPlane);	
			}
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
						loadClippingPlane(event.value.account, event.value.project, 
							event.value.clippingPlanes[0].normal,
						    event.value.clippingPlanes[0].distance);

					}
				} else {
					vm.visible = false;
					vm.sliderPosition = 0.0;
				}
			}
			else if(event.type === EventService.EVENT.VIEWER.SET_SUBPROJECT_TRANS_INFO)
			{
				vm.projectTrans[event.value.projectNameSpace] = event.value.projectTrans;
			}
			else if(event.type === EventService.EVENT.VIEWER.LOADED)
			{
				vm.bbox = event.value.bbox;
				updateSliderSettings();
			}
			else if(event.type === EventService.EVENT.PROJECT_SETTINGS_READY)
			{
				vm.units = event.value.settings.unit;
			}
		});
	}
}());
