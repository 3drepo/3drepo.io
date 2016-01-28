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
			restrict: 'EA',
			templateUrl: 'clip.html',
			scope: {
				height: "=",
				show: "=",
				visible: "="
			},
			controller: ClipCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	ClipCtrl.$inject = ["$scope", "$timeout", "ViewerService", "EventService"];

	function ClipCtrl($scope, $timeout, ViewerService, EventService) {
		var vm = this;

		vm.sliderMin = 0;
		vm.sliderMax = 100;
		vm.sliderStep = 0.1;
		vm.sliderPosition = vm.sliderMin;
		vm.clipPlane = null;
		vm.axes = ["X", "Y", "Z"];
		vm.selectedAxis = vm.axes[0];

		function initClippingPlane () {
			$timeout(function () {
				vm.clipPlaneID = ViewerService.defaultViewer.addClippingPlane(translateAxis(vm.selectedAxis));
				vm.clipPlane = ViewerService.defaultViewer.getClippingPlane(vm.clipPlaneID);
				moveClippingPlane(vm.sliderPosition);
			});
		}

		function moveClippingPlane(sliderPosition) {
			vm.clipPlane.movePlane((vm.sliderMax - sliderPosition) / vm.sliderMax);
		}

		$scope.$watch("vm.show", function (newValue) {
			if (angular.isDefined(newValue)) {
				if (newValue) {
					if (!vm.clipPlane)
					{
						initClippingPlane();
					}
				}
			}
		});

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

		$scope.$watch("vm.visible", function (newValue, oldValue) {
			if (angular.isDefined(newValue))
			{
				vm.visible = newValue;

				if (newValue)
				{
					initClippingPlane();
				} else {
					ViewerService.defaultViewer.clearClippingPlanes();
				}
			}
		});

		$scope.$watch("vm.selectedAxis", function (newValue) {
			if ((angular.isDefined(newValue) && vm.clipPlane)) {
				// Swap Y and Z axes
				vm.clipPlane.changeAxis(translateAxis(newValue));
				vm.sliderPosition = vm.sliderMin;
			}
		});

		$scope.$watch("vm.sliderPosition", function (newValue) {
			if (vm.clipPlane) {
				moveClippingPlane(newValue);
			} else {
				vm.visible = true;
			}
		});

		$scope.$watch(EventService.currentEvent, function (event) {
			if (event.type === EventService.EVENT.SET_CLIPPING_PLANES) {
				vm.clipPlane = null;

				ViewerService.defaultViewer.clearClippingPlanes();

				if (event.value.hasOwnProperty("clippingPlanes") && event.value.clippingPlanes.length) {
					//ViewerService.defaultViewer.setClippingPlanes(event.value.clippingPlanes);
					vm.selectedAxis   = translateAxis(event.value.clippingPlanes[0].axis);
					vm.sliderPosition = (1.0 - event.value.clippingPlanes[0].percentage) * 100.0;
					initClippingPlane();
					vm.visible = true;
				} else {
					vm.visible = false;
					vm.sliderPosition = 0.0;
				}
			}
		});
	}
}());
