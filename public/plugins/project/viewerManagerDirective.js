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

(function() {
	"use strict";

	angular.module("3drepo")
		.directive("viewermanager", viewerManager);

	function viewerManager() {
		return {
			restrict: "E",
			controller: ViewerManagerCtrl,
			scope: true,
			templateUrl: "viewermanager.html",
			controllerAs: "vm",
			bindToController: true
		};
	}

	ViewerManagerCtrl.$inject = ["$scope", "$q", "$element", "EventService"];

	function ViewerManagerCtrl($scope, $q, $element, EventService) {
		var vm = this;
		
		vm.manager = new ViewerManager($element[0]);

		vm.viewers = {};

		$scope.manager = vm.manager;

		vm.viewerInit = $q.defer();
		vm.viewerLoaded = $q.defer();
		
		$scope.$watch(EventService.currentEvent, function(event) {
			if (angular.isDefined(event)) {
				if (event.type === EventService.EVENT.CREATE_VIEWER) {
					// If a viewer with the same name exists already then
					// throw an error, otherwise add it
					if (vm.viewers.hasOwnProperty(event.value.name)) {
						EventService.sendError(EventService.ERROR.DUPLICATE_VIEWER_NAME, {
							name: event.value.name
						});
					}

					vm.viewers[event.value.name] = event.value;
				} else if (event.type === EventService.EVENT.CLOSE_VIEWER) {
					// If the viewer exists in the list then delete it
					if (vm.viewers.hasOwnProperty(event.value.name)) {
						delete vm.viewers[event.value.name];
					}
				} else if (event.type === EventService.EVENT.VIEWER.READY) {
					window.viewer = vm.manager.getCurrentViewer();
				} else if (event.type === EventService.EVENT.VIEWER.START_LOADING) {
					vm.viewerInit.resolve();
				} else if (event.type === EventService.EVENT.VIEWER.LOADED) {
					vm.viewerLoaded.resolve();
				} else {
					vm.viewerInit.promise.then(function() {
						if (event.type === EventService.EVENT.VIEWER.GO_HOME) {
							vm.manager.getCurrentViewer().showAll();
						} else if (event.type === EventService.EVENT.VIEWER.ENTER_FULLSCREEN) {
							vm.manager.getCurrentViewer().switchFullScreen(null);
						} else if (event.type === EventService.EVENT.VIEWER.ENTER_VR) {
							vm.manager.getCurrentViewer().switchVR();
						} else if (event.type === EventService.EVENT.VIEWER.REGISTER_VIEWPOINT_CALLBACK) {
							vm.manager.getCurrentViewer().onViewpointChanged(event.value.callback);
						}
					});

					vm.viewerLoaded.promise.then(function() {
						if (event.type === EventService.EVENT.VIEWER.ADD_PIN) {
							vm.manager.getCurrentViewer().addPin(
								event.value.account,
								event.value.project,
								event.value.id,
								event.value.position,
								event.value.norm,
								event.value.colours,
								event.value.viewpoint);
						} else if (event.type === EventService.EVENT.VIEWER.REMOVE_PIN) {
							vm.manager.getCurrentViewer().removePin(
								event.value.id
							);
						} else if (event.type === EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR) {
							vm.manager.getCurrentViewer().changePinColours(
								event.value.id,
								event.value.colours
							);
						} else if (event.type === EventService.EVENT.VIEWER.CLICK_PIN) {
							vm.manager.getCurrentViewer().clickPin(event.value.id);
						} else if (event.type === EventService.EVENT.VIEWER.CLEAR_CLIPPING_PLANES) {
							vm.manager.getCurrentViewer().clearClippingPlanes();
						} else if (event.type === EventService.EVENT.VIEWER.ADD_CLIPPING_PLANE) {
							vm.manager.getCurrentViewer().addClippingPlane(
								event.value.axis,
								event.value.distance ? event.value.distance : 0,
								event.value.percentage ? event.value.percentage : 0,
								event.value.clipDirection ? event.value.clipDirection : -1);
						} else if (event.type === EventService.EVENT.VIEWER.MOVE_CLIPPING_PLANE) {
							vm.manager.getCurrentViewer().moveClippingPlane(event.value.percentage);
						} else if (event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED) {
							vm.manager.getCurrentViewer().highlightObjects(
								event.value.account,
								event.value.project,
								event.value.id,
								event.value.ids ? event.value.ids : [event.value.id]
							);
						} else if (event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
							vm.manager.getCurrentViewer().highlightObjects();
						} else if (event.type === EventService.EVENT.VIEWER.SWITCH_OBJECT_VISIBILITY) {
							vm.manager.getCurrentViewer().switchObjectVisibility(
								event.value.account,
								event.value.project,
								event.value.id,
								event.value.ids ? event.value.ids : [event.value.id],
								event.value.state
							);
						} else if (event.type === EventService.EVENT.VIEWER.SET_CAMERA) {
							vm.manager.getCurrentViewer().setCamera(
								event.value.position,
								event.value.view_dir,
								event.value.up,
								event.value.animate ? event.value.animate : true
							);
						}
					});
				}
			}
		});
	}

}());