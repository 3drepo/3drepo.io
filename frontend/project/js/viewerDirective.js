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
		.directive("viewer", viewer);

	viewer.$inject = ["EventService"];

	function viewer(EventService) {
		return {
			restrict: "E",
			scope: {
				manager: "=",
				account: "@",
				project: "@",
				branch: "@",
				revision: "@",
				name: "@",
				autoInit: "@",
				vrMode: "@",
				at: "@",
				up: "@",
				view: "@",
				eventService: "="
			},
			link: function (scope, element) {
				// Cleanup when destroyed
				element.on('$destroy', function(){
					scope.v.viewer.destroy(); // Remove events watch
				});
			},
			controller: ViewerCtrl,
			controllerAs: "v",
			bindToController: true
		};
	}

	ViewerCtrl.$inject = ["$scope", "$q", "$http", "$element", "serverConfig", "EventService", "$location"];

	function ViewerCtrl ($scope, $q, $http, $element, serverConfig, EventService, $location)
	{
		var v = this;

		v.initialised = $q.defer();
		v.loaded      = $q.defer();

		v.branch   = v.branch ? v.branch : "master";
		v.revision = v.revision ? v.revision : "head";

		v.pointerEvents = "auto";

		if (!angular.isDefined(v.eventService))
		{
			v.EventService = EventService;
		}

		function errCallback(errorType, errorValue)
		{
			v.eventService.sendError(errorType, errorValue);
		}

		function eventCallback(type, value)
		{
			v.eventService.send(type, value);
		}

		$scope.reload = function() {
			v.viewer.loadModel(v.account, v.project, v.branch, v.revision);
		};

		$scope.init = function() {

			v.viewer = new Viewer(v.name, $element[0], v.manager, eventCallback, errCallback);

			var options = {};
			var startLatLon = v.at && v.at.split(',');

			var view = v.view && v.view.split(',');

			view && view.forEach(function(val, i){
				view[i] = parseFloat(val);
			});

			options.view = view;

			var up = v.up && v.up.split(',');
			up && up.forEach(function(val, i){
				up[i] = parseFloat(val);
			});

			options.up = up;

			var showAll = true;

			if(startLatLon){
				showAll = false;
				options.lat = parseFloat(startLatLon[0]),
				options.lon = parseFloat(startLatLon[1]),
				options.y = parseFloat(startLatLon[2])
			}


			v.mapTile = new MapTile(v.viewer, eventCallback, options);
			v.viewer.init({
				showAll : showAll,
				plugins: {
					'mapTile': v.mapTile
				}
			});
			// TODO: Move this so that the attachment is contained
			// within the plugins themselves.
			// Comes free with oculus support and gamepad support
			v.oculus     = new Oculus(v.viewer);
			v.gamepad    = new Gamepad(v.viewer);
			v.gamepad.init();

			v.measure    = new MeasureTool(v.viewer);

			v.collision  = new Collision(v.viewer);

			$scope.reload();

			v.loaded.promise.then(function() {
				// TODO: Move this so that the attachment is contained
				// within the plugins themselves.
				// Comes free with oculus support and gamepad support
				v.oculus     = new Oculus(v.viewer);
				v.gamepad    = new Gamepad(v.viewer);

				v.gamepad.init();

				v.collision  = new Collision(v.viewer);

				v.branch = "master";
				v.revision = "head";

				$http.get(serverConfig.apiUrl(serverConfig.GET_API, v.account + "/" + v.project + "/revision/" + v.branch + "/" + v.revision + "/modelProperties.json")).success(
				function (json, status)
				{
					v.viewer.applyModelProperties(v.account, v.project, json);
				});
			});

			$http.get(serverConfig.apiUrl(serverConfig.GET_API, v.account + "/" + v.project + ".json")).success(
				function(json, status) {
					EventService.send(EventService.EVENT.PROJECT_SETTINGS_READY, {
						account: v.account,
						project: v.project,
						settings: json.properties
				});
			});

		};

		$scope.enterVR = function() {
			v.loaded.promise.then(function() {
				v.oculus.switchVR();
			});
		};

		$scope.$watch(v.branch, function(blah)
		{
			console.log(JSON.stringify(blah));
		});

		$scope.$watch(v.eventService.currentEvent, function(event) {
			if (angular.isDefined(event) && angular.isDefined(event.type)) {
				if (event.type === EventService.EVENT.VIEWER.START_LOADING) {
					v.initialised.resolve();
				} else if (event.type === EventService.EVENT.VIEWER.LOADED) {
					v.loaded.resolve();
				} else {
					v.initialised.promise.then(function() {
						if (event.type === EventService.EVENT.VIEWER.GO_HOME) {
							v.viewer.showAll();
						} else if (event.type === EventService.EVENT.VIEWER.SWITCH_FULLSCREEN) {
							v.viewer.switchFullScreen(null);
						} else if (event.type === EventService.EVENT.VIEWER.ENTER_VR) {
							v.oculus.switchVR();
						} else if (event.type === EventService.EVENT.VIEWER.REGISTER_VIEWPOINT_CALLBACK) {
							v.viewer.onViewpointChanged(event.value.callback);
						} else if (event.type === EventService.EVENT.VIEWER.REGISTER_MOUSE_MOVE_CALLBACK) {
							v.viewer.onMouseMove(event.value.callback);
						} else if (event.type === EventService.EVENT.PROJECT_SETTINGS_READY) {
							if (event.value.account === v.account && event.value.project === v.project)
							{
								v.viewer.updateSettings(event.value.settings);
								v.mapTile.updateSettings(event.value.settings);
							}
						}
					});

					v.loaded.promise.then(function() {
						if (event.type === EventService.EVENT.VIEWER.ADD_PIN) {
							v.viewer.addPin(
								event.value.account,
								event.value.project,
								event.value.id,
								event.value.position,
								event.value.norm,
								event.value.colours,
								event.value.viewpoint);
						} else if (event.type === EventService.EVENT.VIEWER.REMOVE_PIN) {
							v.viewer.removePin(
								event.value.id
							);
						} else if (event.type === EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR) {
							v.viewer.changePinColours(
								event.value.id,
								event.value.colours
							);
						} else if (event.type === EventService.EVENT.VIEWER.CLICK_PIN) {
							v.viewer.clickPin(event.value.id);
						} else if (event.type === EventService.EVENT.VIEWER.SET_PIN_VISIBILITY) {
							v.viewer.setPinVisibility(event.value.id, event.value.visibility);
						} else if (event.type === EventService.EVENT.VIEWER.CLEAR_CLIPPING_PLANES) {
							v.viewer.clearClippingPlanes();
						} else if (event.type === EventService.EVENT.VIEWER.ADD_CLIPPING_PLANE) {
							v.viewer.addClippingPlane(
								event.value.axis,
								event.value.normal,
								event.value.distance ? event.value.distance : 0,
								event.value.percentage ? event.value.percentage : 0,
								event.value.clipDirection ? event.value.clipDirection : -1,
								event.value.account, event.value.project);
						} else if (event.type === EventService.EVENT.VIEWER.MOVE_CLIPPING_PLANE) {
							v.viewer.moveClippingPlane(event.value.axis, event.value.percentage);
						} else if (event.type === EventService.EVENT.VIEWER.CHANGE_AXIS_CLIPPING_PLANE) {
							v.viewer.moveClippingPlane(event.value.axis, event.value.percentage);
						} else if ((event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED)) {
							v.viewer.highlightObjects(
								event.value.account,
								event.value.project,
								event.value.id ? [event.value.id] : event.value.ids,
								event.value.zoom,
								event.value.colour
							);
						} else if (event.type === EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS) {
							v.viewer.highlightObjects(
								event.value.account,
								event.value.project,
								event.value.id ? [event.value.id] : event.value.ids,
								event.value.zoom,
								event.value.colour
							);
						} else if (event.type === EventService.EVENT.VIEWER.HIGHLIGHT_AND_UNHIGHLIGHT_OBJECTS) {
							v.viewer.highlightAndUnhighlightObjects(
								event.value.account,
								event.value.project,
								event.value.highlight_ids,
								event.value.unhighlight_ids,
								event.value.zoom,
								event.value.colour
							);
						} else if (event.type === EventService.EVENT.VIEWER.BACKGROUND_SELECTED) {
							v.viewer.highlightObjects();
						} else if (event.type === EventService.EVENT.VIEWER.SWITCH_OBJECT_VISIBILITY) {
							v.viewer.switchObjectVisibility(
								event.value.account,
								event.value.project,
								event.value.visible_ids,
								event.value.invisible_ids
							);
						} else if (event.type === EventService.EVENT.VIEWER.SET_CAMERA) {
							v.viewer.setCamera(
								event.value.position,
								event.value.view_dir,
								event.value.up,
								event.value.look_at,
								angular.isDefined(event.value.animate) ? event.value.animate : true,
								event.value.rollerCoasterMode,
								event.value.account,
								event.value.project
							);
						} else if (event.type === EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT) {
							if (angular.isDefined(event.value.promise)) {
								event.value.promise.resolve(v.manager.getCurrentViewer().getCurrentViewpointInfo(event.value.account, event.value.project));
							}
						} else if (event.type === EventService.EVENT.VIEWER.GET_SCREENSHOT) {
							if (angular.isDefined(event.value.promise)) {
								event.value.promise.resolve(v.manager.getCurrentViewer().runtime.getScreenshot());
							}
						} else if (event.type === EventService.EVENT.VIEWER.SET_NAV_MODE) {
							v.manager.getCurrentViewer().setNavMode(event.value.mode);
						} else if (event.type === EventService.EVENT.MEASURE_MODE) {
							v.measure.measureMode(event.value);
						} else if (event.type === EventService.EVENT.VIEWER.UPDATE_URL){
							//console.log('update url!!');
							$location.path("/" + v.account + '/' + v.project).search({
								at: event.value.at,
								view: event.value.view,
								up: event.value.up
							});
						} else if (event.type === EventService.EVENT.MULTI_SELECT_MODE) {
							v.viewer.setMultiSelectMode(event.value);
						} else if (event.type === EventService.EVENT.PIN_DROP_MODE) {
							v.viewer.setPinDropMode(event.value);
						}
					});
				}
			}
		});

		$scope.init();

		if (angular.isDefined(v.vrMode))
		{
			$scope.enterVR();
		}
	}
}());
