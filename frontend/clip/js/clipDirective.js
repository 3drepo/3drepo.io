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

		/*
		 * Init
		 */
		vm.sliderMin = 0;
		vm.sliderMax = 100;
		vm.sliderStep = 0.1;
		vm.sliderPosition = vm.sliderMin;
		vm.axes = ["X", "Y", "Z"];
		vm.selectedAxis = vm.axes[0];
		vm.visible = false;
		vm.account = null;
		vm.project = null;
		vm.normal = null;
		vm.onContentHeightRequest({height: 130});

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
				EventService.send(EventService.EVENT.VIEWER.ADD_CLIPPING_PLANE, 
				{
					axis: vm.selectedAxis? translateAxis(vm.selectedAxis) : "",
					normal: vm.normal,
					percentage: initPosition,
					distance: vm.distance,
					account: vm.account,
					project: vm.project
				});
			});
		}

		function moveClippingPlane(sliderPosition) {
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
					percentage: (vm.sliderMax - sliderPosition) / vm.sliderMax
				});

			}
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
			} else {
				return "X";
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

		/*
		 * Change the clipping plane axis
		 */
		$scope.$watch("vm.selectedAxis", function (newValue) {
			if (newValue != "" && angular.isDefined(newValue) && vm.show ) {
				if(vm.account && vm.project)
				{
					vm.account = null;
					vm.project = null;
					vm.normal = null;
					initClippingPlane();	
				}
				else
				{
					EventService.send(EventService.EVENT.VIEWER.CHANGE_AXIS_CLIPPING_PLANE,
					{
						axis: translateAxis(newValue)
					});

				}
			}
		});

		/*
		 * Watch the slider position
		 */
		$scope.$watch("vm.sliderPosition", function (newValue) {
			if (vm.selectedAxis != "" && angular.isDefined(newValue) && vm.show) {
				vm.distance = 0; //reset the distance
				moveClippingPlane(newValue);
			}
		});

		$scope.$watch(EventService.currentEvent, function (event) {
			if (event.type === EventService.EVENT.VIEWER.SET_CLIPPING_PLANES) {
				if (event.value.hasOwnProperty("clippingPlanes") && event.value.clippingPlanes.length) {
					var axis = event.value.clippingPlanes[0].axis;
					vm.selectedAxis   = axis == ""?axis : translateAxis(axis);
					vm.sliderPosition = (1.0 - event.value.clippingPlanes[0].percentage) * 100.0;
					vm.project = event.value.project;
					vm.account = event.value.account;
					vm.normal = event.value.clippingPlanes[0].normal;
					vm.distance = event.value.clippingPlanes[0].distance;
					// to avoid firing off multiple initclippingPlane() (vm.visible toggle fires an init)
					if(vm.visible)
					{

						initClippingPlane(event.value.account, event.value.project, event.value.normal, event.value.distance); 
					}
					else
						vm.visible=true; 
				} else {
					vm.visible = false;
					vm.sliderPosition = 0.0;
				}
			}
		});
	}
}());
